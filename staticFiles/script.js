import {wordlist} from "./wordlist.js";
const serverURL = "https://5c17-2600-4041-580a-b00-5532-ba82-64c1-59fd.ngrok-free.app";
let nextLetter = 0;
const wordSize = 5;
let enteredWord = "";

let gameState = "word-entry";

const currentGreenLetter = ["0", "0", "0", "0", "0"];
let letterColorLog = [];
var params, yellowLetterInfo, previousWords, currentWordList;

// UTILITIES -------------
function InsertCharInString(targetString, targetCharacter, index) {
     return targetString.substring(0, index) + targetCharacter + targetString.substring(index + 1);
 }

function GreenLettersFromColorLogString(colorString) {
    let returnVal = "";
    for(let i = 0; i < colorString.length; i++) {
        if(colorString[i] === "G") returnVal += "1";
        else returnVal += "0";
    }
    return returnVal;
}

function UpdateCurrentLetterHighlight() {
    const letterBoxes = document.getElementById("current-word");
    for(let i = 0; i < letterBoxes.children.length; i++) {
        letterBoxes.children[i].classList.remove("current-letter");
    }
    if(nextLetter < 5) letterBoxes.children[nextLetter].classList.add("current-letter");
}

function ClearEnteredHighlights() {
    const letterBoxes = document.getElementById("current-word");
    for(let i = 0; i < letterBoxes.children.length; i++) {
        const letterBox = letterBoxes.children[i];
        if((letterBox.classList.contains("green-letter") || letterBox.classList.contains("yellow-letter"))
                            && currentGreenLetter[i] == "0") {
            letterBox.classList.remove("green-letter");
            letterBox.classList.remove("yellow-letter");
        }
    }
}

function GetWordsForGreenLetters(currentGreenLetters){
    return currentWordList.filter((word) => {
        for(var i = 0; i < currentGreenLetters.length; i++) {
            if(currentGreenLetters[i] !== "_" && currentGreenLetters[i] !== word[i].toUpperCase()) {
                return false;
            }
        }
        return true;
    });
}

function GetWordsForYellowLetters(currentFilteredList) {
    const letterBoxes = document.getElementById("current-word");
    for(let j = 0; j < letterBoxes.children.length; j++) {
        if(letterBoxes.children[j].classList.contains("yellow-letter")) {
            const theLetter = letterBoxes.children[j].innerText;
            currentFilteredList = currentFilteredList.filter((word) => {
                // TODO probably will need to make this handle double letters
                for(let i = 0; i < word.length; i++) {
                    if(word[i] === theLetter) {
                         if(i === j) return false;
                         else return true;
                    }
                }
                return false;
            });
        }
    }
    return currentFilteredList;
}

function GetWordsForRedLetters(currentFilteredList) {
    const letterBoxes = document.getElementById("current-word");
    for(let i = 0; i < letterBoxes.children.length; i++) {
        if(letterBoxes.children[i].classList.contains("red-letter")) {
            const theLetter = letterBoxes.children[i].innerText;
            currentFilteredList = currentFilteredList.filter((word) => {
                if(word.toUpperCase().includes(theLetter)) return false;
                else return true;
            });
        }
    }
    return currentFilteredList;
}


function IsPrefilledLetter(index) {
    return currentGreenLetter[index] != "0";
}

function WordPreviouslyEntered(newWord) {
    return previousWords.includes(newWord);
}

function PruneWordList() {
    currentWordList = wordlist.filter((word) => {
        for(var i = 0; i < previousWords.length; i++) {
            const previousWord = previousWords[i].toLowerCase();
            const wordColorLog = letterColorLog[i];
            for(let k = 0; k < wordColorLog.length; k++) {
                switch(wordColorLog[k]) {
                    case "R":
                        if(word.toLowerCase().includes(previousWord[k])) return false;
                        break;
                    case "G":
                        if(word[k] !== previousWord[k]) return false;
                        break;
                    case "Y":
                        if(!word.includes(previousWord[k])) return false;
                        else if(word[k] === previousWord[k]) return false;
                        break;
                }
            }
        }
        return true;
    });
}

function CopyURLToClipboard() {
    let letterColorString = "00000";
    
    const letterBoxes = document.getElementById("current-word");
    for(let i = 0; i < letterBoxes.children.length; i++) {
         const letterBox = letterBoxes.children[i];
         if(letterBox.classList.contains("green-letter")) {
             letterColorString = InsertCharInString(letterColorString, "G", i);
         } else if(letterBox.classList.contains("yellow-letter")) {
             letterColorString = InsertCharInString(letterColorString, "Y", i);
         }
        else if(letterBox.classList.contains("red-letter")) {
             letterColorString = InsertCharInString(letterColorString, "R", i);
        }

    }
    
    //let greenLetterString = "&greenLetters=";
    let colorLogString = "&colorLog=";
    //letterColorLog.forEach((element) => greenLetterString += "," + element);
    letterColorLog.forEach((element) => colorLogString += element + ",");
    colorLogString += letterColorString;

    let enteredWordString = "?enteredWords=";
    previousWords.forEach((element) => enteredWordString += element + ",");  
    enteredWordString += enteredWord;
    //const yellowLetterString = "&yellowLetters=" + yellowString;
    const urlString = serverURL + enteredWordString + colorLogString;//+ greenLetterString + yellowLetterString;
    navigator.clipboard.writeText(urlString);
}

// Loading stuff
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

function InterpretParams() { 

    params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
    if(params.enteredWords != null) {
        previousWords = params.enteredWords.split(",");
        console.log(params.enteredWords.split(","));
        params.lastWord = previousWords[previousWords.length - 1];
        letterColorLog = params.colorLog.split(",");
        if(letterColorLog.length > 0) params.greenLetters = GreenLettersFromColorLogString(letterColorLog[letterColorLog.length - 1]);
        else params.greenLetters = "00000";
        PruneWordList();
        //yellowLetterInfo = InterpretYellowLetters(params.yellowLetters);
    } else {
        previousWords = [];
        currentWordList = wordlist;
        params = {greenLetters: "00000", enteredWords: []};
    }
}
 
function FillInPreviousWord() {
    if(params.enteredWords == null) return;
    const board = document.getElementById("previous-words");
    for(let k = 0; k < previousWords.length; k++) {
        const previousWord = previousWords[k];
        const newRow = document.createElement("div");
        newRow.className = "previous-word";
        board.appendChild(newRow);
        for (let i = 0; i < 5; i++) {
            let box = document.createElement("div");
            box.className = "letter-box";
            box.textContent = previousWord[i];
            switch(letterColorLog[k][i]) {
                case "G":
                    box.classList.add("green-letter");
                    currentGreenLetter[i] = previousWord[i];
                    break;
                case "Y":
                    box.classList.add("yellow-letter");
                    break;
                case "R":
                    box.classList.add("red-letter");
                    break;
            }
            //if(colorLog[k][i] == 1) box.classList.add("green-letter");
            newRow.appendChild(box);
        }
    }
}

// Gameflow stuff
function GameEndingWord() {
    const letterBoxes = document.getElementById("current-word");
    let baseGreenString = "_____";
    for(let i = 0; i < letterBoxes.children.length; i++) {
        if(letterBoxes.children[i].classList.contains("green-letter")) {
            baseGreenString = InsertCharInString(baseGreenString, letterBoxes.children[i].innerText, i);
        }
    }

    for(let i = 0; i < letterBoxes.children.length; i++) {
        const letter = letterBoxes.children[i].innerText;
        let filteredWordList;
        let potentialGreen = baseGreenString;
        if(!letterBoxes.children[i].classList.contains("green-letter")) {
            potentialGreen = InsertCharInString(baseGreenString, letter, i);
        } 
        filteredWordList = GetWordsForGreenLetters(potentialGreen);
        if(filteredWordList.length > 1) return false;
        if(!letterBoxes.children[i].classList.contains("yellow-letter")) {
            let potentialYellow = structuredClone(yellowLetterInfo);
            if(potentialYellow.hasOwnProperty(letter) && potential[letter].indexOf(i) == -1) {
                potentialYellow[letter].push(i);
            }
            filteredWordList = GetWordsForYellowLetters(filteredWordList, potentialYellow);
            console.log(filteredWordList);
            if(filteredWordList.length > 1) return false;
        }
    }   
    return true;
}


function CheckWord() {
    const helperText = document.getElementById("guide-text");
    if(nextLetter < 5) {
        helperText.innerText = "Not enough letters";
        return;
    } else {
        let previouslyUsedWord = false;
        previousWords.forEach((prevWord) => {if(prevWord == enteredWord) {
            helperText.innerText = "You must enter a word that hasnt been used yet!";
            previouslyUsedWord = true;
            }
        });
        if(previouslyUsedWord) return;
    }
    
    for(var i = 0; i < currentWordList.length; i++) {
           if(currentWordList[i].includes(enteredWord)) {
               if(GameEndingWord()) {
                   helperText.innerText = "You win!!";
               }
               else {
                   helperText.innerText = "valid!! Select a letter to green";
                   gameState = "highlight-entry";
               }
               return;
           }
    }   
    helperText.innerText = "invalid word";
}

function CheckHighlight() {
    const helperText = document.getElementById("guide-text");
    let greenHighlightString = "_____";
    const letterBoxes = document.getElementById("current-word");
    for(let i = 0; i < letterBoxes.children.length; i++) {
         if(letterBoxes.children[i].classList.contains("green-letter")) {
             greenHighlightString = InsertCharInString(greenHighlightString, letterBoxes.children[i].innerText, i);
         }
     }
    const remainingGreenLetterWords = GetWordsForGreenLetters(greenHighlightString);
    const remainingYellowLetterWords = GetWordsForYellowLetters(remainingGreenLetterWords);
    const remainingRedLetterWords = GetWordsForRedLetters(remainingYellowLetterWords);
    if(remainingRedLetterWords.length > 1) {
        helperText.innerText = "Good choice! Copy to clipboard to send it along";
        let submitButton = document.getElementById("submit-button");
        submitButton.onclick = CopyURLToClipboard;
        submitButton.innerText = "Copy";
    } else helperText.innerText = "No words possible with that highlight, please pick a different one";
}

// Game Interaction
function DeleteLetter() {
    if(nextLetter === 0) return;
    if(!IsPrefilledLetter(nextLetter - 1)) {
        let box = document.getElementById("current-word").children[nextLetter - 1];
        box.textContent = "";
    }
    nextLetter--;
    enteredWord = enteredWord.substring(0, nextLetter);
    UpdateCurrentLetterHighlight();
    if(nextLetter > 0 && IsPrefilledLetter(nextLetter)) {
        DeleteLetter();
    }
}

function InsertLetter(newLetter) {
    if(nextLetter === 5) return;

    newLetter = newLetter.toLowerCase()

    let box = document.getElementById("current-word").children[nextLetter];

    box.textContent = newLetter;
    enteredWord += newLetter;
    nextLetter++;
    UpdateCurrentLetterHighlight();
    if(nextLetter < wordSize && IsPrefilledLetter(nextLetter)) {
        InsertLetter(currentGreenLetter[nextLetter]);
    }
}

// Setup
function InitBoard() {
    InterpretParams();

    FillInPreviousWord();
    let board = document.getElementById("current-word");

    console.log(currentGreenLetter);
    let foundStartingCursor = false;
    for (let i = 0; i < 5; i++) {
        let box = document.createElement("div");
        box.className = "letter-box";
        if(IsPrefilledLetter(i)) {
            console.log(currentGreenLetter[i]);
            box.textContent = currentGreenLetter[i];
            box.classList.add("green-letter");
        } else if(!foundStartingCursor) {
            nextLetter = i;
            foundStartingCursor = true;
        }

        box.addEventListener("click", (e) => {
            if(gameState == "word-entry") return;
            const target = e.target;
            if(e.target.textContent.length === 0) return;
            if(target.classList.contains("yellow-letter")) {
                target.classList.remove("yellow-letter");
                target.classList.add("green-letter");
            }
            else if(target.classList.contains("green-letter")) {
                target.classList.remove("green-letter");
                target.classList.add("red-letter");
            }
            else if(target.classList.contains("red-letter")) {
                target.classList.remove("red-letter");
            }
            else {
                ClearEnteredHighlights(); 
                target.classList.add("yellow-letter");
            }
            CheckHighlight();
        });

        board.appendChild(box);
    }
    document.getElementById("submit-button").onclick = CheckWord
    UpdateCurrentLetterHighlight();
}

document.addEventListener("keyup", (e) => {
    let pressedKey = String(e.key);
    if(pressedKey === "Backspace" && nextLetter !== 0) {
        DeleteLetter();
        return;
    }

    if(pressedKey === "Enter") {
        CheckWord();
        return;
    }

    let found = pressedKey.match(/[a-z]/gi);
    if(!found || found.length > 1) {
        return;
    } else {
        InsertLetter(pressedKey);
    }
});

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
    const target = e.target;

    if(!target.classList.contains("keyboard-button")) {
        return;
    }

    let key = target.textContent;

    if(key === "Del") {
        key = "Backspace";
    }

    document.dispatchEvent(new KeyboardEvent("keyup", {'key': key}));
})


InitBoard();
