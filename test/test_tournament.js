let Tournament = artifacts.require('../contracts/Tournament');


contract('Tournament', accounts => {
    let contract;
    let id = 001;
    let buyIn = 1000;


    beforeEach(async () => {
        contract = await Tournament.new(
            id,
            buyIn,
        );
        participant = accounts[0];
    });

    describe('TEST CONSTRUCTOR', () => {

        it('contract is correctly initialized with the constructor', async () => {
            let expectedBuyIn = await contract.buyIn.call();
            let expectedId = await contract.id.call();

            expect(expectedBuyIn.toNumber()).to.equal(buyIn);
            expect(expectedId.toNumber()).to.equal(id);
        });

    });

    describe('TEST PARTICIPATE PUBLIC METHOD', () => {
        let sufficientBuyIn = buyIn;
        let unsufficientBuyIn = sufficientBuyIn - 1;

        it('user has sufficient buyIn amount', async () => {
            await contract.participate({
                value: buyIn,
                from: participant
            });

            let isParticipantSaved = await contract.participants.call(participant);
            expect(isParticipantSaved).to.equal(true);
        });

        it('user has unsufficient buyIn amount', async () => {
            try {
                await contract.participate({
                    value: unsufficientBuyIn,
                    from: participant
                });
            } catch (error) {
                assert(error.data.stack.includes('You need to send exact amount'))
            }
        });

    });
});