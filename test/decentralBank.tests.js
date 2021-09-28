const Tether = artifacts.require('Tether');
const RWD = artifacts.require('RWD');
const DecentralBank = artifacts.require('DecentralBank');
const assert = require('assert');


require('chai')
.use(require('chai-as-promised'))
.should()


contract('DecentralBank', ([owner, customer]) => {

    let tether, rwd, decentralBank

    function tokens(number) {
        return web3.utils.toWei(number, 'ether')
    }

    before(async() => {
        tether = await Tether.new();
        rwd = await RWD.new();
        decentralBank = await DecentralBank.new(rwd.address, tether.address);

        // Transfer all tokens to DecentralBank (1 million)
        await rwd.transfer(decentralBank.address, tokens('1000000'))

        // Transfer 100 Tether to Customer

        await tether.transfer(customer, tokens('100'), {from: owner})
    })


    describe('Tether Deployment', async() => {
        it('Tether matches name successfully', async () => {
            const name = await tether.name()
            assert.equal(name, 'Tether')
        })  
    })
    describe('RWD Deployment', async() => {
        it('RWD matches name successfully', async () => {
            const name = await rwd.name()
            assert.equal(name, 'Reward Token')
        })
    })
    describe('Decentral Bank Deployment', async() => {
        it('matches name successfully', async()=> {
            const name = await decentralBank.name()
            console.log(name);
            assert.equal(name, 'Decentral Bank')
        })
        it('contract has tokens', async () => {
            let balance = await rwd.balanceOf(decentralBank.address)
            console.log(balance.toString());
            assert.equal(balance, tokens('1000000'))
        })
    describe('Yeld Farming', async() => {
        it('rewards tokens for staking', async() => {
            let result

            // Check Investor Balance
            result = await tether.balanceOf(customer)
            assert.equal(result.toString(), tokens('100'), 'customer tether wallet balance before staking')

            // Check Staking for Customer
            await tether.approve(decentralBank.address, tokens('100'), {from:customer})
            await decentralBank.depositTokens(tokens('100'), {from: customer})
            
            // check Updated Balance of Customer
            result = await tether.balanceOf(customer)
            assert.equal(result.toString(), tokens('0'), 'customer tether wallet balance after staking 100')
            
            // Check Updated Balance of Decentral Bank
            result = await tether.balanceOf(decentralBank.address)
            assert.equal(result.toString(), tokens('100'), 'decentral bank customer tether wallet balance')

            // Is Staking update
            result = await decentralBank.isStaking(customer)
            assert.equal(result.toString(), 'true', 'customer is staking status after staking')
            
            // Issue Tokens

            await decentralBank.issueTokens({from: owner})

            // Ensure only the owner can Issue Tokens
            await decentralBank.issueTokens({from: customer}).should.be.rejected;

            // Unstake Tokens
            await decentralBank.unstakeTokens({from: customer})
            
            // Check Unstaking Balances

            result = await tether.balanceOf(customer)
            assert.equal(result.toString(), tokens('100'), 'customer tether wallet balance after unstaking')
            
            // Check Updated Balance of Decentral Bank
            result = await tether.balanceOf(decentralBank.address)
            assert.equal(result.toString(), tokens('0'), 'decentral bank customer tether wallet balance')

            // Is Staking update
            result = await decentralBank.isStaking(customer)
            assert.equal(result.toString(), 'false', 'customer is no longer staking status after unstaking')

        });
            


    })
    })
})
