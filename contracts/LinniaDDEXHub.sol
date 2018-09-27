pragma solidity 0.4.24;

import "@linniaprotocol/linnia-token-contracts/contracts/LINToken.sol";
import "@linniaprotocol/linnia-smart-contracts/contracts/LinniaHub.sol";
import "openzeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./LinniaOffers.sol";
import "./LinniaStaking.sol";

/**
 * @title Linnia DDEX Hub Contract
 */


contract LinniaDDEXHub is Ownable, Destructible {

    LINToken public tokenContract;
    LinniaHub public hubContract;
    LinniaOffers public offersContract;
    LinniaStaking public stakingContract;

    event LinniaOffersContractSet(address from, address to);
    event LinniaStakingContractSet(address from, address to);
    event LinniaHubContractSet(address from, address to);
    event LinniaTokenContractSet(address from, address to);

    constructor(LinniaHub _hubContract, LINToken _tokenContract) public {
        setHubContract(_hubContract);
        setTokenContract(_tokenContract);
    }

    function () public { }

    function setOffersContract(LinniaOffers _offersContract)
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

    function setHubContract(LinniaHub _hubContract)
        public
        onlyOwner
        returns (bool)
    {
        address prev = address(hubContract);
        hubContract = _hubContract;
        emit LinniaHubContractSet(prev, _hubContract);
        return true;
    }

    function setTokenContract(LINToken _tokenContract)
        public
        onlyOwner
        returns (bool)
    {
        address prev = address(tokenContract);
        tokenContract = _tokenContract;
        emit LinniaTokenContractSet(prev, _tokenContract);
        return true;
    }


}
