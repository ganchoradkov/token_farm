const { assert } = require('chai');

const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");
const TokenFarm = artifacts.require("TokenFarm");

require('chai').use(require("chai-as-promised")).should()
require('web3')

function tokens(n) {
    return web3.utils.toWei(n, 'Ether');
}

contract('TokenFarm', ([owner, investor]) => {
    let daiToken, dappToken, tokenFarm

    before(async () => {
        // load contracts
        daiToken = await DaiToken.new()
        dappToken = await DappToken.new()
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

        //transfer all dapp tokens to the token farm
        await dappToken.transfer(tokenFarm.address, tokens('100000'))
        await daiToken.transfer(investor, tokens('100'), { from: owner })
    });

    describe('Mock DAI Deployment', async () => {
        it('has a name', async () => {
            const name = await daiToken.name();
            assert.equal( name, 'Mock DAI Token');
        })
    })

    describe('Dapp Deployment', async () => {
        it('has a name', async () => {
            const name = await dappToken.name();
            assert.equal( name, 'DApp Token');
        })
    })

    describe('Token Farm Deployment', async () => {
        it('has a name', async () => {
            const name = await tokenFarm.name();
            assert.equal( name, 'DAPP Token Farm');
        })
    })

    it('contract has tokens', async() => {
        let balance = await dappToken.balanceOf(tokenFarm.address)
        assert.equal(balance.toString(), tokens('100000'))
    })

    describe('Farming tokens', async () => {

        it('rewards investors for staking mDai tokens', async () => {
          let result
    
          // Check investor balance before staking
          result = await daiToken.balanceOf(investor)
          assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct before staking')
    
          // Stake Mock DAI Tokens
          await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor })
          await tokenFarm.stakeTokens(tokens('100'), tokenFarm.address, { from: investor })
    
          // check staking result
          result = await daiToken.balanceOf(investor)
          assert.equal(result.toString(), tokens('0'), 'investor DAI wallet correct after staking')
        
          // check staking result
          result = await daiToken.balanceOf(tokenFarm.address)
          assert.equal(result.toString(), tokens('100'), 'Token Farm DAI wallet correct after staking')
          
          // check staking balance
          result = await tokenFarm.stakingBalance(investor)
          assert.equal(result.toString(), tokens('100'), 'investor staking balance correct after staking')

          // check staking status
          result = await tokenFarm.isStaking(investor)
          assert.equal(result.toString(), 'true', 'investor staking status correct after staking')

          result = await tokenFarm.hasStaked(investor)
          assert.equal(result.toString(), 'true', 'investor hasStaked status correct after staking')

          // issue the tokens
          await tokenFarm.issueTokens({ from: owner })
           
          result = await dappToken.balanceOf(investor)
          assert.equal(result.toString(), tokens('100'), 'Investor balance correct after issueing dapp tokens')
          
          // try issueing tokens without being owner
          await tokenFarm.issueTokens({ from: investor }).should.be.rejected
          // unstake investors balance
          await tokenFarm.unstakeTokens({ from: investor })

          // dai balance after unstaking
           result = await daiToken.balanceOf(investor)
           assert.equal(result.toString(), tokens('100'), 'investor DAI wallet correct after unstaking')
         
           result = await daiToken.balanceOf(tokenFarm.address)
           assert.equal(result.toString(), tokens('0'), 'TokenFarm DAI wallet correct after unstaking')
         
           result = await tokenFarm.stakingBalance(investor)
           assert.equal(result.toString(), tokens('0'), 'investor DAI staking balance correct after unstaking')
            
           result = await tokenFarm.isStaking(investor)
           assert.equal(result.toString(), 'false', 'investor isStaking status correct after unstaking')
         

        })



    })

})