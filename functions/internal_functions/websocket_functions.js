const WebSocket = require('ws');


module.exports = {
    initialize_websocket: initialize_websocket,
    update_votes: update_votes
}

var wss;

function initialize_websocket(server){
    wss = new WebSocket.Server({ server: server });
    wss.on("connection", function connection(ws) {
    
        ws.on("message", function message(data, isBinary) {
            wss.clients.forEach(function each(client) {
                console.log("received: %s", data);
                client.send(data, { binary: isBinary });
         });
    
        });
        ws.send("something");
    });
}


function update_votes(votes){
    wss.clients.forEach(function each(client) {
        client.send(votes.toString());
 });
}
