const WebSocketServer = require('websocket').server;
const http = require('http');

const serverPort = 1111;

let clients = [];
let history = [];

var server = http.createServer((request, response) => {

});

server.listen(serverPort, function() {
    console.log((new Date()) + " Server is listening on port "
        + serverPort);
  });

let wsServer = new WebSocketServer({
    httpServer: server
});

checkOrigin = (origin) => {
    return true;
}

/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

wsServer.on('request', (request) => {
    console.log((new Date()) + ' Connection from origin '
      + request.origin + '.');

    if(!checkOrigin(request.origin)){
        request.reject();
        return;
    }

    var connection = request.accept(null, request.origin);
    let userName = false;
    var index = clients.push(connection) - 1;

    connection.on('message', (message)=>{
        if (message.type === 'utf8') { // accept only text
            // first message sent by user is their name
             if (userName === false) {
                // remember user name
                userName = htmlEntities(message.utf8Data);
                // get random color and send it back to the user
                //userColor = colors.shift();
                connection.sendUTF(
                    JSON.stringify({ type:'register'}));
                console.log((new Date()) + ' User is known as: ' + userName);
              } else { // log and broadcast the message
                console.log((new Date()) + ' Received Message from '
                            + userName + ': ' + message.utf8Data);
                
                // we want to keep history of all sent messages
                var obj = {
                  time: (new Date()).getTime(),
                  text: htmlEntities(message.utf8Data),
                  author: userName,
                };
                history.push(obj);
                history = history.slice(-100);
                // broadcast message to all connected clients
                var json = JSON.stringify({ type:'message', data: obj });
                for (var i=0; i < clients.length; i++) {
                  clients[i].sendUTF(json);
                }
              }
            }
    });

    connection.on('close', (connection) => {

    });
})