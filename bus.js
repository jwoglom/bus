var stage = new Kinetic.Stage({
    container: 'container',
    width: 2500,
    height: 2500
});
window.mouseDown = false;
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
function createBus(layer, busName, moveable) {
    if(busName == 'nuke') {
        return nuke();
    }
    var rotate = true;
    var textbox = (busName != null && busName.substring(0,5) == 'text:');
    var tbn = busName.substring(5);
    console.log('createBus '+busName);
    if(typeof moveable == 'undefined') moveable = true;
    var group = new Kinetic.Group({
        draggable: moveable
    });
    var sx = 150, sy = 150; // x, y start
    var sxd = 5, syd = 6; // x, y difference
    var sw = 50, sh = 50; // width, height start
    var sf = 20; // font size
    if(busName.length >= 6) {
        sw = 100;
    }
    if(busName.length >= 10) {
        sf = 18;
        sh = 75;
        sxd = 4;
    }
    if(busName.length >= 15) {
        sf = 15;
    }
    var rect = new Kinetic.Rect({
        x: sx,
        y: sy,
        rotationDeg: rotate ? 315 : 0,
        width: sw,
        height: (3/5) * sh,
        fill: 'yellow',
        stroke: 'yellow',
        strokeWidth: 2
    });
    var text = new Kinetic.Text({
        x: !rotate ? sx : sx + sxd,
        y: sy + syd,
        text: decode(textbox ? tbn : busName),
        rotationDeg: rotate ? 315 : 0,
        fill: 'black',
        stroke: '',
        opacity: 1.0,
        width: sw,
        height: sh,
        fontSize: sf,
        fontFamily: 'Roboto',
        align: 'center'
    });
    group.add(rect);
    group.add(text);
    positions[busName] = [0, 0, 'yellow'];
    positionsChanged[busName] = true;
    if(moveable) {
        group.on('mousedown', function() {
            window.mouseDown = true;
            console.debug('Mousedown');
        });
        group.on('mouseup', function() {
            window.mouseDown = false;
            console.debug('Mouseup');
        })
        group.on('dblclick', function() {
            // Allow double-click toggling
            if($(".updater").css("display") != "none" && $(".updater").attr("data-bus") == busName) {
                $(".updater").hide();
                return;
            }

            var ul = positions[busName][0];
            var ut = (parseInt(positions[busName][1])+75);
            if(ul < 10) ul = 10;
            if(ut < 30) ut = 30;
            $(".updater").show().css({"left": ul+"px", "top": ut+"px"}).attr("data-bus", busName);
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
                    moveBus(busName, -999, -999, opos[2]);
                    createBus(layer, nn, moveable);
                    moveBus(nn, opos[0], opos[1]);
                    $(".updater").hide();
                }
            });

            var col = positions[busName][2];
            $(".updater #updaterColor").attr("data-color", col)
                                       .css("background-color", col)
                                       .click(function() {
                if($(this).parent().parent().attr("data-bus") == busName) {
                    var col = $(this).attr("data-color").trim();

                     if(col == "lightgreen") ncol = "red";
                    else if(col == "red") ncol = "yellow";
                    else ncol = "lightgreen"; // if(col == "yellow")

                    console.info("Color: "+col+" ncol: "+ncol);
                    $(this).attr("data-color", ncol).css("background-color", ncol);

                    positionsChanged[busName] = true;
                    var cloc = positions[busName];
                    moveBus(busName, -999, -999, "");
                    createBus(layer, busName, moveable);
                    moveBus(busName, cloc[0], cloc[1], ncol);

                   
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
            positions[busName] = [group.getAbsolutePosition().x, group.getAbsolutePosition().y, positions[busName][2]];
            positionsChanged[busName] = true;
            window.saved = false; unsavedAnim();
        });
    }
    
    buses[busName] = group;
    layer.add(group);
    group.draw();

}

function moveBus(busName, posX, posY, color) {
    console.log('Moving '+busName+' '+posX+' '+posY+' ('+color+')');
    positions[busName] = [posX, posY, color];
    buses[busName].setAbsolutePosition(posX, posY);
    if(color && color != undefined && color.length > 0) {
        var bg = buses[busName].children[0];
        bg.attrs.fill = color;
        bg.attrs.stroke = color;
    }
    stage.draw();
    console.log()

}

function cBus() {
    var v = document.getElementById('busName').value;
    if(v == 'nuke') nuke();
    else createBus(window.layer, v);
}

function nuke() {
    if(confirm('Are you sure you want to remove ALL buses on the screen?')) $.post('update.php', {'act': 'init'}, function() { location.reload(); });
}

checkChanges = function() {
    var request = {}, chgd = false;
    for(i in positionsChanged) {
        if(positionsChanged[i]) {
            positionsChanged[i] = false;
            chgd = true;
            request[i] = positions[i][0]+','+positions[i][1]+','+positions[i][2];
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
    $.post('buses.txt', {}, function(d) {
        for(i in d) {
            var pC = d[i].split(',');
            createBus(layer, i, window.isUpdate);
            moveBus(i, pC[0], pC[1], pC[2]);
            stage.draw();
            buses[i].draw();
        }

    }, 'JSON');
}

checkMoves = function() {
    if(window.mouseDown) {
        console.debug('Waiting on update check.');
        return;
    }
    $.post('buses.txt', {}, function(d) {
        console.log(d);
        if(window.mouseDown) {
            console.debug('Skipping update check.');
            return;
        }
        for(i in d) {
            var pC = d[i].split(',');
            // new bus
            if(typeof positions[i] == 'undefined' && typeof buses[i] == 'undefined') {
                console.info('REMOTE Addbus:');
                createBus(layer, i, window.isUpdate);
                moveBus(i, pC[0], pC[1], pC[2]);
                stage.draw();
                buses[i].draw();
                console.info('-------');
            // move
            } else {
                if(!(positions[i][0] == pC[0] && positions[i][1] == pC[1] && positions[i][2] == pC[2])) {
                    console.info('REMOTE Movebus:');
                    moveBus(i, pC[0], pC[1], pC[2]);
                    stage.draw();
                    buses[i].draw();
                    console.info('-------');
                }
            }
        }
    }, 'JSON');
}

savedAnim = function() { $('.saved').html('Saved'); }
unsavedAnim = function() { $('.saved').html('Unsaved'); }
