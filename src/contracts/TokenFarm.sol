pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm {
    
    string public name = "DAPP Token Farm";
    DappToken public dappToken;
    DaiToken public daiToken;
    address owner;

    address[] public stakers;
    mapping(address => uint ) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    constructor(DappToken _dappToken, DaiToken _daiToken) public {

        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;

    }

    // 1. stake tokens (deposit)
    function stakeTokens(uint _amaunt, address _tokenFarmAddress) public {

        require(_amaunt > 0, 'amaunt cannot be 0');

        //transfer dai tokens to this contract for staking
        daiToken.transferFrom(msg.sender, _tokenFarmAddress, _amaunt);

        // update stackingBalance
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amaunt;

        // add user to stakers array if they havent staked already
        if(!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        // staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
        
    }

    // issue tokens
    function issueTokens() public { 

        require(msg.sender == owner, 'Only owner can call this function');

        // issue tokens to all stakers
        for(uint i=0; i < stakers.length; i++) { 
            address recepient = stakers[i];
            uint balance = stakingBalance[recepient];
            if(balance > 0) { 
                dappToken.transfer(recepient, balance);
            }
        }

    }

    // unstaking tokens (withdraw)
    function unstakeTokens() public {
        
        uint balance = stakingBalance[msg.sender];
        require(balance > 0, 'Staking balance cannot be 0');

        daiToken.transfer(msg.sender, balance);
        // reset staking balance
        stakingBalance[msg.sender] = 0;
        // reset staking status
        isStaking[msg.sender] = false;

    }
}