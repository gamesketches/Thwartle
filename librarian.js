'use strict'

const fs = require('fs');

var moveChecker = {};
var words = [];

moveChecker.FindWordsForGreenLetters = function(currentGreenLetters){
    return words.filter((word) => {
        for(var i = 0; i < currentGreenLetters.length; i++) {
            if(currentGreenLetters[i] !== "_" && currentGreenLetters[i] !== word[i]) {
                return false;
            }
        }
        return true;
    });
}

moveChecker.FindWordsForYellowLetters = function(currentFilteredList, currentYellowLetters) {
    return currentFilteredList.filter((word) => {
        // TODO probably will need to make this handle double letters
        for(let i = 0; i < word.length; i++) {
            if(currentYellowLetters.hasOwnProperty(word[i])) {
                const letter = word[i];
                if(currentYellowLetters[letter].indexOf(i) > -1) return false;     
            } 
        }
        const keys = Object.keys(currentYellowLetters);
        for(let i = 0; i < keys.length; i++) {
            if(!word.includes(keys[i])) { console.log("doesnt have a " + keys[i]); return false}
        }
        return true;
    });
}

moveChecker.WordExists = function(word) {
    for(var i = 0; i < words.length; i++) {

        if(words[i].includes(word)) return true;
    }
    return false;
}

moveChecker.wordsRemaining = function(word, ruleObject) {
    var filteredForGreen = FindWordsForGreenLetters("___ET");
    var filteredForYellow = FindWordsForYellowLetters(filteredForGreen, "_S___");
    return filteredForYellow.length > 0;
}

moveChecker.initialize = function() {

    fs.readFile('staticFiles/wordlist.csv', 'utf8', (err, data) => {
        if(err) {
            console.error(err);
            return;
        }
        words = data.split('\n');
        console.log(words.length);
    });

console.log("MoveChecker initialized");
}

module.exports = moveChecker;
