pragma solidity 0.4.24;

import "@linniaprotocol/linnia-token-contracts/contracts/LINToken.sol";
import "@linniaprotocol/linnia-smart-contracts/contracts/LinniaHub.sol";

/**
 * @title Linnia Offer Contract
 */

contract LinniaOffers {

    uint private offerPrice = 1;

    /** Struct of an offer being made
    * @prop hasOffered Used to check whether the offer exists *
    * @prop isFullfilled Whether or not the seller has excepted *
    */
    struct Offer {
        bool hasOffered;
        bool isFulfilled;
    }

    event LinniaOfferMade(
        bytes32 indexed dataHash, address indexed buyer
    );

    LINToken public token;
    LinniaHub public hub;

    /* All offers being made */
    /* dataHash => buyer address => offer */
    mapping(bytes32 => mapping(address => Offer)) public offers;

    /* Modifiers */

    modifier onlyUser() {
        require(hub.usersContract().isUser(msg.sender) == true);
        _;
    }

    modifier hasBalance() {
        require(token.balanceOf(msg.sender) > offerPrice);
        _;
    }

    modifier hasNotOffered(bytes32 dataHash) {
        require(offers[dataHash][msg.sender].hasOffered != true);
        _;
    }

    /* Constructor */
    constructor(LINToken _token, LinniaHub _hub) public {
        token = _token;
        hub = _hub;
    }

    /* Fallback function */
    function () public { }

    /**
    * @param dataHash The record being made an offer for.
    * @dev Freezes balance being offered in contract, creates offer and emits event
    */
    function makeOffer(bytes32 dataHash)
        onlyUser
        hasBalance
        hasNotOffered(dataHash)
        public
        returns (bool)
    {
        /* @dev Puts offer balance in escrow */
        token.transferFrom(msg.sender, address(this), 1);

        /* @dev Creates new unfulfilled offer from buyer */
        offers[dataHash][msg.sender] = Offer({
            hasOffered: true,
            isFulfilled: false
        });

        /* @dev Emit event for caching purposes */
        emit LinniaOfferMade(dataHash, msg.sender);

        return true;
    }

}
