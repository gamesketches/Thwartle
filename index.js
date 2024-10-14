const express = require('express')
const app = express()
const port = 3000

var moveChecker = require('./librarian')

function InsertCharInString(targetString, targetCharacter, index) {
    return targetString.substring(0, index) + targetCharacter + targetString.substring(index + 1);
}

// Game Management Section
function InterpretYellowLetters(yellowLetterString) {
    let yellowStringObj = {};
    for(let i = 0; i < yellowLetterString.length; i+= 2) {
        const letter = yellowLetterString[i].toUpperCase();
        const index = parseInt(yellowLetterString[i+1]);
        if(yellowStringObj.hasOwnProperty(letter)) yellowStringObj[letter].push(index);
        else yellowStringObj[letter] = [index];
    }
    return yellowStringObj;
}

function RenderPreviousWord(word, greenLetters, yellowLetterInfo) {
    let returnString = "Your previous word was " + word;
    
}

function InterpretParams(params) {
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
            greenLetteredWord = InsertCharInString(greenLetteredWord, paramsObj.word[i], i);
        }
    }
    let remainingGreenLetterWords = moveChecker.FindWordsForGreenLetters(greenLetteredWord);
    const yellowLetterObj = InterpretYellowLetters(paramsObj.yellowLetters);
    const finalFilteredList = moveChecker.FindWordsForYellowLetters(remainingGreenLetterWords, yellowLetterObj);
    console.log(finalFilteredList);
    if(finalFilteredList.length > 1) return "Valid word, on to the next one";
    else if(finalFilteredList.length <= 1) return "thats the only word";
    else return "no more words with that combo of green letters"
}

//------------------------------------------------------
// Server listener stuff
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
