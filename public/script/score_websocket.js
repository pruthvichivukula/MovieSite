active = true;

let ws = new WebSocket('ws://localhost:8080');
//const messages = document.getElementById('messages');
//const wsOpen = document.getElementById('ws-open');
//const wsClose = document.getElementById('ws-close');
//const wsSend = document.getElementById('ws-send');
//const wsInput = document.getElementById('ws-input');

function showMessage(message) {
    console.log(message);
    // if (!messages) {
    //     return;
    // }

    // messages.textContent += `\n${message}`;
    // messages.scrollTop = messages?.scrollHeight;
}

function closeConnection() {
    if (!!ws) {
        ws.close();
    }
}

window.addEventListener('load', () => {
    closeConnection();

    ws = new WebSocket('ws://localhost:8080');

    ws.addEventListener('error', () => {
        showMessage('WebSocket error');
    });

    ws.addEventListener('open', () => {
        showMessage('WebSocket connection established');
    });

    ws.addEventListener('close', () => {
        showMessage('WebSocket connection closed');
    });

    ws.addEventListener('message', (msg) => {
        showMessage(`Received message: ${msg.data}`);
    });
});

//wsClose.addEventListener('click', closeConnection);

/*wsSend.addEventListener('click', () => {
    const val = wsInput?.value;

    if (!val) {
        return;
    } else if (!ws) {
        showMessage('No WebSocket connection');
        return;
    }

    ws.send(val);
    showMessage(`Sent "${val}"`);
    wsInput.value = '';
});*/

console.log("loaded")


 
window.addEventListener('focus', function() {
console.log("window is active!" );
active = true;
});

window.addEventListener('blur', function() {
console.warn("window is not active!" );
active = false;
});
