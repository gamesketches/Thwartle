import {wordlist} from "./wordlist.js";
const serverURL = "localhost:3000/";
let nextLetter = 0;
const wordSize = 5;
let enteredWord = "";

let gameState = "word-entry";

const currentGreenLetter = [];
var params, yellowLetterInfo;

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
                            && params.greenLetters[i] != 1) {
            letterBox.classList.remove("green-letter");
            letterBox.classList.remove("yellow-letter");
        }
    }
}

function InsertCharInString(targetString, targetCharacter, index) {
     return targetString.substring(0, index) + targetCharacter + targetString.substring(index + 1);
 }

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
    if(params.lastWord != null) {
        yellowLetterInfo = InterpretYellowLetters(params.yellowLetters);
    } else {
        params = {greenLetters: "00000"};
        yellowLetterInfo = {};
    }
}
 
function FillInPreviousWord() {
    if(params.lastWord == null) return;
    let board = document.getElementById("previous-word");
    for (let i = 0; i < 5; i++) {
        let box = document.createElement("div");
        box.className = "letter-box";
        if(params.lastWord != null) box.textContent = params.lastWord[i];
        if(params.greenLetters[i] == 1) box.classList.add("green-letter");
        board.appendChild(box);
    }
}

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
    } else if(enteredWord === params.lastWord) {
        helperText.innerText = "You must enter a different word!";
        return;
    }
    
    for(var i = 0; i < wordlist.length; i++) {
           if(wordlist[i].includes(enteredWord)) {
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

function GetWordsForGreenLetters(currentGreenLetters){
    return wordlist.filter((word) => {
        for(var i = 0; i < currentGreenLetters.length; i++) {
            if(currentGreenLetters[i] !== "_" && currentGreenLetters[i] !== word[i].toUpperCase()) {
               // console.log("throwing out " + word[i] + " because " + currentGreenLetters[i] + " is not " + word[i]);
                return false;
            }
        }
        return true;
    });
}

function GetWordsForYellowLetters(currentFilteredList, currentYellowLetters) {
    console.log(currentYellowLetters);
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
    const remainingYellowLetterWords = GetWordsForYellowLetters(remainingGreenLetterWords, yellowLetterInfo);
    if(remainingYellowLetterWords.length > 1) {
        helperText.innerText = "Good choice! Copy to clipboard to send it along";
        let submitButton = document.getElementById("submit-button");
        submitButton.onclick = CopyURLToClipboard;
        submitButton.innerText = "Copy";
    } else helperText.innerText = "No words possible with that highlight, please pick a different one";
}

function CopyURLToClipboard() {
    let greenHighlightString = "00000";
    let yellowString = "";
    for(let key in yellowLetterInfo) {
        const indexArray = yellowLetterInfo[key];
        for(let i = 0; i < indexArray.length; i++) {
            yellowString += key + i;
        }
    }
    const letterBoxes = document.getElementById("current-word");
    for(let i = 0; i < letterBoxes.children.length; i++) {
         const letterBox = letterBoxes.children[i];
         if(letterBox.classList.contains("green-letter")) {
             greenHighlightString = InsertCharInString(greenHighlightString, 1, i);
         } else if(letterBox.classList.contains("yellow-letter") && !yellowString.includes(letterBox.innerText + i) ) {
            yellowString += letterBox.innerText + i; 
             console.log("adding string " + letterBox.innerText + i);
         }
    }
    
    const lastWordString = "?lastWord=" + enteredWord;
    const greenLetterString = "&greenLetters=" + greenHighlightString;
    const yellowLetterString = "&yellowLetters=" + yellowString;
    const urlString = serverURL + lastWordString + greenLetterString + yellowLetterString;
    navigator.clipboard.writeText(urlString);
}

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
        InsertLetter(params.lastWord[nextLetter]);
    }
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

function IsPrefilledLetter(index) {
    return params.lastWord != null && params.greenLetters[index] == 1;
}

function InitBoard() {
    InterpretParams();

    FillInPreviousWord();
    let board = document.getElementById("current-word");

    for (let i = 0; i < 5; i++) {
        let box = document.createElement("div");
        box.className = "letter-box";
        if(IsPrefilledLetter(i)) {
            box.textContent = params.lastWord[i];
            box.classList.add("green-letter");
        }

        box.addEventListener("click", (e) => {
            if(gameState == "word-entry") return;
            const target = e.target;
            if(e.target.textContent.length === 0) return;
            if(target.classList.contains("green-letter")) {
                target.classList.remove("green-letter");
                target.classList.add("yellow-letter");
            }
            else if(target.classList.contains("yellow-letter")) {
                target.classList.remove("yellow-letter");
            }
            else {
                ClearEnteredHighlights(); 
                target.classList.add("green-letter");
            }
            CheckHighlight();
        });

        board.appendChild(box);
    }
    document.getElementById("submit-button").onclick = CheckWord
    UpdateCurrentLetterHighlight();
}

InitBoard();

console.log(location.host);
