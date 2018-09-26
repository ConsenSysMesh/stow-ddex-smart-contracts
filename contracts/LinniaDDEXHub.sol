pragma solidity 0.4.24;


import "openzeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./LinniaOffers.sol";
import "./LinniaStaking.sol";

/**
 * @title Linnia DDEX Hub Contract
 */


contract LinniaDDEXHub is Ownable, Destructible {
    
    LinniaOffers public offersContract;
    LinniaStaking public stakingContract;

    event LinniaOffersContractSet(address from, address to);
    event LinniaStakingContractSet(address from, address to);

    constructor() public { }

    function () public { }

    function setOfferContract(LinniaOffers _offersContract)
        external
        onlyOwner
        returns (bool)
    {
        address prev = address(offersContract);
        offersContract = _offersContract;
        emit LinniaOffersContractSet(prev, _offersContract);
        return true;
    }

    function setStakingContract(LinniaStaking _stakingContract)
        external
        onlyOwner
        returns (bool)
    {
        address prev = address(stakingContract);
        stakingContract = _stakingContract;
        emit LinniaStakingContractSet(prev, _stakingContract);
        return true;
    }

}
