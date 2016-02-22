var Iojs = require('../io');

describe('When I call generateNextRandom 3 times successively', function () {
    var currentPool;
    before(function() {
        currentPool = Iojs.playerPool;
        Iojs.playerPool.length = 2;
    });

    it('should return greater than 0 the first time', function () {
        var result = Iojs.bingo.generateNextRandom();
        expect(result).to.be.above(0);
    });

    it('should return greater than 0 the second time', function () {
        var result = Iojs.bingo.generateNextRandom();
        expect(result).to.be.above(0);
    });

    it('should return 0 the third time', function () {
        var result = Iojs.bingo.generateNextRandom();
        expect(result).equal(0);
    });

    after(function() {
        Iojs.playerPool = currentPool;
        Iojs.bingo.selectedNumbers = [];
    });
});

describe('When generateRandom return an already generated number', function () {
    var currentGenerateRandom = Iojs.bingo.generateNextRandom;

    var counter = 1;

    before(function () {
        //Let's mock generateRandom temporarily so that it will return predictive number
        Iojs.bingo.generateRandom = function () {
            if (Iojs.bingo.selectedNumbers == 0) {
                return counter;
            } else {
                return counter++;
            }
        }
    });

    it('should loop until another number is found', function () {
        var result = Iojs.bingo.generateNextRandom();
        result = Iojs.bingo.generateNextRandom();
        expect(result).equal(2);
    });

    after(function() {
        Iojs.bingo.generateRandom = currentGenerateRandom;
        Iojs.bingo.selectedNumbers = [];
    });
});