var Iojs = require('../io');
var sinon = require('sinon');

describe('When a spectator is connecting spectatorConnection will be called', function () {
    var socket;
    beforeEach(function() {
        socket = {emit:sinon.spy()};
    });

    it('never fail even no user or no scrumMaster are connected', function () {
        var result = Iojs.agilePoker.spectatorConnection(socket);

        expect(result).equal(undefined);

        assert(socket.emit.calledOnce);

        assert(socket.emit.calledWith('drawUsers', {
            playerPool: Iojs.playerPool,
            currentUsers: Iojs.bingo.selectedNumbers,
            usersDetails: Iojs.users,
            myPosition: 0
        }));
    });
    it('never fail even no user are connected', function () {
        socket.id = 'something';
        Iojs.scrumMaster.socketId = 'something';
        var result = Iojs.agilePoker.spectatorConnection(socket);

        expect(result).equal(undefined);

        assert(socket.emit.calledTwice);

        assert(socket.emit.firstCall.calledWith('newUser', {
            playerPosition: Iojs.scrumMaster,
            userDetails: {userId: 'scrumMaster', emailMd5: Iojs.scrumMaster.emailMd5, position: 0, socketId: Iojs.scrumMaster.socketId}
        }));

        assert(socket.emit.secondCall.calledWith('drawUsers', {
            playerPool: Iojs.playerPool,
            currentUsers: Iojs.bingo.selectedNumbers,
            usersDetails: Iojs.users,
            myPosition: 0
        }));
    });
});

describe('When the scrumMaster is connecting several times', function () {
    var socket, io;
    beforeEach(function () {
        socket = {emit:sinon.spy(), id: 'something'};
        io = {emit:sinon.spy()};
    });

    it('should work the first time then call emit functions', function () {
        Iojs.scrumMaster.socketId = undefined;
        var result = Iojs.agilePoker.scrumMasterConnection(io, socket, {emailMd5: ''});

        expect(result).equal(undefined);

        assert(socket.emit.calledOnce);

        assert(io.emit.calledOnce);

        assert(socket.emit.firstCall.calledWith('drawUsers', {
            playerPool: Iojs.playerPool,
            currentUsers: Iojs.bingo.selectedNumbers,
            usersDetails: Iojs.users,
            myPosition: 0
        }));

        assert(io.emit.firstCall.calledWith('newUser', {
            playerPosition: Iojs.scrumMaster,
            userDetails: {userId: 'scrumMaster', emailMd5: '', position: 0, socketId: socket.id}
        }));
    });
    it('then should fail any other time if the scrumMaster is not disconnecting', function () {
        var result = Iojs.agilePoker.scrumMasterConnection(io, socket, {emailMd5: ''});

        expect(result).equal(undefined);

        assert(socket.emit.notCalled);

        assert(io.emit.notCalled);
    });
});

describe('When a user is sending an estimation', function () {

    var socket1, socket2, io;
    beforeEach(function () {
        socket1 = {emit:sinon.spy(), id: 'something1'};
        socket2 = {emit:sinon.spy(), id: 'something2'};
        io = {emit:sinon.spy()};
    });

    it('should get the user position and emit gotEstimation to all the room', function () {
        var param = {myPosition:1, estimation: 10};
        var user1 = {userId: 'test1', emailMd5: 'myEmailSum', position: 1, socketId: socket1.id};
        var user2 = {userId: 'test2', emailMd5: 'myEmailSum', position: 2, socketId: socket2.id};
        Iojs.scrumMaster.socketId = 'somethingElse';
        Iojs.users.push(user1);
        Iojs.users.push(user2);
        Iojs.bingo.selectedNumbers.push(1);
        Iojs.bingo.selectedNumbers.push(2);

        var result = Iojs.agilePoker.estimation(io, socket1, param);

        expect(result).equal(undefined);
        assert(io.emit.calledOnce);
        assert(io.emit.firstCall.calledWith('gotEstimation', {position: user1.position}));
    });
});

describe('When the last missing user is sending his estimation', function () {

    var socket, io;
    beforeEach(function () {
        socket = {emit:sinon.spy(), id: 'something2'};
        io = {emit:sinon.spy()};
    });

    it('should add/update score then get the user position and emit gotEstimation with the user position to all the room and emit allEstimation receive if a scrumMaster is connected', function () {
        var param = {myPosition:2, estimation: 10};
        var user2 = {userId: 'test2', emailMd5: 'myEmailSum', position: 2, socketId: socket.id};
        Iojs.scrumMaster.socketId = 'somethingElse';

        var result = Iojs.agilePoker.estimation(io, socket, param);

        expect(result).equal(undefined);
        assert(io.emit.calledTwice);
        assert(io.emit.firstCall.calledWith('gotEstimation', {position: user2.position}));
        assert(io.emit.secondCall.calledWith('allEstimations'));
    });
    it('should add/update score and get the user position and emit gotEstimation with the user position to all the room but not emit allEstimation if scrumMaster is not connected', function () {
        var param = {myPosition:2, estimation: 10};
        var user2 = {userId: 'test2', emailMd5: 'myEmailSum', position: 2, socketId: socket.id};
        Iojs.scrumMaster.socketId = undefined;

        var result = Iojs.agilePoker.estimation(io, socket, param);

        expect(result).equal(undefined);
        assert(io.emit.calledOnce);
        assert(io.emit.firstCall.calledWith('gotEstimation', {position: user2.position}));
    });

    after(function() {
        Iojs.bingo.selectedNumbers.length = 0;
        Iojs.users.length = 0;
        Iojs.scrumMaster.socketId = undefined;
        Iojs.estimation.resetScore();
    });
});

describe('When startEstimation is called', function () {
    var io;

    beforeEach(function() {
        io = {emit:sinon.spy()};
    });

    it('should not do anything if the scrumMaster is not connected', function () {
        Iojs.scrumMaster.socketId = undefined;

        var result = Iojs.agilePoker.startEstimation(io);

        expect(result).equal(undefined);
        assert(io.emit.notCalled);
    });
    it('should reset scores and emit newEstimation to everyone in the room if the scrumMaster is connected', function () {
        Iojs.scrumMaster.socketId = 'something';

        var result = Iojs.agilePoker.startEstimation(io);

        expect(result).equal(undefined);
        assert(io.emit.calledOnce);
        assert(io.emit.calledWith('newEstimation'));
    });
});

describe('when showScore is called', function () {
    var io;

    beforeEach(function() {
        io = {emit:sinon.spy()};
    });

    it('should send the last estimation score of all users to all the room only if the scrumMaster is connected', function () {
        Iojs.scrumMaster.socketId = 'something';

        var result = Iojs.agilePoker.showScore(io);

        expect(result).equal(undefined);
        assert(io.emit.calledOnce);
        assert(io.emit.calledWith('displayScores'));
    });
    it('should not do anything if the scrumMaster is not connected', function() {
        Iojs.scrumMaster.socketId = undefined;

        var result = Iojs.agilePoker.showScore(io);

        expect(result).equal(undefined);
        assert(io.emit.notCalled);
    });
});

describe('When a user is connecting loginCheck is called, and if no scrumMaster is connected', function () {
    var socket1, socket2, user1, user2;

    beforeEach(function () {
        socket1 = {emit:sinon.spy(), broadcast: {emit: sinon.spy()}, id: 1};
        user1 = {userId: 'test1', emailMd5: 'myMd5Sum'};
        socket2 = {emit:sinon.spy(), broadcast: {emit: sinon.spy()}, id: 2};
        user2 = {userId: 'test2', emailMd5: 'myMd5Sum'};
    });

    it('should register the new user and emit needed information to the room and to the user to introduce themselves', function () {
        var result = Iojs.agilePoker.loginCheck(socket1, user1);

        expect(result).equal(undefined);
        assert(socket1.emit.calledTwice);
        assert(socket1.emit.firstCall.calledWith('loginAvailability', {success: true}));

        var myPosition = Iojs.bingo.selectedNumbers[Iojs.bingo.selectedNumbers.length - 1];

        assert(socket1.emit.secondCall.calledWith('drawUsers', {
            playerPool: Iojs.playerPool,
            currentUsers: Iojs.bingo.selectedNumbers,
            usersDetails: Iojs.users,
            myPosition: myPosition
        }));
        assert(socket1.broadcast.emit.calledOnce);
        assert(socket1.broadcast.emit.calledWith('newUser', {playerPosition: Iojs.playerPool[myPosition - 1], userDetails: {userId: 'test1', emailMd5: 'myMd5Sum', position: myPosition, socketId: socket1.id}}));
    });

    it('should discard the existing user request', function () {
        var result = Iojs.agilePoker.loginCheck(socket1, user1);

        expect(result).equal(undefined);
        assert(socket1.emit.calledOnce);
        assert(socket1.emit.firstCall.calledWith('loginAvailability', {success: false, message: 'Already logged user!'}));
        assert(socket1.broadcast.emit.notCalled);
    });

    it('should discard user request if the total number of user is reached', function () {
        Iojs.playerPool.length = 1;

        var result = Iojs.agilePoker.loginCheck(socket2, user2);

        expect(result).equal(undefined);
        assert(socket2.emit.calledOnce);
        assert(socket2.emit.firstCall.calledWith('loginAvailability', {success: false, message: 'This server reach the maximal user number!'}));
        assert(socket2.broadcast.emit.notCalled);
    });

    after(function () {
        Iojs.bingo.selectedNumbers.length = 0;
        Iojs.users.length = 0;
        Iojs.scrumMaster.socketId = undefined;
        Iojs.estimation.resetScore();
    });
});

describe('When a user is connecting loginCheck is called, and if scrumMaster is connected', function () {
    var socket1, socket2, user1, user2;

    beforeEach(function () {
        socket1 = {emit:sinon.spy(), broadcast: {emit: sinon.spy()}, id: 2};
        user1 = {userId: 'test1', emailMd5: 'myMd5Sum'};
        Iojs.scrumMaster.socketId = 2;
    });

    it('should register the new user and emit needed information to the room and to the user to introduce themselves plus scrumMaster infos', function () {
        var result = Iojs.agilePoker.loginCheck(socket1, user1);

        expect(result).equal(undefined);
        assert(socket1.emit.calledThrice);
        assert(socket1.emit.firstCall.calledWith('loginAvailability', {success: true}));

        var myPosition = Iojs.bingo.selectedNumbers[Iojs.bingo.selectedNumbers.length - 1];

        assert(socket1.emit.secondCall.calledWith('drawUsers', {
            playerPool: Iojs.playerPool,
            currentUsers: Iojs.bingo.selectedNumbers,
            usersDetails: Iojs.users,
            myPosition: myPosition
        }));
        assert(socket1.emit.thirdCall.calledWith('newUser', {
            playerPosition: Iojs.scrumMaster,
            userDetails: {userId: 'scrumMaster', emailMd5: Iojs.scrumMaster.emailMd5, position: 0, socketId: Iojs.scrumMaster.socketId}
        }));
        assert(socket1.broadcast.emit.calledTwice);
        assert(socket1.broadcast.emit.firstCall.calledWith('disableShowScores'));
        assert(socket1.broadcast.emit.secondCall.calledWith('newUser', {playerPosition: Iojs.playerPool[myPosition - 1], userDetails: {userId: 'test1', emailMd5: 'myMd5Sum', position: myPosition, socketId: socket1.id}}));
    });

    after(function () {
        Iojs.bingo.selectedNumbers.length = 0;
        Iojs.users.length = 0;
        Iojs.scrumMaster.socketId = undefined;
        Iojs.estimation.resetScore();
    });
});

describe('When a user is disconnecting userDisconnection is called', function () {
    var io, socket1;

    before(function () {
        io = {emit:sinon.spy()};
        socket1 = {emit:sinon.spy(), broadcast: {emit: sinon.spy()}, id: 1};
        Iojs.scrumMaster.socketId = 1;
    });

    beforeEach(function () {
        Iojs.scrumMaster.socketId = 1;
        io.emit.reset();
        socket1.emit.reset();
        socket1.broadcast.emit.reset();
        socket1.id = 1;
    });

    it('should if it is the scrumMaster, send only scrumMaster disconnection event and cleanup scrumMaster setting on server side', function () {
        var result = Iojs.agilePoker.userDisconnection(io, socket1, 'some reason');

        expect(result).equal(undefined);
        assert(socket1.broadcast.emit.calledTwice);
        assert(socket1.broadcast.emit.firstCall.calledWith('removeUser', {position: 0}));
        assert(socket1.broadcast.emit.secondCall.calledWith('disableShowScores'));
        expect(Iojs.scrumMaster.socketId).equal(undefined);
    });
    it('should for scrumMaster disconnection emit allEstimation if score are sharable', function () {
        Iojs.estimation.scores.push({position: 1});

        Iojs.bingo.selectedNumbers.push(1);

        var result = Iojs.agilePoker.userDisconnection(io, socket1, 'some reason');

        expect(result).equal(undefined);
        assert(io.emit.calledOnce);
        assert(io.emit.calledWith('allEstimations'));

    });
    it('should not emit anything if someone call disconnection when no user nor scrumMaster are logged on', function () {
        Iojs.scrumMaster.socketId = undefined;

        var result = Iojs.agilePoker.userDisconnection(io, socket1, 'some info');

        expect(result).equal(undefined);
        assert(io.emit.notCalled);
        assert(socket1.emit.notCalled);
        assert(socket1.broadcast.emit.notCalled);

    });
    it('should not emit anything if the user calling the disconnection is not either the scrumMaster or an engineer', function () {
        Iojs.scrumMaster.socketId = 2;

        Iojs.estimation.scores.push({position: 1, estimation: 10});

        Iojs.bingo.selectedNumbers.push(1);

        Iojs.users.push({userId: 'test1', emailMd5: 'myMd5Sum', position: 1, socketId: 3});

        var result = Iojs.agilePoker.userDisconnection(io, socket1, 'some info');

        expect(result).equal(undefined);
        assert(io.emit.notCalled);
        assert(socket1.emit.notCalled);
        assert(socket1.broadcast.emit.notCalled);

    });
    it('should if it is a standard user just send the user disconnection event and cleanup user setting on server side, also if the scrumMaster is connected it should notify him that the score cannot be shared', function () {

        socket1.id = 2;
        Iojs.estimation.scores.push({position: 1, estimation: 10});
        Iojs.bingo.selectedNumbers.push(1);
        Iojs.users.push({userId: 'test1', emailMd5: 'myMd5Sum', position: 1, socketId: socket1.id});

        var result = Iojs.agilePoker.userDisconnection(io, socket1, 'some info');

        expect(Iojs.users.length).equal(0);
        expect(Iojs.bingo.selectedNumbers.length).equal(0);
        expect(Iojs.estimation.scores.length).equal(0);


        expect(result).equal(undefined);
        assert(socket1.broadcast.emit.calledWith('removeUser', {position: 1}));
        assert(socket1.broadcast.emit.calledWith('disableShowScores'));

    });
    it('should if it is a standard user just send the user disconnection event and cleanup user setting on server side, also if the scrumMaster is connected it should notify him that the score can be shared', function () {
        socket1.id = 2;
        var socket2 = {emit:sinon.spy(), broadcast: {emit: sinon.spy()}, id: 3};
        Iojs.estimation.scores.push({position: 1, estimation: 10});
        Iojs.estimation.scores.push({position: 2, estimation: 20});
        Iojs.bingo.selectedNumbers.push(1);
        Iojs.bingo.selectedNumbers.push(2);
        Iojs.users.push({userId: 'test1', emailMd5: 'myMd5Sum', position: 1, socketId: socket1.id});
        Iojs.users.push({userId: 'test2', emailMd5: 'myMd5Sum', position: 2, socketId: socket2.id});

        var result = Iojs.agilePoker.userDisconnection(io, socket1, 'some info');

        expect(Iojs.users.length).equal(1);
        expect(Iojs.bingo.selectedNumbers.length).equal(1);
        expect(Iojs.estimation.scores.length).equal(1);


        expect(result).equal(undefined);
        assert(socket1.broadcast.emit.calledWith('removeUser', {position: 1}));
        assert(io.emit.calledOnce);
        assert(io.emit.calledWith('allEstimations'));
    });

    afterEach(function () {
        Iojs.bingo.selectedNumbers.length = 0;
        Iojs.users.length = 0;
        Iojs.scrumMaster.socketId = undefined;
        Iojs.estimation.resetScore();
    });
});