var Iojs = require('../io');

describe('When no registered user', function () {
    before(function() {
    });

    it('should make isAllScoreReady returning false', function () {
        var result = Iojs.estimation.isAllScoreReady(Iojs.bingo.selectedNumbers);
        expect(result).equal(false);
    });
});

describe('When adding one new user score', function () {
    before(function() {
    });

    it('should make addUserScore returning 1', function () {
        var result = Iojs.estimation.addUserScore({myPosition:1, estimation: 10});
        expect(result).equal(1);
    });
});

describe('When updating one new user score', function () {
    before(function() {
    });

    it('should make addUserScore returning 1', function () {
        var result = Iojs.estimation.addUserScore({myPosition:1, estimation: 20});
        expect(result).equal(1);
    });
});

describe('When adding again one new user score', function () {
    before(function() {
    });

    it('should make addUserScore returning 1 but as already 1 user a least in the table we should match the non find user path in the find', function () {
        var result = Iojs.estimation.addUserScore({myPosition:2, estimation: 10});
        expect(result).equal(1);
    });
});

describe('When calling resetScore', function () {
    before(function() {
    });

    it('should never fail', function () {
        var result = Iojs.estimation.resetScore();
        expect(result).equal(undefined);
    });
});


describe('When adding one user score with just one registered user', function () {
    before(function() {
        Iojs.bingo.selectedNumbers.push(1);
        Iojs.estimation.addUserScore({myPosition:1, estimation: 10});
    });

    it('should make isAllScoreReady returning true', function () {
       var result = Iojs.estimation.isAllScoreReady(Iojs.bingo.selectedNumbers);
        expect(result).equal(true);
    });
});

describe('When adding two user score with just one registered user', function () {
    before(function() {
        Iojs.bingo.selectedNumbers.push(2);
    });

    it('should make isAllScoreReady returning false', function () {
        var result = Iojs.estimation.isAllScoreReady(Iojs.bingo.selectedNumbers);
        expect(result).equal(false);
    });
});

describe('When removing score of non existing user', function () {
    before(function() {
    });

    it('should return 0', function () {
        var result = Iojs.estimation.removeScore(3);
        expect(result).equal(0);
    });
});

describe('When removing score of existing user', function () {
    before(function() {
    });

    it('should return 1', function () {
        var result = Iojs.estimation.removeScore(1);
        expect(result).equal(1);
    });

    after(function() {
        Iojs.estimation.resetScore();
    });
});