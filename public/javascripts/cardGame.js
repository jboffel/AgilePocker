/**
 * Created by jeannie.boffel on 2/4/2016.
 */

function drawPlayers(currentPlayers, playersDetails) {

    for(var i=0; i<currentPlayers.length; i++) {
        var playerDetail = playersDetails.find(function(a) {
            return a.position == currentPlayers[i]
        });
        drawPlayer(playerPool[currentPlayers[i]-1], playerDetail);
    }
}

function drawPlayer(player, playerDetails) {

    $('canvas').drawImage({
        source: 'http://gravatar.com/avatar/' + playerDetails.emailMd5 + '?s=120',
        layer: true,
        groups: [player.playerId],
        x: 512,
        y: 768,
        width: 0,
        height: 0
    });

    var fillStyle, strokeStyle;

    if (myPosition == playerDetails.position) {
        fillStyle = '#ddd';
        strokeStyle = '#19f';
    } else {
        fillStyle = '#aaa';
        strokeStyle = '#aaa';
    }

    $('canvas').drawText({
        layer: true,
        groups: [player.playerId],
        fillStyle: fillStyle,
        strokeStyle: strokeStyle,
        strokeWidth: 1,
        x: 512, y: 838,
        fontSize: 14,
        fontFamily: 'Verdana, sans-serif',
        text: playerDetails.userId
    });

    $('canvas')
        .animateLayerGroup(player.playerId, {
            y: '-=' + 384,
            width: 100, height: 120
        }, 1000, function(layer) {
            var newX;
            var newY;
            if (player.position.x > 512) {
                newX = player.position.x - 512;
                newX = '+=' + newX;
            } else {
                newX = -1 * (player.position.x - 512);
                newX = '-=' + newX;
            }
            if (player.position.y > 384) {
                newY = player.position.y - 384;
                newY = '+=' + newY;
            } else {
                newY = -1 * (player.position.y - 384);
                newY = '-=' + newY;
            }
            $(this).animateLayer(layer, {
                x: newX, y: newY,
                rotate: 360
            }, 'slow', 'swing');
        });
}

var socket = io();

socket.on('loginAvailability', function (result) {
    if (result.success) {
        $('#identification').hide();
        $('#identification-error').hide();
        $('canvas').removeLayers().drawLayers();
        $('#poker').show();
    } else {
        $('#poker').hide();
        $('#identification-error').show();
        $('#identification-error').html(result.message);
        $('#identification').show();
    }
});

function identify() {
    if ($('#user-id').val() == '') {
        $('#identification-error').show();
        $('#identification-error').html('Login is mandatory!');
    } else if ($('#user-mail').val() == '') {
        $('#identification-error').show();
        $('#identification-error').html('Email is mandatory!');
    } else {
        $('#identification-error').hide();

        localStorage.pokerUser = $('#user-id').val();
        localStorage.pokerUserMail = $('#user-mail').val();
        //socket.emit('scrumMaster');
        socket.connect();
        socket.emit('loginCheck', {userId: $('#user-id').val(), emailMd5: $.md5($('#user-mail').val())});

        $('#identification-error').html('Pending connection!');
        $('#identification-error').show();
    }
}

function appDisconnect() {

    //var layers = $('canvas').getLayers();
    //
    //for(var i=0; i<layers.length; i++) {
    //    $('canvas').removeLayer(layers[i].name).drawLayers();
    //}

    $('canvas').removeLayers().drawLayers();

    myPosition = '';
    playerPool = [];

    socket.disconnect();

    $('#identification-error').hide();

    localStorage.pokerUser = $('#user-id').val();
    localStorage.pokerUserMail = $('#user-mail').val();

    $('#poker').hide();
    $('#identification').show();
}

function startEstimation() {
    $('#revealScore').prop('disabled', true);
    socket.emit('startEstimation');
}

function showScores() {
    socket.emit('showScores');
}

function sendEstimation() {
    if ($('#estimation').val() != '') {
        socket.emit('estimation', {myPosition: myPosition, estimation: $('#estimation').val()});
    } else {
        alert('You must input your estimation before send it!');
    }
}

function connectScrumMaster() {
    $('canvas').removeLayers().drawLayers();
    socket.connect();
    socket.emit('scrumMaster', {emailMd5: $.md5($('#scrumMasterMail').val())});
}

function disconnectScrumMaster() {
    socket.disconnect();
    $('canvas').removeLayers().drawLayers();
}

function connectSpectator() {
    $('canvas').removeLayers().drawLayers();
    socket.emit('spectator');
}

var playerPool;
var myPosition;

socket.on('newEstimation', function () {
    $('canvas').removeLayerGroup('scores').drawLayers();
    displayInformation('Let\'s estimate!')
});

socket.on('gotEstimation', function (param) {
    //alert('Estimation recorded!');

    $('canvas').removeLayer('score' + param.position).drawLayers();

    $('canvas').drawText({
        layer: true,
        name: 'score' + param.position,
        groups: ['scores', 'player' + param.position],
        fillStyle: '#f00',
        strokeStyle: '#f00',
        strokeWidth: 1,
        x: 512, y: 838,
        fontSize: 0,
        fontFamily: 'Verdana, sans-serif',
        text: 'Check!'
    });

    $('canvas')
        .animateLayer('score' + param.position, {
                y: 384,
                fontSize: 24,
            }, 1000, function (layer) {
                $(this).animateLayer(layer, {
                    x: playerPool[parseInt(layer.name.substr('score'.length))-1].scorePosition.x,
                    y: playerPool[parseInt(layer.name.substr('score'.length))-1].scorePosition.y,
                    rotate: 360
                }, 'slow', 'swing');
            }
        );
});

socket.on('disableShowScores', function () {

    $('canvas').removeLayer('information').drawLayers();

    if ($('#revealScore') != undefined) {
        $('#revealScore').prop('disabled', true);
    }
});

socket.on('allEstimations', function () {

    displayInformation('OK! Let\'s share!');

    if ($('#revealScore') != undefined) {
        //alert('Ready to show scores!');
        $('#revealScore').prop('disabled', false);
    }
});

function displayInformation (textInfo) {
    $('canvas').removeLayer('information').drawLayers();

    $('canvas').drawText({
        layer: true,
        name: 'information',
        fillStyle: '#000',
        strokeStyle: '#000',
        strokeWidth: 1,
        x: 512, y: 384,
        fontSize: 0,
        fontFamily: 'Verdana, sans-serif',
        text: textInfo
    });

    $('canvas')
        .animateLayer('information', {
            fontSize: 80
        }, 2000);
}

socket.on('displayScores', function (scores) {
    //alert('Scores released!');

    $('canvas').removeLayerGroup('scores').drawLayers();

    console.log(scores);

    for(var i = 0; i < scores.length; i++) {
        $('canvas').drawText({
            layer: true,
            name: 'score' + scores[i].position,
            groups: ['scores', 'player' + scores[i].position],
            fillStyle: '#f00',
            strokeStyle: '#f00',
            strokeWidth: 1,
            x: 512, y: 838,
            fontSize: 0,
            fontFamily: 'Verdana, sans-serif',
            text: scores[i].score
        });

        $('canvas')
            .animateLayer('score' + scores[i].position, {
                y: 384,
                fontSize: 46
            }, 1000, function (layer) {
                $(this).animateLayer(layer, {
                    x: playerPool[parseInt(layer.name.substr('score'.length))-1].scorePosition.x,
                    y: playerPool[parseInt(layer.name.substr('score'.length))-1].scorePosition.y,
                    rotate: 360
                }, 'slow', 'swing');
            }
        );
    }
});

socket.on('newUser', function (param) {
    //alert('New User Arrived!');
    drawPlayer(param.playerPosition, param.userDetails);
});

socket.on('drawUsers', function (params) {
    myPosition = params.myPosition;
    playerPool = params.playerPool;
    drawPlayers(params.currentUsers, params.usersDetails);
});

socket.on('removeUser', function (param) {
    //alert('User disconnected!');
    $('canvas').removeLayerGroup('player' + param.position).drawLayers();
    //$('canvas').removeLayer('player' + param.position).drawLayers();
});

if (localStorage.pokerUser) {
    $('#user-id').val(localStorage.pokerUser);
}

if (localStorage.pokerUserMail) {
    $('#user-mail').val(localStorage.pokerUserMail);
}