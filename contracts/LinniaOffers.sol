pragma solidity 0.4.24;

import "@linniaprotocol/linnia-token-contracts/contracts/LINToken.sol";
import "@linniaprotocol/linnia-smart-contracts/contracts/LinniaHub.sol";
import './LinniaStaking.sol';

/**
 * @title Linnia Offer Contract
 */

contract LinniaOffers {

    /** Struct of an offer being made
    * @prop hasOffered Used to check whether the offer exists *
    * @prop isFullfilled Whether or not the seller has excepted *
    * @prop amount the amount of LIN being offered *
    * @prop publicKey the public key to encrypt record data with if excepted *
    */
    struct Offer {
        bool hasOffered;
        bool isFulfilled;
        uint amount;
        bytes publicKey;
    }

    event LinniaOfferMade(
        bytes32 indexed dataHash, address indexed buyer, uint amount
    );

    LINToken public token;
    LinniaHub public hub;
    LinniaStaking public staking;

    /* All offers being made */
    /* dataHash => buyer address => offer */
    mapping(bytes32 => mapping(address => Offer)) public offers;

    /* Modifiers */

    modifier onlyUser() {
        require(hub.usersContract().isUser(msg.sender));
        _;
    }

    modifier hasBalance(uint amount) {
        require(token.balanceOf(msg.sender) >= amount);
        _;
    }

    modifier hasNotOffered(bytes32 dataHash) {
        require(!offers[dataHash][msg.sender].hasOffered);
        _;
    }

    modifier onlyStaked() {
        require(staking.isUserStaked(msg.sender));
        _;
    }

    /* Constructor */
    constructor(LINToken _token, LinniaHub _hub, LinniaStaking _staking) public {
        token = _token;
        hub = _hub;
        staking = _staking;
    }

    /* Fallback function */
    function () public { }

    /**
    * @param dataHash The record being made an offer for.
    * @dev Freezes balance being offered in contract, creates offer and emits event
    */
    function makeOffer(bytes32 dataHash, bytes publicKey, uint amount)
        onlyUser
        hasBalance(amount)
        hasNotOffered(dataHash)
        onlyStaked
        public
        returns (bool)
    {
        /* @dev Puts offer balance in escrow */
        token.transferFrom(msg.sender, address(this), amount);

        /* @dev Creates new unfulfilled offer from buyer */
        offers[dataHash][msg.sender] = Offer({
            hasOffered: true,
            isFulfilled: false,
            publicKey: publicKey,
            amount: amount
        });

        /* @dev Emit event for caching purposes */
        emit LinniaOfferMade(dataHash, msg.sender, amount);

        return true;
    }

}