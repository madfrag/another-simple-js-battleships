'use strict';

var MYAPP = (function(myApp) {
    var shipsWrapper = document.getElementById('shipsWrapper');
    var randomButton = document.getElementById('randomButton');
    var startButton = document.getElementById('startButton');
    var GAME_STATES = MYAPP.consts.GAME_STATES;
    var MESSAGE_TYPES = MYAPP.consts.MESSAGE_TYPES;

    function initGame() {
        var playerMap = MYAPP.helpers.getInitialMap(),
            computerMap = MYAPP.helpers.getInitialMap(),
            playerField = document.getElementById('playersField'),
            computerField = document.getElementById('computerField');

        startButton.disabled = true;
        randomButton.disabled = false;
        MYAPP.maps.playerMap = playerMap;
        MYAPP.maps.computerMap = computerMap;
        MYAPP.maps.possibleAIShotsLeft = MYAPP.helpers.getPossibleShotsArray();
        MYAPP.helpers.renderField(playerMap, playerField);
        MYAPP.helpers.renderField(computerMap, computerField);
        MYAPP.helpers.initShips();
    }

    function startGame() {
        startButton.disabled = true;
        randomButton.disabled = true;
        shipsWrapper.className += ' hidden';
        MYAPP.helpers.randomizeComputerShips();
        MYAPP.gameState = GAME_STATES.started;
        MYAPP.helpers.addMessage('The game is started!', MESSAGE_TYPES.system);
    }

    function playerIsReadyHandler() {
        MYAPP.gameState = GAME_STATES.playerIsReady;
        startButton.disabled = false;
    }

    function resetGame() {
        var messagesWrapper = document.getElementById('messageWrapper');

        messagesWrapper.innerHTML = '';
        shipsWrapper.className = 'ships-wrapper';
        MYAPP.models.aiShipsLeft = 10;
        MYAPP.models.playerShipLeft = 10;
        MYAPP.gameState = GAME_STATES.initialState;
        MYAPP.helpers.resetAiModels();
        MYAPP.helpers.addMessage('The game is reseted!', MESSAGE_TYPES.system);
        MYAPP.game.initGame();
    }

    function playerIsWon() {
      MYAPP.helpers.addMessage('You\'ve won! The game is finished! Press the "Reset" button to start a new one!', MESSAGE_TYPES.system);
      MYAPP.gameState = GAME_STATES.finished;
    }

    function aiIsWon() {
    MYAPP.helpers.addMessage('You\'ve lost! The game is finished! Press the "Reset" button to start a new one!', MESSAGE_TYPES.system);
      MYAPP.gameState = GAME_STATES.finished;
    }

    myApp.game.resetGame = resetGame;
    myApp.game.playerIsReadyHandler = playerIsReadyHandler;
    myApp.game.startGame = startGame;
    myApp.game.initGame = initGame;
    myApp.game.playerIsWonHandler = playerIsWon;
    myApp.game.aiIsWonHandler = aiIsWon;

    return myApp;
}(MYAPP || {}));
