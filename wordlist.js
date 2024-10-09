'use strict'

var moveChecker = {};
var words = [];

words.push("SALET", "BALET", "PARTY");

moveChecker.WordExists = function(word) {
    for(var i = 0; i < words.length; i++) {
        if(words[i] == word) return true;
    }
    return false;
}

moveChecker.wordsRemaining = function(word, ruleObject) {
    return this.WordExists(word);
}

moveChecker.words = words;

console.log("MoveChecker initialized");

module.exports = moveChecker;
