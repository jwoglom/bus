var stage = new Kinetic.Stage({
    container: 'container',
    width: 2500,
    height: 2500
});

var layer = new Kinetic.Layer();

var buses = {},
    positions = {},
    positionsChanged = {};
function renameBus(busText) {
    busText.setText(document.getElementById('busName').value);
}
decode = function(text) {
    return decodeURIComponent(text).replace(/_/g, ' ');
}
function createText(layer, title, itext, moveable) {
    var group = new Kinetic.Group({
    	draggable: moveable
    });
    var rect = new Kinetic.Rect({
    	x: 50,
	y: 50,
	width: 200,
	height: 200
    });
    var text = new Kinetic.Text({
    	x: 54,
	y: 54,
	text: decode(itext),
	fill: 'black',
	opacity: 1.0,
	width: 200,
	height: 200,
	fontSize: 22,
	fontFamily: 'ComicSans',
	align: 'center'
    });
    var text2 = new Kinetic.Text({
	x: 54,
	y: 84,
	text: decode(title),
	fill: 'black',
	opacity: 1.0,
	width: 200,
	height: 170,
	fontSize: 14,
	fontFamily: 'ComicSans',
	align: 'center'
    });
    group.add(rect);
    group.add(text);
    if (moveable) {
        group.on('dragmove', function() {
            console.log(group.getAbsolutePosition().x+', '+group.getAbsolutePosition().y);
            positions[busName] = [group.getAbsolutePosition().x, group.getAbsolutePosition().y];
            positionsChanged[busName] = true;
            window.saved = false; unsavedAnim();
        });
    }
    layer.add(group);
    group.draw();
}
function createBus(layer, busName, moveable) {
    var rotate = true;
    var textbox = (busName != null && busName.substring(0,5) == 'text:');
    var tbn = busName.substring(5);
    console.log('createBus '+busName);
    if(typeof moveable == 'undefined') moveable = true;
    var group = new Kinetic.Group({
        draggable: moveable
    });
    var rect = new Kinetic.Rect({
        x: 50,
        y: 50,
        rotationDeg: rotate ? 315 : 0,
        width: 50,
        height: 30,
        fill: 'yellow',
        stroke: 'yellow',
        strokeWidth: 2
    });
    var text = new Kinetic.Text({
        x: !rotate ? 50 : 55,
        y: 56,
        text: decode(textbox ? tbn : busName),
        rotationDeg: rotate ? 315 : 0,
        fill: 'black',
        stroke: '',
        opacity: 1.0,
        width: 50,
        height: 50,
        fontSize: 20,
        fontFamily: 'Roboto',
        align: 'center'
    });
    group.add(rect);
    group.add(text);
    positions[busName] = [0, 0];
    positionsChanged[busName] = true;
    if(moveable) {
        group.on('dblclick', function() {
            // Allow double-click toggling
            if($(".updater").css("display") != "none" && $(".updater").attr("data-bus") == busName) {
                $(".updater").hide();
                return;
            }
            $(".updater").show()
                         .css({
                            "left": positions[busName][0]+"px",
                            "top": (parseInt(positions[busName][1])+75)+"px"
                        }).attr("data-bus", busName);
            $(".updater > input").val(busName);
            $(".updater #updaterDelete").click(function() {
                if($(this).parent().parent().attr("data-bus") == busName) {
                    positionsChanged[busName] = true;
                    var opos = positions[busName];
                    moveBus(busName, -999, -999);
                    $(".updater").hide();
                }
            });

            $(".updater #updaterChange").click(function() {
                if($(this).parent().parent().attr("data-bus") == busName) {
                    var nn = $(".updater > input").val();
                    console.log("Changing name to "+nn)
                    positionsChanged[busName] = true;
                    var opos = positions[busName];
                    moveBus(busName, -999, -999);
                    createBus(layer, nn, moveable);
                    moveBus(nn, opos[0], opos[1]);
                    $(".updater").hide();
                }
            });
            /*
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
            } else if(c[0] == 'nuke') {
                nuke();
            }*/
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
    var v = document.getElementById('busName').value;
    if(v == 'nuke') nuke();
    else createBus(window.layer, v);
}

function nuke() {
    if(confirm('Are you sure you want to nuke?')) $.post('update.php', {'act': 'init'}, function() { location.reload(); });
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

loadBuses = function(layer, moveable) {
    $.post('update.php', {'act': 'fetch'}, function(d) {
        for(i in d) {
            var pC = d[i].split(',');
            createBus(layer, i, moveable);
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
            // new bus
            if(typeof positions[i] == 'undefined' && typeof buses[i] == 'undefined') {
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
