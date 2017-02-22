'use strict';

var MYAPP = MYAPP || {
    debugModeOn: false,
    gameState: 0,
    helpers: {},
    game: {},
    dragNDrop: {},
    models: {
        letterArray: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
        currentAIShotingDirection: null,
        aiShipsLeft: 10,
        playerShipLeft: 10,
        aroundCellDeltasArray: [
            [0, 1],
            [1, 0],
            [0, -1],
            [-1, 0],
            [1, 1],
            [-1, 1],
            [1, -1],
            [-1, -1]
        ],
        allShipsSet: [{
              size: 4,
              count: 1
          }, {
              size: 3,
              count: 2
          }, {
              size: 2,
              count: 3
          }, {
              size: 1,
              count: 4
        }]
    },
    maps: {},
    consts: {
        MAX_SHIPS: 10,
        CELL_STATES: {
            empty: 0,
            injured: 1,
            killed: 2,
            miss: 3,
            ship: 4,
            enemy: 5
        },
        SHIP_DIRECTIONS: {
            horizontal: 'horizontal',
            vertical: 'vertical'
        },
        MESSAGE_TYPES: {
            info: 'info',
            warning: 'warn',
            system: 'sys'
        },
        GAME_STATES: {
            initialState: 0,
            playerIsReady: 1,
            started: 2,
            finished: 3
        }
    }
};
