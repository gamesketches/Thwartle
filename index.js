const express = require('express')
const app = express()
const port = 3000

var moveChecker = require('./librarian')

function InterpretParams(params) {
    console.log("In the func");
    for(var i = 0; i < params.length; i++) {
        console.log(params[i])
    }
}

app.get('/', (req, res) => {
    InterpretParams(req.query);
})

app.post('/', (req, res) => {
    res.send('Got a POST request')
})

app.listen(port, () => {
    moveChecker.initialize();
    console.log('App listenin');
    console.log(moveChecker.WordExists("SALET"));
})
