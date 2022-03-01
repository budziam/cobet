var chai = require("chai");

const BN = web3.utils.BN;
const chaiBN = require('chai-bn')(BN);
chai.use(chaiBN);

var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const expect = chai.expect;

let Tournament = artifacts.require('../contracts/Tournament');


contract('Tournament', accounts => {
    // arrange for all tests
    const dealer = accounts[0];
    const participant = accounts[1];
    const buyIn = 1000;

    let contract;
    let contractParticipateValidPromise;

    beforeEach(async () => {
        contract = await Tournament.new(
            buyIn,
        );
        contractParticipateValidPromise = contract.participate({
            value: buyIn,
            from: participant                    
        });
    });

    describe('Test Constructor', () => {

        it('contract is correctly initialized with the constructor', async () => {
            // arrange
            const testContract = await Tournament.new(buyIn);
            
            // act 
            const expectedBuyIn = await testContract.buyIn.call();
            
            // assert 
            expect(expectedBuyIn.toNumber()).to.equal(buyIn);
        });


        it('contract isnt initialized because of wrong arguments should throw error', async () => {
            // arrange
            const ERROR_MSG = "invalid BigNumber";
            const payload = "wrong payload";

            // assert
            await expect(Tournament.new(payload)).to.be.rejectedWith(ERROR_MSG);
        });

    });

    describe('Test Participate Public Method', () => {

        describe('user has sufficient buyIn amount', () => {
            it('should return true', async () => {
                // arrange
                await contractParticipateValidPromise;
    
                // act
                let isParticipantSaved = await contract.participants.call(participant);
                
                // assert
                expect(isParticipantSaved).to.equal(true);
            });
    
            it('should throw error', async () => {
                // arrange
                const expectedErrorMessage = "Reason given: You need to send exact amount";
            
                // act
                const participate = contract.participate({
                    value: buyIn - 1,
                    from: participant
                });
    
                // assert
                await expect(participate).to.be.rejectedWith(expectedErrorMessage);
            });
        });

        it('user tries to participate second time should throw error', async () => {
            // arrange
            const expectedErrorMessage = "Reason given: Can't participate multiple times in the same tournament";
            await contractParticipateValidPromise;

            // act
            const participate = contract.participate({
                value: buyIn,
                from: participant                    
            });

            // assert
            await expect(participate).to.be.rejectedWith(expectedErrorMessage);
        });
    });

    describe('Test Eval Public Payable Method', async () => {

        before(async () => {
            await contractParticipateValidPromise;
        });

        // arrange
        let evalErrorTests = [
            {
                name: 'participant evaluating a tournament should throw error',
                args: {ranking: [participant], invoker: participant},
                errorMessage: 'Reason given: You have to be dealer to evaluate a tournament.'
            },
            {
                name: 'payload with wrong participants should throw error',
                args: {ranking: [dealer], invoker: dealer},
                errorMessage: 'Reason given: Address has to be one of the participants.'
            },
            {
                name: 'no items in ranking should throw error',
                args: {ranking: [], invoker: dealer},
                errorMessage: "Reason given: Ranking of the user's can't be empty"
            },
        ];

        evalErrorTests.forEach( async (test) => {
            it(test.name, async () => {
                // act
                const evaluateTournament = contract.eval(
                    test.args.ranking,
                    { from: test.args.invoker}
                );

                // assert
                await expect(evaluateTournament).to.be.rejectedWith(test.errorMessage);
            });

        });

        it('evaluate successfully transferred tokens to winner', async() => {
            // arrange
            const expectedShare = BigInt(1900);
            await contract.participate({
                value: buyIn,
                from: dealer                    
            });

            // act 
            const winnerBalanceBefore = await web3.eth.getBalance(participant);
            await contract.eval([participant, dealer], {from: dealer});
            const winnerBalanceAfter = await web3.eth.getBalance(participant);

            // assert
            const winnerShare = BigInt(winnerBalanceAfter) - BigInt(winnerBalanceBefore);
            expect(winnerShare).to.be.equal(expectedShare);
        });
    });
});