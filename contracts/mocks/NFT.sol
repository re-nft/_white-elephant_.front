// SPDX-License-Identifier: MIT

pragma solidity >=0.6.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "@openzeppelin/contracts/utils/Counters.sol";

contract Nft is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private __tokenIds;
    // todo: this first one (on rarible) has a function called uri(_id uint256); .... to pull the metadata
    // this is Rarible's implementation lol
    // hmm, ipfs:// one has the uri signature too, perhaps that was the spec before? ... :scratches-head:
    // and the one before the last one has the proper function name: tokenURI....
    string[] private _meta = [
        "https://ipfs.daonomic.com/ipfs/QmQsyo1Rg4JwSU2f7rM83ojtDQPz6N4Pw8NWKgNjfjwtjx",
        "https://ipfs.daonomic.com/ipfs/QmcZ7VL8y67fay3uXvyGGMUt5MJkn18QKGeQ88jPhUjy8Q",
        "https://ipfs.daonomic.com/ipfs/QmebsDBy89QtFha6eC7cQ4HsyFmyLutVGrQC42QtfUeza5",
        "https://ipfs.daonomic.com/ipfs/Qmd1ZFuQwuz2DmJjKCzTfBJzk64mbcydb8YMiUfKnfMiD9",
        "https://ipfs.daonomic.com/ipfs/QmQzVkpRQa8SKPeQVba9YVBmHYXXeAZvLKqkD2n2wSsJE2",
        "https://ipfs.daonomic.com/ipfs/QmTgaTSMzSTBYtTkR1ssZvPSZ6i7XJtCGG9tdKVddou9d5",
        "ipfs://ipfs/QmULTHFrb1zHuMqg3pfsUJd2SozAGTzaE1uwAbiy4uJAo3",
        "https://ipfs.daonomic.com/ipfs/QmfZkSN2FdpXsfeUZyAhHP7Ux6AQHgEtJGz8Y9RgFwXeJb",
        "https://ipfs.daonomic.com/ipfs/QmUAUMeASGdjkUZDYm3GzkaA89MjeEZLfbRv97p8eqjqvP",
        "https://ipfs.daonomic.com/ipfs/QmapLALpFj7ydPjF3HG3mwtXsPoALfkLEK2MoHwBv86QdA",
        "https://ipfs.daonomic.com/ipfs/QmapLALpFj7ydPjF3HG3mwtXsPoALfkLEK2MoHwBv86QdA"
    ];

    constructor() public ERC721("NFT", "NFT") {}

    function awardNft(address to) public returns (uint256) {
        __tokenIds.increment();

        uint256 newItemId = __tokenIds.current();
        _mint(to, newItemId);
        _setTokenURI(newItemId, _meta[newItemId - 1]);

        return newItemId;
    }

    function batchAwardNft(address to, uint256 numTimes)
        public
        returns (uint256)
    {
        for (uint256 i = 0; i < numTimes; i++) {
            awardNft(to);
        }
    }
}
