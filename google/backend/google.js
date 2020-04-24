const http = require('http')
const querystring = require('querystring')
const async = require('async')

function suggest(querys, callback){
  let res = []
  async.map(querys, 
    (query, callback) => {
      var params = querystring.stringify({q: query, ie: 'utf_8', oe: 'utf_8', output: 'firefox'})
      http.get('http://suggestqueries.google.com/complete/search?' + params, (res) => {
        const { statusCode } = res;
        let error;
        if (statusCode !== 200) {
          error = new Error('Request Failed.\n' + `Status Code: ${statusCode}`);
        }
        if (error) {
          console.error(error.message);
          res.resume();
          return;
        }
        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(rawData);
            callback(error, parsedData[1])
          } catch (e) {
            console.error(e.message);
          }
        });
      }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
      });
    }, callback)
}

exports.suggest = suggest;