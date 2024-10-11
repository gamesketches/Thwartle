'use strict'

const fs = require('fs');

var moveChecker = {};
var words = [];

function FindWordsForGreenLetters(currentGreenLetters){
    return words.filter((word) => {
        for(var i = 0; i < currentGreenLetters.length; i++) {
            if(currentGreenLetters[i] !== "_" && currentGreenLetters[i] !== word[i]) {
                return false;
            }
        }
        return true;
    });
}

function FindWordsForYellowLetters(currentFilteredList, currentYellowLetters) {
    return currentFilteredList.filter((word) => {
        // TODO probably will need to make this handle double letters
        for(var i = 0; i < currentYellowLetters.length; i++) {
            var letter = currentYellowLetters[i];
            if(letter === "_") continue;
            var firstAppearance = word.indexOf(letter);
            if(firstAppearance < 0) return false;
            if(firstAppearance == i && word.lastIndexOf(letter) == i) return false; 
        }
        return true;
    });
}

moveChecker.WordExists = function(word) {
    for(var i = 0; i < words.length; i++) {
        if(words[i] == word) return true;
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