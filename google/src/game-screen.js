import React, {Component} from 'react'
import {Container, Row, Col, Navbar, NavbarBrand, ListGroup, ListGroupItem} from 'reactstrap'
import 'bootstrap-material-design/dist/css/bootstrap-material-design.css'
import socketIOClient from "socket.io-client"
import NameScreen from './compnents/name-screen'
import RequestBox from './compnents/request-box'
import QuestionSlide from './compnents/question-slide'

export default class GameScreen extends Component{
  constructor(props){
    super(props);
    this.state = {
      endpoint: "http://localhost:8080/",
      name: '',
      roomNum: 0,
      playerNames: [],
      screen: 'waiting',
      prompt: '',
      slides: [],
      qNum: 0,
      myScore: 0
    };
    this.socket = socketIOClient(this.state.endpoint);
    this.nameSet = this.nameSet.bind(this)
    this.handleSubmitQuery = this.handleSubmitQuery.bind(this)
    this.handleAnsweredPrompt = this.handleAnsweredPrompt.bind(this)
    this.handleQuestionAnswered = this.handleQuestionAnswered.bind(this)
  }

  nameSet(playerName) {
    this.setState({name: playerName})
    let game = this.props.match.params.game;
    this.socket.emit('join game', game, playerName);
  }

  componentDidMount(){
    let game = this.props.match.params.game;
    this.socket.emit('check game', game);
    this.socket.on('rejected', () => {
      window.location = '/';
    })
    this.socket.on('connected to room',(data, players) => {
      let playerList = [];
      for(const player of players){
        playerList.push(player.name)
      }
      this.setState({
        playerNames: playerList,
        roomNum: data
      })
    })
    this.socket.on('players', (players) => {
      let playerList = [];
      let scoreList = []
      for(const player of players){
        playerList.push(player.name)
        scoreList.push(player.score)
      }
      this.setState({playerNames: playerList, playerScores: scoreList})
    })
    this.socket.on('start', () => {
      this.setState({
        screen: 'query'
      })
    })
    this.socket.on('complete', (players) => {
      this.setState({
        screen: 'complete'
      })
      for(let i in players){
        if(players[i].respondant === this.state.name){
          this.setState({
            prompt: players[i].query
          })
        }
      }
    })
    this.socket.on('all in', (results) => {
      let slides = []
      for(let result of results){
        let mix = Math.floor(Math.random * 2)
        if(result.respondant !== this.state.name){
          if(mix === 0){
            slides.push({
              prompt: result.query,
              colors: ['info', 'info'],
              player: result.respondant,
              choices: [result.suggestion, result.response],
              correct: 1,
              active: true
            });
          }else{
            slides.push({
              prompt: result.query,
              colors: ['info', 'info'],
              player: result.respondant,
              choices: [result.response, result.suggestion],
              correct: 0,
              active: true
            });
          }
        }
      }
      this.setState({
        screen: 'guess',
        slides: slides
      })
    })
  }

  handleSubmitQuery(query){
    this.socket.emit('query', query)
    this.setState({
      screen: 'waiting'
    })
  }

  handleAnsweredPrompt(result){
    var answer = result.trim()
    this.socket.emit('answered', answer)
    this.setState({
      screen: 'waiting'
    })
  }

  handleQuestionAnswered(id){
    if(this.state.slides[this.state.qNum].active){
      let newScore = this.state.myScore
      if(id == this.state.slides[this.state.qNum].correct){
        newScore += 10
        let slides = this.state.slides
        slides[this.state.qNum].colors[id] = 'success'
        slides[this.state.qNum].colors[1 - id] = 'info'
        slides[this.state.qNum].active = false
        this.setState({
          slides: slides
        })
      }else{
        let slides = this.state.slides
        slides[this.state.qNum].colors[id] = 'danger'
        slides[this.state.qNum].colors[1 - id] = 'success'
        slides[this.state.qNum].active = false
        this.setState({
          slides: slides
        })
      }
      this.state.myScore = newScore;
      let qNum = this.state.qNum + 1
      if(qNum === this.state.slides.length){
        this.socket.emit('score', this.state.myScore)
        setTimeout(() => {this.setState({screen: 'leaderboard'})},3000)
        
      }else{
        setTimeout(() => {this.setState({qNum: qNum})}, 3000)
      }
    }
  }

  render(){
    if(this.state.name){
      if(this.state.screen === 'waiting'){
        return(
          <div>
            <Navbar className="bg-dark">
              <NavbarBrand className="mr-auto text-light">Room: {this.state.roomNum}</NavbarBrand>
            </Navbar>
            <Container>
              <Row>
                <Col>
                  <ListGroup>
                    {this.state.playerNames.map((member, index) => 
                      <ListGroupItem key={index} className="list-group-item-info list-group-item-action rounded border my-2">{member}</ListGroupItem>
                      )}
                  </ListGroup>
                </Col>
              </Row>
            </Container>
          </div>
        )
      }else if(this.state.screen === 'query'){
        return(<RequestBox prompt={<h4>Enter the beginning of a Google search:</h4>} onFilled={this.handleSubmitQuery} />)
      }else if(this.state.screen === 'complete'){
        return(
          <RequestBox prompt={<div><h4>Enter a search suggestion for:</h4><h5 className="text-danger">{this.state.prompt}</h5></div>} onFilled={this.handleAnsweredPrompt} />
        )
      }else if(this.state.screen === 'guess'){
        return(
          <QuestionSlide 
            choice={this.state.slides[this.state.qNum].choices}
            colors={this.state.slides[this.state.qNum].colors}
            player={this.state.slides[this.state.qNum].player}
            prompt={this.state.slides[this.state.qNum].prompt}
            onAnswered={this.handleQuestionAnswered} />
        )
      }else if(this.state.screen === 'leaderboard'){
        return(
          <div>
            <Navbar className="bg-dark">
              <NavbarBrand className="mr-auto text-light">Room: {this.state.roomNum}</NavbarBrand>
            </Navbar>
            <Container>
              <Row>
                <Col >
                  <ListGroup>
                    {this.state.playerNames.map((member,index) => 
                      <ListGroupItem key={index} className="list-group-item-info list-group-item-action rounded border my-2">
                        <Col>{member}</Col><Col className="text-right">{this.state.playerScores[index]}</Col>
                      </ListGroupItem>
                      )}
                  </ListGroup>
                </Col>
              </Row>
            </Container>
          </div>
        )
      }
    }else{
      return (<NameScreen onNameFilled={this.nameSet}/>)
    }
  }
}