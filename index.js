"use strict"
window.addEventListener('load', () => {
    document.querySelector(".questionPart").style.display = 'none';
    document.querySelector('.userSavedMaxPointsEasy').innerHTML = maxUserPointsEasy;
    document.querySelector('.userSavedMaxPointsNormal').innerHTML = maxUserPointsNormal;
    document.querySelector('.userSavedMaxPointsHard').innerHTML = maxUserPointsHard;

    personalRecordContainer.style.display = "none";
    difficultyDiv.style.display = "none";

    for (let i = 0; i <= 3; i++) {
        // document.querySelector('.answerBtn' + i).style.display = "none";
    }


    initializeLocalStorageVar();

});

//game data
var lifes = 1;
var timerData = 1;
var timerBarWidth = 1;
var timerInterval;

if (points <= 0) {
    document.querySelector(".restartGameBtn").style.display = ""
}


// api data
var difficulty = 'easy';
var API = 'https://opentdb.com/api.php?amount=1&difficulty=' + difficulty + '&type=multiple';
var type = 'multiple';

var maxUserPointsEasy = localStorage.getItem('triviaGameMaxPointsEasy') || 0;
var maxUserPointsNormal = localStorage.getItem('triviaGameMaxPointsNormal') || 0;
var maxUserPointsHard = localStorage.getItem('triviaGameMaxPointsHard') || 0;


var points = 0;

var question;
var correctAnswerName;
var category;
var wrongAnswers = [];
var correctAnswerNumber;

var lifesParentHTML = document.querySelector('.lifes');
var timerBar = document.getElementById("myBar");
var personalRecordContainer = document.querySelector(".personalRecordContainer");
var difficultyDiv = document.querySelector(".dificultyBtns");


function initSetup() {
    document.querySelector(".questionPart").style.display = 'initial';
    document.querySelector(".initSetupBtn").style.display = 'none';
    changeDifficulty(difficulty);
    gameFlow();
    for (let i = 0; i <= 3; i++) {
        document.querySelector('.answerBtn' + i).style.display = "initial";
    }

}

async function getQuestion() {
    let response = await fetch(API);
    let data = response.json();

    return data;
}

function getDbData() {
    if (lifes > 0) {
        return getQuestion().then(data => {
            console.log("Getting data...");
            initializeLocalStorageVar();
            let response = data.results[0];
            question = response.question;
            category = response.category;
            correctAnswerName = response.correct_answer;
            wrongAnswers = response.incorrect_answers;
        });
    }
}

function renderHTML() {
    document.querySelector('.question').innerHTML = question;
    document.querySelector('.recivedCategory').innerHTML = category;
    document.querySelector('.points').innerHTML = points;
    document.querySelector('.showDifficulty').innerHTML = difficulty;


}


function drawHearts() {
    for (var i = 0; i < lifes; i++) {
        lifesParentHTML
            .insertAdjacentHTML('beforeend',
                '<span class="far fa-heart"></span> '
            )
    }
}

function timer(timerData) {
    timerBarWidth = 1;
    clearInterval(timerInterval);
    timerInterval = setInterval(frame, timerData)
}

function frame() {
    if (timerBarWidth >= timerData) {
        clearInterval(timerInterval);
        lifes -= 1;

        if (lifes > 0) {
            discoverCorrectAnswer();
        }
        drawHearts();
    } else {
        timerBarWidth++;
        timerBar.style.width = timerBarWidth + '%';
    }
}

function gameFlow() {
    if (lifes > 0) {
        getDbData().then(() => {
            putDataBehindBtns();
            renderHTML();
            deleteAllHearts();
            drawHearts();
            timer(timerData);
        });
    } else {
        gameLosed();
    }
}

function gameLosed() {
    clearInterval(timerInterval);
    savePointsOnLocalStorage();
    alert('Game over!');
    location.reload();
}

function deleteAllHearts() {
    while (lifesParentHTML.firstChild) {
        lifesParentHTML.removeChild(lifesParentHTML.lastChild);
    }
}

function deleteLastHeart() {
    if (lifesParentHTML.lastChild) {
        lifesParentHTML.removeChild(lifesParentHTML.lastChild);
    }
}

function putDataBehindBtns() {
    correctAnswerNumber = Math.floor(Math.random() * 4);

    document.querySelector('.answerBtn' + correctAnswerNumber).innerHTML = correctAnswerName;


    if (correctAnswerNumber === 0) {
        for (let i = 1; i < 4; i++) {
            document.querySelector('.answerBtn' + i).innerHTML = wrongAnswers[i - 1];
        }
    } else {
        for (let i = 0; i < correctAnswerNumber; i++) {
            document.querySelector('.answerBtn' + i).innerHTML = wrongAnswers[i];
        }

        for (let j = correctAnswerNumber + 1; j <= 3; j++) {
            document.querySelector('.answerBtn' + j).innerHTML = wrongAnswers[j - 1];
        }
    }
}


function answerBtnClicked(x) {
    if (correctAnswerNumber === x) {
        correctBtnClicked();
    } else {
        wrongBtnClicked();
    }
}

function correctBtnClicked() {
    alert('Correct!');
    gameFlow();
    points++;
}

function wrongBtnClicked() {
    lifes -= 1;
    discoverCorrectAnswer();
}

function discoverCorrectAnswer() {

    for (let i = 0; i <= 3; i++) {
        if (i === correctAnswerNumber) {
            document.querySelector('.answerBtn' + i).disabled = true;
        } else {
            document.querySelector('.answerBtn' + i).style.display = "none";
        }
    }
    delayNextQuestion();
}

function delayNextQuestion() {
    clearInterval(timerInterval);
    let localInterval = setInterval(() => {
        gameFlow();
        makeAnswerBtnsVisible()
        clearInterval(localInterval);
    }, 3000)
}

function makeAnswerBtnsVisible() {
    document.querySelector('.answerBtn' + correctAnswerNumber).disabled = false;
    for (let i = 0; i <= 3; i++) {
        document.querySelector('.answerBtn' + i).style.display = "initial";
    }
}


function changeDifficulty(x) {
    if (lifes > 0) {
        lifes = 1;
        points = 0;
        document.querySelectorAll('.dificultyBtn').forEach((e) => {
            e.classList.remove("activeDificulty");
        })
        timerData = 100;

        switch (x) {
            case 'easy':
                difficulty = 'easy';
                document.querySelector('.easy').classList.add('activeDificulty');
                lifes = 3;
                break;
            case 'normal':
                difficulty = 'normal';
                document.querySelector('.normal').classList.add('activeDificulty');
                lifes = 2;
                break;
            case 'hard':
                difficulty = 'hard';
                document.querySelector('.hard').classList.add('activeDificulty');
                lifes = 1;
                break;
        }
        // gameFlow();

    }
}

function initializeLocalStorageVar() {
    if (localStorage.getItem('triviaGameMaxPointsEasy') === null) {
        localStorage.setItem('triviaGameMaxPointsEasy', 0);
    }
    if (localStorage.getItem('triviaGameMaxPointsNormal') === null) {
        localStorage.setItem('triviaGameMaxPointsNormal', 0);
    }
    if (localStorage.getItem('triviaGameMaxPointsHard') === null) {
        localStorage.setItem('triviaGameMaxPointsHard', 0);
    }
}

function savePointsOnLocalStorage() {
    let difficultyFirstLetterWithUppercase = difficulty[0].toUpperCase() + difficulty.slice(1);

    let maxUserDificulty = 'maxUserPoints' + difficultyFirstLetterWithUppercase;

    if (window[maxUserDificulty] < points) {
        localStorage.setItem('triviaGameMaxPoints' + difficultyFirstLetterWithUppercase, points);
    }
}

function restoreStoragePoints() {
    localStorage.setItem('triviaGameMaxPointsEasy', 0);
    localStorage.setItem('triviaGameMaxPointsNormal', 0);
    localStorage.setItem('triviaGameMaxPointsHard', 0);
    location.reload();
}

function toggleRecord() {
    if (personalRecordContainer.style.display === "none") {
        personalRecordContainer.style.display = "block";
    } else {
        personalRecordContainer.style.display = "none";
    }
}

function toggleDificulty() {
    if (difficultyDiv.style.display === "none") {
        difficultyDiv.style.display = "block";
    } else {
        difficultyDiv.style.display = "none";
    }
}