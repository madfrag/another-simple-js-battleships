'use strict';

var MYAPP = (function (myApp) {
    var ships = MYAPP.models.allShipsSet;
    var surroundingArray = MYAPP.models.aroundCellDeltasArray;
    var DIRECTIONS = MYAPP.consts.SHIP_DIRECTIONS;
    var CELL_STATES = MYAPP.consts.CELL_STATES;
    var MESSAGE_TYPES = MYAPP.consts.MESSAGE_TYPES;
    var GAME_STATES = MYAPP.consts.GAME_STATES;
    var lastComputerShot = null;
    var neighborsArray = [];
    var currentInjured = null;

    function _handleClickOnEnemyShip(x, y, map) {
        var killed = true,
            message;

        killed = _isKilled(x, y, map, CELL_STATES.enemy);
        message = killed ? 'Enemy\'s ship killed!' : 'Enemy\'s ship injured!';
        if (killed) {
            MYAPP.models.aiShipsLeft -= 1;
            map[y][x] = CELL_STATES.killed;
            _markAllNeighbors(x, y, map);
            if (MYAPP.models.aiShipsLeft === 0) {
                triggerEvent('playerIsWon');
            }
        } 
        else {
            map[y][x] = CELL_STATES.injured;
        }

        MYAPP.helpers.addMessage(getCoordinateMessage(x, y) + message, MESSAGE_TYPES.info);
    }

    function _markAllNeighbors(x, y, map, isPlayersMap) {
        var dx,
            dy,
            i;

        for (i = 0; i < surroundingArray.length; i++) {
            dx = x + surroundingArray[i][0];
            dy = y + surroundingArray[i][1];
            if (map[dy] && map[dy][dx] !== CELL_STATES.killed && map[dy][dx] !== CELL_STATES.injured) {
                map[dy][dx] = CELL_STATES.miss;
                if (isPlayersMap && _findCoordinateIndex(MYAPP.maps.possibleAIShotsLeft, [dy, dx]) !== -1) {
                    MYAPP.maps.possibleAIShotsLeft.splice(_findCoordinateIndex(MYAPP.maps.possibleAIShotsLeft, [dy, dx]), 1);
                    if (MYAPP.debugModeOn) {
                        MYAPP.helpers.addMessage(getCoordinateMessage(dx, dy) + ' { Surround neighbor cells === remove cell from possible AI shots } ' + 'cells left: ' + MYAPP.maps.possibleAIShotsLeft.length);
                    }
                }
            } 
            else if (map[dy] && map[dy][dx] === CELL_STATES.injured) {
                map[dy][dx] = CELL_STATES.killed;
                _markAllNeighbors(dx, dy, map, isPlayersMap);
            }
        }
    }

    function _findCoordinateIndex(array, item) {
        var i;

        for (i = 0; i < array.length; i++) {
            if (array[i][0] === item[0] && array[i][1] === item[1]) {
                return i;
            }
        }
        return -1;
    }

    function _setPossibleNeighbors(x, y) {
        var playerMap = MYAPP.maps.playerMap,
            currentX,
            neighborsForShotArray,
            i,
            currentY;

        neighborsArray = [];

        if (MYAPP.models.currentAIShotingDirection) {
            if (MYAPP.models.currentAIShotingDirection === DIRECTIONS.vertical) {
                neighborsForShotArray = [
                    [-1, 0],
                    [1, 0]
                ];
            } 
            else {
                neighborsForShotArray = [
                    [0, 1],
                    [0, -1]
                ];
            }
        } 
        else {
            neighborsForShotArray = [
                [0, 1],
                [0, -1],
                [-1, 0],
                [1, 0]
            ];
        }
        for (i = 0; i < neighborsForShotArray.length; i++) {
            currentX = x + neighborsForShotArray[i][1];
            currentY = y + neighborsForShotArray[i][0];
            if (currentX !== -1 &&
                currentX !== 10 &&
                playerMap[currentY] &&
                playerMap[currentY][currentX] !== CELL_STATES.miss &&
                playerMap[currentY][currentX] !== CELL_STATES.injured) {
                neighborsArray.push([currentY, currentX]);
            }
        }
    }

    function _isKilled(x, y, map, shipState) {
        var i,
            isKilled = true,
            currentShipArray = [];

        currentShipArray.push([y, x]);
        if ((map[y] && map[y][x + 1] && map[y][x + 1] === shipState) || (map[y] && map[y][x - 1] && map[y][x - 1] === shipState) ||
            (map[y + 1] && map[y + 1][x] === shipState) || (map[y - 1] && map[y - 1][x] === shipState)) {
            return false;
        }
        if ((map[y] && map[y][x + 1] === CELL_STATES.injured) || (map[y] && map[y][x - 1] === CELL_STATES.injured)) {
            i = 1;
            while ((map[y] && map[y][x + i] && map[y][x + i] !== CELL_STATES.miss) && (map[y] && map[y][x + i] && map[y][x + i] !== CELL_STATES.empty)) {
                if (MYAPP.debugModeOn) {
                    console.log('while started1  ' + y + '|' + x);
                }
                currentShipArray.push([y, x + i]);
                i += 1;
            }
            i = 1;
            while ((map[y] && map[y][x - i] && map[y][x - i] !== CELL_STATES.miss) && (map[y] && map[y][x - i] && map[y][x - i] !== CELL_STATES.empty)) {
                if (MYAPP.debugModeOn) {
                    console.log('while started2  ' + y + '|' + x);
                }
                currentShipArray.push([y, x - i]);
                i += 1;
            }
        }
        if ((map[y + 1] && map[y + 1][x] === CELL_STATES.injured) || (map[y - 1] && map[y - 1][x] === CELL_STATES.injured)) {
            i = 1;
            while ((map[y + i] && map[y + i][x] !== CELL_STATES.miss) && (map[y + i] && map[y + i][x] !== CELL_STATES.empty)) {
                if (MYAPP.debugModeOn) {
                    console.log('while started3  ' + y + '|' + x);
                }
                currentShipArray.push([y + i, x]);
                i += 1;
            }
            i = 1;
            while ((map[y - i] && map[y - i][x] !== CELL_STATES.miss) && (map[y - i] && map[y - i][x] !== CELL_STATES.empty)) {
                if (MYAPP.debugModeOn) {
                    console.log('while started4  ' + y + '|' + x);
                }
                currentShipArray.push([y - i, x]);
                i += 1;
            }
        }
        for (var j = 0; j < currentShipArray.length; j++) {
            if (map[currentShipArray[j][0]][currentShipArray[j][1]] === shipState) {
                return false;
            }
        }
        return isKilled;
    }

    function _tryPlaceShip(ship, map, field) {
        var directionsArray = Object.keys(DIRECTIONS),
            randomX = Math.floor(10 * Math.random()),
            randomY = Math.floor(10 * Math.random()),
            randomDirection = directionsArray[Math.floor(2 * Math.random())],
            canPlace = canPlaceShipHere(randomX, randomY, ship.size, randomDirection, map);

        if (canPlace) {
            placeShipOnField(randomX, randomY, ship.size, randomDirection, map, field);
        } 
        else {
            _tryPlaceShip(ship, map, field);
        }
    }

    function getCoordinateMessage(x, y) {
        return  MYAPP.debugModeOn ? '( ' + y + ',' + x + ' )' : 
                '( ' + MYAPP.models.letterArray[x] + ',' + (y + 1) + ' )';
    }

    function getPossibleShotsArray() {
        var result = [],
            i,
            j;

        for (i = 0; i < 10; i++) {
            for (j = 0; j < 10; j++) {
                result.push([i, j]);
            }
        }
        return JSON.parse(JSON.stringify(result));
    }

    function renderField(map, field) {
        var table = document.createElement('table'),
            i,
            j,
            td,
            tr,
            emptyCell = document.createElement('td'),
            header = document.createElement('tr');

        emptyCell.className = 'cell-common header-cell';
        header.appendChild(emptyCell.cloneNode());
        for (var k = 0; k < MYAPP.models.letterArray.length; k++) {
            var headerCell = document.createElement('td');
            headerCell.className = 'cell-common header-cell';
            headerCell.innerHTML = MYAPP.debugModeOn ? k : MYAPP.models.letterArray[k];
            header.appendChild(headerCell);
        }
        table.appendChild(header);
        for (i = 0; i < 10; i++) {
            tr = document.createElement('tr');
            emptyCell = emptyCell.cloneNode();
            emptyCell.innerHTML = MYAPP.debugModeOn ? i : i + 1;
            tr.appendChild(emptyCell);
            for (j = 0; j < 10; j++) {
                td = document.createElement('td');
                td.className = 'cell-common';
                switch (map[i][j]) {
                    case CELL_STATES.empty:
                        td.dataset.state = 'empty';
                        break;
                    case CELL_STATES.killed:
                        td.dataset.state = 'killed';
                        break;
                    case CELL_STATES.injured:
                        td.dataset.state = 'injured';
                        break;
                    case CELL_STATES.miss:
                        td.dataset.state = 'miss';
                        break;
                    case CELL_STATES.ship:
                        td.dataset.state = 'ship';
                        break;
                    case CELL_STATES.enemy:
                        td.dataset.state = 'enemy';
                        break;
                    default:
                        td.dataset.state = 'empty';
                }
                td.dataset.x = j;
                td.dataset.y = i;
                td.dataset.type = 'fieldcell';
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        while (field.firstChild) {
            field.removeChild(field.firstChild);
        }
        field.appendChild(table);
    }

    function addMessage(message, type) {
        var msgClassName,
            messagesWrapper = document.getElementById('messageWrapper'),
            messageContainer = document.createElement('div'),
            prefix = type ? '(' + type + ')' + '***' : '';

        switch (type) {
            case MESSAGE_TYPES.info:
                msgClassName = 'message-info';
                break;
            case MESSAGE_TYPES.warning:
                msgClassName = 'message-warning';
                break;
            case MESSAGE_TYPES.system:
                msgClassName = 'message-system';
                break;
            default:
                msgClassName = '';
        }

        messageContainer.className = msgClassName;
        messageContainer.innerHTML = prefix + message;
        messagesWrapper.insertBefore(messageContainer, messagesWrapper.firstChild);
    }

    function initShips() {
        var horizontalShipsContainer = document.getElementById('horizontalShips'),
            verticalShipsContainer = document.getElementById('verticalShips'),
            horizontalShips = document.createElement('table'),
            allShipsWrapper = document.getElementById('shipsWrapper'),
            verticalShips = document.createElement('div');

        if (navigator.appName == 'Microsoft Internet Explorer' || !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/))) {
            allShipsWrapper.innerHTML = 'Only random ships setting works in IE, sorry for that :(. To be able drag and drop ships please use another browser (Google Chrome for instance)';
        } 
        else {
            horizontalShipsContainer.innerHTML = '';
            verticalShipsContainer.innerHTML = '';
            horizontalShips.className = 'ship-list';

            /*Horizontal ships*/
            ships.forEach(function (ship) {
                var i,
                    j,
                    singleShip,
                    shipCell;

                if (ship.size > 1) {
                    for (j = 0; j < ship.count; j++) {
                        singleShip = document.createElement('tr');
                        for (i = 0; i < ship.size; i++) {
                            shipCell = document.createElement('td');
                            shipCell.className = 'cell-common cell-ship';
                            shipCell.textContent = '';
                            shipCell.dataset.type = 'shipcell';
                            singleShip.appendChild(shipCell);
                        }
                        singleShip.className = 'horizontal-ship single-ship';
                        singleShip.dataset.shipSize = ship.size;
                        singleShip.dataset.direction = DIRECTIONS.horizontal;
                        singleShip.setAttribute('draggable', 'true');
                        singleShip.setAttribute('ondragstart', 'MYAPP.dragNDrop.drag(event)');
                        horizontalShips.appendChild(singleShip);
                    }
                }
            });
            /*Vertical ships*/
            ships.forEach(function (ship) {
                var i,
                    j,
                    singleShip,
                    shipCellWrapper,
                    shipCell;

                for (j = 0; j < ship.count; j++) {
                    singleShip = document.createElement('table');
                    for (i = 0; i < ship.size; i++) {
                        shipCellWrapper = document.createElement('tr');
                        shipCell = document.createElement('td');
                        shipCellWrapper.appendChild(shipCell);
                        shipCell.className = 'cell-common cell-ship';
                        shipCell.textContent = '';
                        shipCell.dataset.type = 'shipcell';
                        singleShip.appendChild(shipCellWrapper);
                    }
                    singleShip.className = 'vertical-ship single-ship';
                    singleShip.dataset.shipSize = ship.size;
                    singleShip.dataset.direction = DIRECTIONS.vertical;
                    singleShip.setAttribute('draggable', 'true');
                    singleShip.setAttribute('ondragstart', 'MYAPP.dragNDrop.drag(event)');
                    verticalShips.appendChild(singleShip);
                }
            });
            horizontalShipsContainer.appendChild(horizontalShips);
            verticalShipsContainer.appendChild(verticalShips);
        }
    }

    function synchronizeAvailableShips(shipSize, shipDirection) {
        var container = shipDirection === DIRECTIONS.vertical ?
            document.getElementById('horizontalShips') :
            document.getElementById('verticalShips'),
            currentShip = container.querySelector('[data-ship-size="' + shipSize + '"][draggable="true"]');

        currentShip.removeAttribute('ondragstart');
        currentShip.removeAttribute('draggable');
        currentShip.className += ' opacity-05';
    }

    function canPlaceShipHere(x, y, shipSize, shipDirection, map, cellNumber) {
        var dx,
            dy,
            i,
            j,
            canPlace = true;
        
        if (cellNumber && cellNumber !== 1 && shipSize !== 1){
            x = shipDirection === DIRECTIONS.horizontal ? x - cellNumber + 1 : x;
            y = shipDirection === DIRECTIONS.horizontal ? y : y - cellNumber + 1;
        }
        for (i = 0; i < shipSize; i++) {
            for (j = 0; j < surroundingArray.length; j++) {
                if (shipDirection === DIRECTIONS.horizontal) {
                    dx = x + i + surroundingArray[j][0];
                    dy = y + surroundingArray[j][1];
                }
                if (shipDirection === DIRECTIONS.vertical) {
                    dx = x + surroundingArray[j][0];
                    dy = y + i + surroundingArray[j][1];
                }
                if ((map[y] && map[y][x] !== 0) ||
                    (dx > 10 || dy > 10) ||
                    (dx > -1 && dy > -1 && dx < 10 && dy < 10 && map[dy][dx] !== 0)) {
                    canPlace = false;
                }
            }
        }
        return canPlace;
    }

    function triggerEvent(name) {
        var event;

        if (document.createEvent) {
            event = document.createEvent('Event');
            event.initEvent(name, true, true);
            document.dispatchEvent(event);
        }
    }

    function randomizeComputerShips() {
        var computerField = document.getElementById('computerField');

        MYAPP.maps.computerMap = MYAPP.helpers.getInitialMap();
        ships.forEach(function (ship) {
            var i;

            for (i = 0; i < ship.count; i++) {
                _tryPlaceShip(ship, MYAPP.maps.computerMap, computerField);
            }
        });
    }

    function randomizePlayerShips() {
        var i,
            allShips = document.getElementsByClassName('single-ship'),
            playerField = document.getElementById('playersField');

        MYAPP.maps.playerMap = MYAPP.helpers.getInitialMap();
        ships.forEach(function (ship) {
            var i;

            for (i = 0; i < ship.count; i++) {
                _tryPlaceShip(ship, MYAPP.maps.playerMap, playerField);
            }
        });
        for (i = 0; i < allShips.length; i++) {
            allShips[i].removeAttribute('ondragstart');
            allShips[i].removeAttribute('draggable');
            allShips[i].className += ' opacity-05';
        }
        triggerEvent('playerIsReady');
        MYAPP.helpers.addMessage('Your ships were set randomly!', MESSAGE_TYPES.info);
    }

    function placeShipOnField(x, y, size, direction, map, field, cellNumber) {
        var i;

        if (cellNumber && cellNumber !== 1 && size !== 1){
            x = direction === DIRECTIONS.horizontal ? x - cellNumber + 1 : x;
            y = direction === DIRECTIONS.horizontal ? y : y - cellNumber + 1;
        }
        map[y][x] = map === MYAPP.maps.playerMap ? CELL_STATES.ship : CELL_STATES.enemy;
        MYAPP.helpers.renderField(map, field);
        for (i = 1; i < size; i++) {
            if (direction === DIRECTIONS.horizontal) {
                placeShipOnField(x + 1, y, --size, direction, map, field);
            }
            if (direction === DIRECTIONS.vertical) {
                placeShipOnField(x, y + 1, --size, direction, map, field);
            }
        }
    }

    function clickOnComputerFieldHandler(e) {
        var computerMap = MYAPP.maps.computerMap,
            computerField = document.getElementById('computerField'),
            x = +e.target.dataset.x,
            y = +e.target.dataset.y;

        if (e.target.dataset.type === 'fieldcell') {
            if (MYAPP.gameState === GAME_STATES.started) {
                switch (e.target.dataset.state) {
                    case 'empty':
                        computerMap[y][x] = CELL_STATES.miss;
                        MYAPP.helpers.addMessage(getCoordinateMessage(x, y) + 'You missed!', MESSAGE_TYPES.info);
                        window.setTimeout(computerClicks, 500);
                        break;
                    case 'enemy':
                        computerMap[y][x] = CELL_STATES.injured;
                        _handleClickOnEnemyShip(x, y, computerMap);
                        break;
                    default:
                        break;
                }
                MYAPP.helpers.renderField(computerMap, computerField);
            } 
            else if (MYAPP.gameState === GAME_STATES.initialState) {
                MYAPP.helpers.addMessage('First set your ships and start the game!', MESSAGE_TYPES.warning);
            } 
            else if (MYAPP.gameState === GAME_STATES.playerIsReady) {
                MYAPP.helpers.addMessage('First press the "Start" button!', MESSAGE_TYPES.warning);
            }
        }
    }


    function computerClicks() {
        var randomIndex = Math.floor(Math.random() * MYAPP.maps.possibleAIShotsLeft.length),
            randomShot = MYAPP.maps.possibleAIShotsLeft[randomIndex],
            randomY = randomShot[0],
            randomX = randomShot[1],
            playerMap = MYAPP.maps.playerMap,
            playerField = document.getElementById('playersField');

        if (lastComputerShot) {
            _setPossibleNeighbors(lastComputerShot.x, lastComputerShot.y);
            if (!neighborsArray || neighborsArray.length === 0) {
                _setPossibleNeighbors(currentInjured.x, currentInjured.y);
            }
            randomShot = neighborsArray[Math.floor(Math.random() * neighborsArray.length)];
            randomX = randomShot[1];
            randomY = randomShot[0];
        }
        switch (playerMap[randomY][randomX]) {
            case CELL_STATES.empty:
                if (currentInjured) {
                    lastComputerShot.x = currentInjured.x;
                    lastComputerShot.y = currentInjured.y;
                }
                playerMap[randomY][randomX] = CELL_STATES.miss;
                MYAPP.helpers.renderField(playerMap, playerField);
                MYAPP.helpers.addMessage(getCoordinateMessage(randomX, randomY) + 'Computer missed!', MESSAGE_TYPES.info);
                MYAPP.maps.possibleAIShotsLeft.splice(_findCoordinateIndex(MYAPP.maps.possibleAIShotsLeft, [randomY, randomX]), 1);
                if (MYAPP.debugModeOn) {
                    MYAPP.helpers.addMessage(getCoordinateMessage(randomX, randomY) + ' { AI missed === remove cell from possible AI shots } ' + 'cells left: ' + MYAPP.maps.possibleAIShotsLeft.length);
                }
                break;
            case CELL_STATES.ship:
                playerMap[randomY][randomX] = CELL_STATES.injured;
                MYAPP.helpers.renderField(playerMap, playerField);
                if (_isKilled(currentInjured ? currentInjured.x : randomX, currentInjured ? currentInjured.y : randomY, playerMap, CELL_STATES.ship)) {
                    MYAPP.helpers.addMessage(getCoordinateMessage(randomX, randomY) + 'Your ship is killed', MESSAGE_TYPES.info);
                    MYAPP.maps.possibleAIShotsLeft.splice(_findCoordinateIndex(MYAPP.maps.possibleAIShotsLeft, [randomY, randomX]), 1);
                    if (MYAPP.debugModeOn) {
                        MYAPP.helpers.addMessage(getCoordinateMessage(randomX, randomY) + ' { Ai killed === remove cell from possible AI shots } ' + 'cells left: ' + MYAPP.maps.possibleAIShotsLeft.length);
                    }
                    neighborsArray = [];
                    currentInjured = null;
                    playerMap[randomY][randomX] = CELL_STATES.killed;
                    MYAPP.helpers.renderField(playerMap, playerField);
                    _markAllNeighbors(randomX, randomY, playerMap, true);
                    lastComputerShot = null;
                    MYAPP.models.currentAIShotingDirection = null;
                    MYAPP.models.playerShipLeft -= 1;
                    if (MYAPP.models.playerShipLeft === 0) {
                        triggerEvent('aiIsWon');
                    }
                    if (MYAPP.models.playerShipLeft > 0) {
                        window.setTimeout(computerClicks, 500);
                    }
                } 
                else {
                    if (!currentInjured) {
                        currentInjured = {
                            x: randomX,
                            y: randomY
                        };
                    } 
                    else {
                        if (currentInjured.x === randomX) {
                            MYAPP.models.currentAIShotingDirection = DIRECTIONS.vertical;
                        }
                        if (currentInjured.y === randomY) {
                            MYAPP.models.currentAIShotingDirection = DIRECTIONS.horizontal;
                        }
                    }
                    MYAPP.helpers.addMessage(getCoordinateMessage(randomX, randomY) + 'Your ship is injured', MESSAGE_TYPES.info);
                    lastComputerShot = {
                        x: randomX,
                        y: randomY
                    };
                    MYAPP.maps.possibleAIShotsLeft.splice(_findCoordinateIndex(MYAPP.maps.possibleAIShotsLeft, [randomY, randomX]), 1);
                    if (MYAPP.debugModeOn) {
                        MYAPP.helpers.addMessage(getCoordinateMessage(randomX, randomY) + ' { AI injured === remove cell from possible AI shots } ' + 'cells left: ' +
                            MYAPP.maps.possibleAIShotsLeft.length);
                    }
                    window.setTimeout(computerClicks, 500);
                    return;
                }

                break;
            default:
                break;
        }
    }

    function resetAiModels() {
        lastComputerShot = null;
        currentInjured = null;
        neighborsArray = [];
    }

    myApp.helpers.randomizeComputerShips = randomizeComputerShips;
    myApp.helpers.clickOnComputerFieldHandler = clickOnComputerFieldHandler;
    myApp.helpers.randomizePlayerShips = randomizePlayerShips;
    myApp.helpers.renderField = renderField;
    myApp.helpers.initShips = initShips;
    myApp.helpers.addMessage = addMessage;
    myApp.helpers.getPossibleShotsArray = getPossibleShotsArray;
    myApp.helpers.canPlaceShipHere = canPlaceShipHere;
    myApp.helpers.placeShipOnField = placeShipOnField;
    myApp.helpers.synchronizeAvailableShips = synchronizeAvailableShips;
    myApp.helpers.triggerEvent = triggerEvent;
    myApp.helpers.resetAiModels = resetAiModels;

    return myApp;
}(MYAPP || {}));