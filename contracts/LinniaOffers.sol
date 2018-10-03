pragma solidity 0.4.24;

import "./LinniaDDEXHub.sol";

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

    LinniaDDEXHub public ddexhub;

    /* All offers being made */
    /* dataHash => buyer address => offer */
    mapping(bytes32 => mapping(address => Offer)) public offers;

    /* Modifiers */

    modifier onlyUser() {
        require(ddexhub.hubContract().usersContract().isUser(msg.sender));
        _;
    }

    modifier hasBalance(uint amount) {
        require(ddexhub.tokenContract().balanceOf(msg.sender) >= amount);
        _;
    }

    modifier hasNotOffered(bytes32 dataHash) {
        require(!offers[dataHash][msg.sender].hasOffered);
        _;
    }

    modifier onlyStaked() {
        require(ddexhub.stakingContract().isUserStaked(msg.sender));
        _;
    }

    /* Constructor */
    constructor(LinniaDDEXHub _ddexhub) public {
        ddexhub = _ddexhub;
    }

    /* Fallback function */
    function () public { }

    /**
    * @param dataHash The record being made an offer for.
    * @dev Freezes balance being offered in contract, creates offer and emits event
    */
    function makeOffer(bytes32 dataHash, bytes publicKey, uint amount)
        public
        onlyUser
        hasBalance(amount)
        hasNotOffered(dataHash)
        onlyStaked
        returns (bool)
    {
        /* @dev Puts offer balance in escrow */
        ddexhub.tokenContract().transferFrom(msg.sender, address(this), amount);

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

        /**
    * @param dataHash The record being made an offer for.
    * @param buyer The address of the offerer
    * @dev Fulfills an offer and gives the seller the escrowed LIN if the permission has been created
    */
    function approveOffer(bytes32 dataHash, address buyer)
        public
        onlyStaked
        returns (bool)
    {
        /* @dev only record owner can approve */
        require(ddexhub.hubContract().recordsContract().recordOwnerOf(dataHash) == msg.sender);

        /* @dev pulls the offer from the contract state */
        Offer memory offer = offers[dataHash][buyer];

        /* @dev only approve made offers */
        require(offer.hasOffered);

        // /* @dev only approve unfulfilled offers */
        require(!offer.isFulfilled);

        // /* @dev make sure the permission has been created */
        require(ddexhub.hubContract().permissionsContract().checkAccess(dataHash, buyer));

        // /* @dev gives the escrowed balance to the seller/approver */
        require(ddexhub.tokenContract().transfer(msg.sender, offer.amount));

        offers[dataHash][msg.sender].isFulfilled = true;

        return true;
    }

}
