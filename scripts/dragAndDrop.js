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
            cellNumber = +e.dataTransfer.getData('cellNumber'),
            canPlaceShip = MYAPP.helpers.canPlaceShipHere(x, y, shipSize, shipDirection, MYAPP.maps.playerMap, cellNumber);

        if (canPlaceShip) {
            MYAPP.helpers.placeShipOnField(x, y, shipSize, shipDirection, MYAPP.maps.playerMap, playerField, cellNumber);
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
        var cellNumber = e.target.dataset.direction === 'horizontal' ?
                            Math.ceil(+e.offsetX/30) :
                            Math.ceil(+e.offsetY/30);
        _currentDraggingShip = e.target;
        e.dataTransfer.setData('size', e.target.dataset.shipSize);
        e.dataTransfer.setData('direction', e.target.dataset.direction);
        e.dataTransfer.setData('cellNumber', cellNumber);
    }

    function dragging(e){
        var app = document.getElementById('app'),
            fieldOffestLeft = app.offsetLeft,
            fieldOffestTop = app.offsetTop + playerField.offsetTop;

            var temp = document.createElement('div');
            temp.classList.add('ship-shadow');
            
            temp.style.width = '30px';
            temp.style.height = '30px';
            playerField.appendChild(temp);
            temp.style.setProperty('top', e.clientY - fieldOffestTop + 'px');
            temp.style.setProperty('left', e.clientX - fieldOffestLeft + 'px');                 
            
             
        console.log(e.clientX, e.clientY, new Date().getMilliseconds());
    }

    myApp.dragNDrop.allowDrop = allowDrop;
    myApp.dragNDrop.drop = drop;
    myApp.dragNDrop.drag = drag;
    myApp.dragNDrop.dragging = dragging;

    return myApp;
}(MYAPP || {}));
