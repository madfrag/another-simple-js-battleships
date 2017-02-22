'use strict';

window.onload = init;

function init() {
    var computerField = document.getElementById('computerField'),
        startButton = document.getElementById('startButton'),
        resetButton = document.getElementById('resetButton'),
        randomButton = document.getElementById('randomButton');

    randomButton.addEventListener('click', MYAPP.helpers.randomizePlayerShips, false);
    resetButton.addEventListener('click', MYAPP.game.resetGame, false);
    startButton.addEventListener('click', MYAPP.game.startGame, false);
    document.addEventListener('playerIsReady', MYAPP.game.playerIsReadyHandler, false);
    computerField.addEventListener('click', MYAPP.helpers.clickOnComputerFieldHandler, false);
    document.addEventListener('playerIsWon', MYAPP.game.playerIsWonHandler, false);
    document.addEventListener('aiIsWon', MYAPP.game.aiIsWonHandler, false);

    MYAPP.game.initGame();
}
