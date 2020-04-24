const express = require('express')
const http = require('http')
const socketIO = require('socket.io')
const google = require('./google')

const port = 8080

const app = express()
const server = http.createServer(app)
const io = socketIO(server)

var game = 111111;

var rooms = [];

io.on('connection', socket => {

  socket.on('new game', (playerName) => {
    socket.isHost = true
    socket.roomNum = game
    socket.playerName = playerName
    socket.join('room-' + game)
    console.log('Host ' + socket.id + 'placed in room ' + game)
    rooms.push({
      game: game,
      started: false,
      player: [{
        name: playerName,
        query: '',
        respondant: '',
        response: '',
        score: 0,
        end: false
      }]
    })
    socket.emit('connected to room', game)
    game = (game == 999999) ? 111111 : game + 1;
  })

  socket.on('join game', (roomNum, playerName) => {
    let roomIndex = 0
    for(let i in rooms){
      if(rooms[i].game == roomNum){
        if(!rooms[i].started){
          socket.roomNum = roomNum
          socket.playerName = playerName
          socket.join('room-' + roomNum);
          rooms[i].player.push({
            name: playerName,
            query: '',
            respondant: '',
            response: '',
            score: 0,
            end: false
          })
          io.sockets.in('room-' + roomNum).emit('players', rooms[i].player)
          roomIndex = i
        }
      }
    }
    if(socket.roomNum){
      socket.emit('connected to room', roomNum, rooms[roomIndex].player)
    }else{
      console.log('Room ' + roomNum + ' does not exist')
      console.log(rooms)
      socket.emit('rejected')
    }
  })

  socket.on('check game', (roomNum) => {
    for(let i in rooms){
      if(rooms[i].game == roomNum){
        if(!rooms[i].started){
          socket.roomNum = roomNum
        }else{
          socket.emit('rejected')
        }
      }
    }
    if(socket.roomNum){
    }else{
      socket.emit('rejected')
    }
  })

  socket.on('start game', (roomNum) => {
    for(let i in rooms){
      if(rooms[i].game == roomNum){
        if(rooms[i].player.length != 1){
          rooms[i].started = true;
          io.sockets.in('room-' + roomNum).emit('start')
          return
        }
      }
    }
  })

  socket.on('query', (query) => {
    let tempPlayerList = []
    for(let i in rooms){
      if(rooms[i].game == socket.roomNum){
        for(let j in rooms[i].player){
          if(rooms[i].player[j].name == socket.playerName){
            rooms[i].player[j].query = query
          }
          if(rooms[i].player[j].query){
            tempPlayerList.push(rooms[i].player[j])
          }
        }
        io.sockets.in('room-' + socket.roomNum).emit('players', tempPlayerList)
        if(tempPlayerList.length == rooms[i].player.length){
          console.log('All players answered:')
          let offset = Math.floor(Math.random() * (rooms[i].player.length - 1)) + 1
          for(let playIndex = 0; playIndex < rooms[i].player.length; playIndex++){
            let respIndex = ((playIndex - offset) + rooms[i].player.length) % rooms[i].player.length;
            rooms[i].player[playIndex].respondant = rooms[i].player[respIndex].name
          }
          console.log(rooms[i].player)
          io.sockets.in('room-' + socket.roomNum).emit('complete', rooms[i].player)
        }
        return
      }
    }
  })

  socket.on('answered', (answer) => {
    let tempPlayerList = []
    for(let i in rooms){
      if(rooms[i].game == socket.roomNum){
        for(let j in rooms[i].player){
          if(rooms[i].player[j].respondant == socket.playerName){
            rooms[i].player[j].response = answer
          }
          if(rooms[i].player[j].response){
            tempPlayerList.push(rooms[i].player[j])
          }
        }
        io.sockets.in('room-' + socket.roomNum).emit('players', tempPlayerList)
        if(tempPlayerList.length == rooms[i].player.length){
          //io.sockets.in('room-' + socket.roomNum).emit('all in', rooms[i].player)
          //console.log('All players answered:')
          //console.log(rooms[i].player)
          let querys = []
          let slides = []
          for(k in rooms[i].player){
            querys.push(rooms[i].player[k].query)
          }
          google.suggest(querys, (err, suggestions) => {
            if(err){
              console.log(err)
            }
            for(k in rooms[i].player){
              let sendSuggest
              if(!suggestions[k][0]){
                sendSuggest = 'Google doesn\'t know how to respond'
              }else if(suggestions[k][0] == rooms[i].player[k].query){
                sendSuggest = suggestions[k][1]
              }else{
                sendSuggest = suggestions[k][0]
              }
              slides.push({
                name: rooms[i].player[k].name,
                respondant: rooms[i].player[k].respondant,
                response: rooms[i].player[k].response,
                query: rooms[i].player[k].query,
                suggestion: sendSuggest
              })
            }
            io.sockets.in('room-' + socket.roomNum).emit('all in', slides)
            console.log(slides)
          })
        }
        return
      }
    }
  })

  socket.on('score', (score) => {
    let tempPlayerList = []
    for(let i in rooms){
      if(rooms[i].game == socket.roomNum){
        for(let j in rooms[i].player){
          if(rooms[i].player[j].name == socket.playerName){
            rooms[i].player[j].score = score
            rooms[i].player[j].end = true
          }
          if(rooms[i].player[j].end){
            tempPlayerList.push(rooms[i].player[j])
          }
        }
        io.sockets.in('room-' + socket.roomNum).emit('players', tempPlayerList)
        if(tempPlayerList.length == rooms[i].player.length){
          console.log('All players answered:')
          console.log(rooms[i].player)
          io.sockets.in('room-' + socket.roomNum).emit('game done')
        }
        return
      }
    }
  })

  socket.on('disconnect', () => {
    if(socket.isHost){
      console.log('Host of ' + socket.roomNum + ' disconnected')
      for(let i = 0; i < rooms.length; i++){
        if(rooms[i].game == socket.roomNum){
          rooms.splice(i, 1)
        }
      }
      io.sockets.in('room-' + socket.roomNum).emit('rejected')
    }else{
      for(let i = 0; i < rooms.length; i++){
        if(rooms[i].game == socket.roomNum){
          for(let j = 0; j < rooms[i].player.length; j++){
            if(rooms[i].player[j].name == socket.playerName){
              rooms[i].player.splice(j, 1)
            }
          }
        }
        io.sockets.in('room-' + socket.roomNum).emit('players', rooms[i].player)
      }
    }
  })
})

server.listen(port, () => console.log(`Listening on port ${port}`))