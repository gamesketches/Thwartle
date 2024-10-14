const express = require('express')
const app = express()
const port = 3000

var moveChecker = require('./librarian')

function InterpretYellowLetters(yellowLetterString) {
    return "fucked if I know";
}

function RenderPreviousWord(word, greenLetters, yellowLetterInfo) {
    let returnString = "Your previous word was " + word;
    
}

function InterpretParams(params) {
    console.log("In the func");
    console.log(params);
    if(params.hasOwnProperty('lastWord')) {
        const yellowLetterInfo = InterpretYellowLetters(params.yellowLetters);
        return RenderPreviousWord(params.lastWord, params.greenLetters, yellowLetterInfo);
    }
    else return "Welcome to Thwartle";
}

function DetermineWordValidity(paramsObj) {
    if(!moveChecker.WordExists(paramsObj.word.toUpperCase())) return "That's not a word";
    let greenLetteredWord = "_____";
    for(let i = 0; i < paramsObj.word.length; i++) {
        if(paramsObj.greenLetters[i] == 1) {
            greenLetteredWord = greenLetteredWord.substring(0, i) + paramsObj.word[i] + greenLetteredWord.substring(i + 1);
        }
    }
    let remainingGreenLetterWords = moveChecker.FindWordsForGreenLetters(greenLetteredWord);
    console.log(remainingGreenLetterWords);
    if(remaininGreenLetterWords.length > 1) return "Valid word, on to the next one";
    else if(remainingGreenLetterWords.length <= 1) return "thats the only word";
    else return "no more words with that combo of green letters"
}

app.get('/', (req, res) => {
    res.send(InterpretParams(req.query));
})

app.get('/validWord', (req, res) => {
    console.log(req.query);
    res.send(DetermineWordValidity(req.query));
})

app.post('/', (req, res) => {
    res.send('Got a POST request')
})

app.listen(port, () => {
    moveChecker.initialize();
    console.log('App listenin');
    //console.log(moveChecker.WordExists("SALET"));
})
