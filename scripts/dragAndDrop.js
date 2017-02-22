'use strict';

var MYAPP = (function(myApp) {
    var playerField = document.getElementById('playersField'),
        _currentDraggingShip = null,
        shipsToPlaceLeft = MYAPP.consts.MAX_SHIPS,
        MESSAGE_TYPES = MYAPP.consts.MESSAGE_TYPES;

    function allowDrop(e) {
        e.preventDefault();
    }

    function drop(e) {
        e.preventDefault();
        var x = +e.target.dataset.x,
            y = +e.target.dataset.y,
            shipSize = +e.dataTransfer.getData('size'),
            shipDirection = e.dataTransfer.getData('direction'),
            canPlaceShip = MYAPP.helpers.canPlaceShipHere(x, y, shipSize, shipDirection, MYAPP.maps.playerMap);

        if (canPlaceShip) {
            MYAPP.helpers.placeShipOnField(x, y, shipSize, shipDirection, MYAPP.maps.playerMap, playerField);
            _currentDraggingShip.removeAttribute('ondragstart');
            _currentDraggingShip.removeAttribute('draggable');
            _currentDraggingShip.className += ' opacity-05';
            if (shipSize > 1) {
                MYAPP.helpers.synchronizeAvailableShips(shipSize, shipDirection);
            }
            shipsToPlaceLeft--;
            if (shipsToPlaceLeft === 0) {
                MYAPP.helpers.triggerEvent('playerIsReady');
            }
        } 
        else {
            MYAPP.helpers.addMessage('Cant place ship there!', MESSAGE_TYPES.warning);
        }
    }

    function drag(e) {
        _currentDraggingShip = e.target;
        e.dataTransfer.setData('size', e.target.dataset.shipSize);
        e.dataTransfer.setData('direction', e.target.dataset.direction);
    }

    myApp.dragNDrop.allowDrop = allowDrop;
    myApp.dragNDrop.drop = drop;
    myApp.dragNDrop.drag = drag;

    return myApp;
}(MYAPP || {}));
