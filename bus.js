function renameBus(busText) {
    busText.setText(document.getElementById('busName').value);
}

function createBus(layer, busName, moveable) {
    console.log('createBus '+busName);
    if(typeof moveable == 'undefined') moveable = true;
    var group = new Kinetic.Group({
        draggable: moveable
    });
    var rect = new Kinetic.Rect({
        x: 50,
        y: 50,
        width: 40,
        height: 200,
        fill: 'yellow',
        stroke: 'yellow',
        strokeWidth: 2
    });
    var text = new Kinetic.Text({
        x: 54,
        y: 250,
        text: busName,
        rotationDeg: 270,
        fill: 'black',
        stroke: 'black',
        opacity: 1.0,
        width: 200,
        height: 40,
        fontSize: 32,
        fontFamily: 'ComicSans',
        align: 'center'
    });
    group.add(rect);
    group.add(text);
    positions[busName] = [0, 0];
    positionsChanged[busName] = true;
    if(moveable) {
        group.on('dblclick', function() {
            var p = prompt('Choose one of the following commands:\n\n'+
                           '\ttitle [new title]\t\tChange title\n'+
                           '\tdelete\t\t\tDelete this\n'+
                           '\tmove [x] [y]\t\tMove to position (x,y)\n'+
                           '\tchanged\t\t\tForce change position\n'+
                           '\nType your choice below..');
            var c = p.split(' ',1);
            if(c[0] == 'title' || c[0] == 'delete') {
                positionsChanged[busName] = true;
                var opos = positions[busName];
                moveBus(busName, -999, -999);
                if(p != 'delete') {
                    createBus(layer, c[1], moveable);
                    moveBus(c[1], opos[0], opos[1]);
                }
            } else if(c[0] == 'move') {
                var mv = p.split(' ');
                moveBus(busName, mv[1], mv[2]);
                positionsChanged[busName] = true;
            } else if(c[0] == 'changed') {
                positionsChanged[busName] = true;
            }
        });
        group.on('dragmove', function() {
            console.log(group.getAbsolutePosition().x+', '+group.getAbsolutePosition().y);
            positions[busName] = [group.getAbsolutePosition().x, group.getAbsolutePosition().y];
            positionsChanged[busName] = true;
            window.saved = false; unsavedAnim();

        });
    }
    
    buses[busName] = group;
    layer.add(group);
    group.draw();

}

function moveBus(busName, posX, posY) {
    console.log('Moving '+busName+' '+posX+' '+posY);
    positions[busName] = [posX, posY];
    buses[busName].setAbsolutePosition(posX, posY);
    stage.draw();
    console.log()

}

function cBus() {
    createBus(window.layer, document.getElementById('busName').value);
}




checkChanges = function() {
    var request = {}, chgd = false;
    for(i in positionsChanged) {
        if(positionsChanged[i]) {
            positionsChanged[i] = false;
            chgd = true;
            request[i] = positions[i][0]+','+positions[i][1];
        }
    }
    if(chgd) {
        console.log(request);
        request['act'] = 'change';
        $.post('update.php', request, function(d) {
            window.saved = true; savedAnim();
        });
    }
}

loadBuses = function(layer) {
    $.post('update.php', {'act': 'fetch'}, function(d) {
        for(i in d) {
            var pC = d[i].split(',');
            createBus(layer, i, false);
            moveBus(i, pC[0], pC[1]);
            stage.draw();
            buses[i].draw();
        }

    }, 'JSON');
}

checkMoves = function() {
    $.post('update.php', {'act': 'fetch'}, function(d) {
        console.log(d);
        for(i in d) {
            var pC = d[i].split(',');
            // delete bus
            if(d[i] == 'delete') {
                if(typeof positions[i] != 'undefined') {
                    positions[i] = [-999, -999];
                }
            // new bus
            } else if(typeof positions[i] == 'undefined' && typeof buses[i] == 'undefined') {
                createBus(layer, i, false);
                moveBus(i, pC[0], pC[1]);
                stage.draw();
                buses[i].draw();
            // move
            } else {
                if(!(positions[i][0] == pC[0] && positions[i][1] == pC[1])) {
                    moveBus(i, pC[0], pC[1]);
                    stage.draw();
                    buses[i].draw();
                }
            }
        }
    }, 'JSON');
}

savedAnim = function() { $('.saved').html('Saved'); }
unsavedAnim = function() { $('.saved').html('Unsaved'); }