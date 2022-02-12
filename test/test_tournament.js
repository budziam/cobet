let Tournament = artifacts.require('../contracts/Tournament');


contract('Tournament', accounts => {
    let contract;
    let buyIn = 1000;
    let insufficientBuyIn = buyIn - 1;

    beforeEach(async () => {
        contract = await Tournament.new(
            buyIn,
        );
        participant = accounts[0];
    });

    describe('TEST CONSTRUCTOR', () => {

        it('contract is correctly initialized with the constructor', async () => {
            // act
            let expectedBuyIn = await contract.buyIn.call();
            
            // assert
            expect(expectedBuyIn.toNumber()).to.equal(buyIn);
        });

    });

    describe('TEST PARTICIPATE PUBLIC METHOD', () => {
        it('user has sufficient buyIn amount', async () => {
            // arrange 
            await contract.participate({
                value: buyIn,
                from: participant
            });

            // act
            let isParticipantSaved = await contract.participants.call(participant);
            
            // assert
            expect(isParticipantSaved).to.equal(true);
        });

        it('user has insufficient buyIn amount', async () => {
            // arrange 
            let error;
            let ERROR_MSG = "Reason given: You need to send exact amount";
            let participate = contract.participate({
                value: insufficientBuyIn,
                from: participant
            });

            // act
            try {
                await participate;
            } catch (_error) {
                error = _error;
            }

            // assert 
            expect(error.message).to.have.string(ERROR_MSG);
        });

    });
});