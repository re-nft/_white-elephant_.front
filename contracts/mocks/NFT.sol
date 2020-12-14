// SPDX-License-Identifier: MIT
pragma solidity ^0.7.5;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Nft is ERC721, ReentrancyGuard {
  using Counters for Counters.Counter;
  Counters.Counter private __tokenIds;

  event NewNFT(
    address indexed owner,
    uint256 indexed tokenId
  );

  constructor() ERC721("NFT", "NFT") {}

  function awardNft()
    public
    nonReentrant
    returns (uint256)
  {
    __tokenIds.increment();

    uint256 newItemId = __tokenIds.current();
    _mint(msg.sender, newItemId);
    // _setTokenURI(newItemId, _tokenURI);

    emit NewNFT(msg.sender, newItemId);

    return newItemId;
  }
}