/**
 * Created by jeannie.boffel on 2/4/2016.
 */

require('array.prototype.find');
var socketio = require('socket.io');


module.exports = function() {
  var io = socketio.listen(arguments[0], {});

  var playerPool = [
    {playerId: 'player1', position: {x: 512-120*1.7, y: 70}, scorePosition: {x: 512-120*1.7, y: 70+100}},
    {playerId: 'player2', position: {x: 512-120*2.7, y: 70}, scorePosition: {x: 512-120*2.7, y: 70+100}},
    {playerId: 'player3', position: {x: 512-120*3.7, y: 70+70*2}, scorePosition: {x: 512-120*3.7+90, y: 70+70*2}},
    {playerId: 'player4', position: {x: 512-120*3.7, y: 70+70*4.2}, scorePosition: {x: 512-120*3.7+90, y: 70+70*4.2}},
    {playerId: 'player5', position: {x: 512-120*3.7, y: 70+70*6.4}, scorePosition: {x: 512-120*3.7+90, y: 70+70*6.4}},
    {playerId: 'player6', position: {x: 512-120*2.5, y: 70+70*8.6}, scorePosition: {x: 512-120*2.5, y: 70+70*8.6-90}},
    {playerId: 'player7', position: {x: 512-120*1.5, y: 70+70*8.6}, scorePosition: {x: 512-120*1.5, y: 70+70*8.6-90}},
    {playerId: 'player8', position: {x: 512-120*0.5, y: 70+70*8.6}, scorePosition: {x: 512-120*0.5, y: 70+70*8.6-90}},
    {playerId: 'player9', position: {x: 512+120*0.5, y: 70+70*8.6}, scorePosition: {x: 512+120*0.5, y: 70+70*8.6-90}},
    {playerId: 'player10', position: {x: 512+120*1.5, y: 70+70*8.6}, scorePosition: {x: 512+120*1.5, y: 70+70*8.6-90}},
    {playerId: 'player11', position: {x: 512+120*2.5, y: 70+70*8.6}, scorePosition: {x: 512+120*2.5, y: 70+70*8.6-90}},
    {playerId: 'player12', position: {x: 512+120*3.7, y: 70+70*6.4}, scorePosition: {x: 512+120*3.7-90, y: 70+70*6.4}},
    {playerId: 'player13', position: {x: 512+120*3.7, y: 70+70*4.2}, scorePosition: {x: 512+120*3.7-90, y: 70+70*4.2}},
    {playerId: 'player14', position: {x: 512+120*3.7, y: 70+70*2}, scorePosition: {x: 512+120*3.7-90, y: 70+70*2}},
    {playerId: 'player15', position: {x: 512+120*2.7, y: 70}, scorePosition: {x: 512+120*2.7, y: 70+100}},
    {playerId: 'player16', position: {x: 512+120*1.7, y: 70}, scorePosition: {x: 512+120*1.7, y: 70+100}}
  ];

  var users = [];
  var scrumMaster = {playerId: 'player0', position: {x: 512, y: 70}, scorePosition: {x: 512, y:384}, socketId: undefined};

  var bingo = {
    selectedNumbers: [],
    generateRandom: function() {
      var min = 1;
      var max = playerPool.length;
      var random = Math.floor(Math.random() * (max - min + 1)) + min;
      return random;
    },
    generateNextRandom: function() {
      if (bingo.selectedNumbers.length > playerPool.length-1) {
        return 0;
      }
      var random = bingo.generateRandom();
      while (bingo.selectedNumbers.find(function (a) { return random == a }) == random) {
        random = bingo.generateRandom();
      }
      bingo.selectedNumbers.push(random);
      return random;
    }
  };

  var estimation = {
    scores: [],
    addUserScore: function (param) {
      var i = -1;
      estimation.scores.find(function (a, index) {
        if (a.position == param.myPosition) {
          i = index;
          return true;
        }
        return false;
      });
      if (i != -1) {
        estimation.scores[i].score = param.estimation;
        return 1;
      }
      estimation.scores.push({position: param.myPosition, score: param.estimation});
      return 1;
    },
    removeScore: function (position) {
      var i = -1;
      estimation.scores.find(function (a, index) {
        if (a.position == position) {
          i = index;
          return true;
        }
        return false;
      });
      if (i != -1) {
        estimation.scores.splice(i, 1);
        return 1;
      }
      return 0;
    },
    resetScore: function () {
      estimation.scores.length = 0;
    },
    isAllScoreReady: function (currentUsers) {
      if (currentUsers.length == 0) {
        return false;
      }
      for(var i = 0; i < currentUsers.length; i++) {
        res = estimation.scores.find(function (a) {
          return a.position == currentUsers[i];
        });
        if (res == undefined) {
          return false;
        }
      }
      return true;
    }
  };

  io.on('connection', function(socket){
    console.log('a user connected');

    socket.on('scrumMaster', function(param) {
      console.log('scrumMaster is connected');
      if (scrumMaster.socketId != undefined) {
        console.log('Already have a scrumMaster, discarding connection');
        return;
      }
      scrumMaster.socketId = socket.id;
      console.log(scrumMaster);
      //socket.broadcast.emit('newUser', {playerPosition: scrumMaster, userDetails: {userId: 'scrumMaster', emailMd5: param.emailMd5, position: 0, socketId: socket.id}});
      io.emit('newUser', {playerPosition: scrumMaster, userDetails: {userId: 'scrumMaster', emailMd5: param.emailMd5, position: 0, socketId: socket.id}});
      socket.emit('drawUsers', {playerPool: playerPool, currentUsers: bingo.selectedNumbers, usersDetails: users, myPosition: 0});
    });

    socket.on('estimation', function (param) {
      estimation.addUserScore(param);
      if (estimation.isAllScoreReady(bingo.selectedNumbers)) {
        if(scrumMaster.socketId != undefined)
          socket.broadcast.emit('allEstimations');
        console.log('Ready to show scores!');
      }
      socket.emit('gotEstimation');
      console.log(estimation.scores);
      console.log(bingo.selectedNumbers);
    });
    socket.on('startEstimation', function () {
      console.log('Start new estimation!');
      if(scrumMaster.socketId != undefined) {
        estimation.resetScore();
        //socket.broadcast.emit('newEstimation');
        io.emit('newEstimation');
      }
    });
    socket.on('showScores', function () {
      if(scrumMaster.socketId != undefined)
        //socket.broadcast.emit('displayScores', estimation.scores);
        io.emit('displayScores', estimation.scores);
    });
    socket.on('loginCheck', function(param) {
      console.log('authentication');

      var myPosition;

      var res = users.find(function (a) {return param.userId == a.userId});

      console.log(res);

      if (res != undefined && res.userId ==
          param.userId) {
        //myPosition = res.position;
        socket.emit('loginAvailability', {success: false, message: 'Already logged user!'});
        return;
      } else {
        myPosition = bingo.generateNextRandom();
        if (myPosition == 0) {
          socket.emit('loginAvailability', {success: false, message: 'This server reach the maximal user number!'});
          return;
        }
        res = {userId: param.userId, emailMd5: param.emailMd5, position: myPosition, socketId: socket.id};
        users.push(res);
      }

      if (scrumMaster.socketId != undefined)
        socket.broadcast.emit('disableShowScores');

      socket.emit('loginAvailability', {success: true});

      var playerPosition = myPosition;
      socket.broadcast.emit('newUser', {playerPosition: playerPool[playerPosition-1], userDetails: res});
      socket.emit('drawUsers', {playerPool: playerPool, currentUsers: bingo.selectedNumbers, usersDetails: users, myPosition: myPosition});
      if (scrumMaster.socketId != undefined)
        socket.emit('newUser', {playerPosition: scrumMaster, userDetails: {userId: 'scrumMaster', emailMd5: param.emailMd5, position: 0, socketId: socket.id}});
      //console.log(users);
      //console.log(bingo.selectedNumbers);
    });

    socket.on('disconnect', function(message) {
      console.log('Disconnection: ' + message);
      console.log(scrumMaster);
      if (scrumMaster.socketId != undefined && socket.id == scrumMaster.socketId) {
        console.log('scrumMaster disconnected');
        scrumMaster.socketId = undefined;
        socket.broadcast.emit('removeUser', {position: 0});
        if (estimation.isAllScoreReady(bingo.selectedNumbers)) {
          socket.broadcast.emit('allEstimations');
        } else {
          socket.broadcast.emit('disableShowScores');
        }
        return;
      }


      if (users.length == 0) return;

      var i = -1;

      users.find(function(a, index) {
        if (a.socketId == socket.id) {
          i = index;
          return true;
        }
        return false;
      })

      if (i == -1) return;

      //console.log(i);
      //console.log(users);
      estimation.removeScore(users[i].position);
      socket.broadcast.emit('removeUser', {position: users[i].position});
      bingo.selectedNumbers.splice(bingo.selectedNumbers.indexOf(users[i].position), 1);
      users.splice(i, 1);

      if (estimation.isAllScoreReady(bingo.selectedNumbers)) {
        if (scrumMaster.socketId != undefined)
          socket.broadcast.emit('allEstimations');
      } else {
        if (scrumMaster.socketId != undefined)
          socket.broadcast.emit('disableShowScores');
      }
      //console.log(users);
      //console.log(bingo.selectedNumbers);
    });
  });

};
