pragma solidity 0.4.24;
import "@linniaprotocol/linnia-token-contracts/contracts/LINToken.sol";
import "@linniaprotocol/linnia-smart-contracts/contracts/LinniaHub.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./LinniaDDEXHub.sol";

 /**
 * @title Linnia Staking Contract
 */


contract LinniaStaking is Ownable {
      /** Struct of Stake
    * @prop hasStaked - boolean to see if user has staked or not *
    * @prop amountStaked - the amount staked by the user *
    */
     /** Stake amount
    * @dev can be changed by owner*
    */
    uint public stakeAmount = 100;
       /** Struct of Stake
    * @prop hasStaked - boolean to see if user has staked or not *
    * @prop amountStaked - the amount staked by the user *
    */
    struct Stake {
        bool hasStaked;
        uint amountStaked;
    }
    
    event LinniaUserStaked(
        uint stakedAmount, address indexed staker
    );
     
    event LinniaUserWithdrawedStake(
        uint stakedAmount, address indexed staker
    );

    LINToken public token;
    LinniaHub public hub;
    LinniaDDEXHub public ddexhub;

      /* All stakes */
    /* user address => stake */
    mapping(address => Stake) public stakes;
      /* Modifiers */
    modifier onlyUser() {
        require(hub.usersContract().isUser(msg.sender) == true);
        _;
    }
    modifier hasBalance() {
        require(token.balanceOf(msg.sender) > stakeAmount);
        _;
    }
    modifier hasNotStaked() {
        require(!isUserStaked(msg.sender));
        _;
    }
    modifier hasStaked() {
        require(isUserStaked(msg.sender));
        _;
    }

      /* Constructor */
    constructor(LINToken _token, LinniaHub _hub, LinniaDDEXHub _ddexhub) public {
        token = _token;
        hub = _hub;
        ddexhub = _ddexhub;
    }

     /* Fallback function */
    function () public { }
      /**
    * @dev stakes balance in this contract, creates stake and emits stake event
    */

    function makeStake()
        external
        onlyUser
        hasBalance
        hasNotStaked
        returns (bool)
    {
        /* @dev Puts stake amount in escrow */
        token.transferFrom(msg.sender, address(this), stakeAmount);
         /* @dev Creates new stake of user */
        stakes[msg.sender] = Stake({
            hasStaked: true,
            amountStaked: stakeAmount
        });
         /* @dev Emit event for stake  */
        emit LinniaUserStaked(stakeAmount, msg.sender);
        return true;
    }

    function withdrawStake()
        external
        hasStaked
        onlyUser
        returns(bool)
        {   
        uint userStakeAmount = stakes[msg.sender].amountStaked;
        /* @dev Updates stake of user back to zero */
        stakes[msg.sender] = Stake({
            hasStaked: false,
            amountStaked: 0
        });
        /* @dev Sends stake back to user */
        require(token.transfer(msg.sender, userStakeAmount));
        /* @dev Emit event for withdrawed stake  */
        emit LinniaUserWithdrawedStake(userStakeAmount, msg.sender);
        return true;
    }

       /** Change stake price
    * @param newAmount to change stake price to, only if owner
    */ 

    function updateStake(uint newAmount)
        external
        onlyOwner
        returns(bool)
        {
        /* @dev Creates new stake amount */
        stakeAmount = newAmount;
        return true;
    }

       /** Check if user is staked
    * @param staker - address of whom to be checked*
    */

    function isUserStaked(address staker)
        public
        view
        returns(bool)
        {
        return stakes[staker].hasStaked;
    }
}
