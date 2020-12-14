// SPDX-License-Identifier: MIT
pragma solidity ^0.7.5;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/access/Ownable.sol";

// 1. buy a ticket - mapping(address => boolean);
// 2. redeem a ticket - (i) unwrap or (ii) steal
// 3. user address to nft address
contract WhiteElephant is Ownable {
    struct Info {
        ERC721 nft;
        uint256 tokenId;
        uint8 orderNum;
        bool hasTicket;
        bool wasStolenFrom;
        bool exists;
    }

    struct Nft {
        ERC721 nft;
        uint256 tokenId;
    }

    mapping(address => Info) private info;

    // todo: this will be chainlink
    uint8 orderNum public;

    // todo: decide on the max total number of players
    address[24] playas public;

    uint8 currentUnwrapper public;

    Nft[] nfts public;

    uint256[] unavailableNfts private;

    uint256 currNftToUnwrap public;

    modifier yourOrder(address _sender) {
        require(info[_sender].orderNum == currentUnwrapper, "not your order");
        _;
    }

    modifier onChristmas() {
        // todo: uncomment
        // require(block.timestamp >= 1232321, "wait for Christmas");
        _;
    }

    function buyTicket() public payable {
        require(msg.value >= 0.001 ether, "ticket price is 0.01");
        require(
            info[msg.sender].exists == false,
            "only one ticket per address"
        );

        info[msg.sender].hasTicket = true;
        info[msg.sender].exists = true;
        // give them a chainlink VRF here for the order in which they will go

        // todo: refactor for chainlink
        info[msg.sender].orderNum = orderNum;
        orderNum++;

        playas.push(msg.sender);
    }

    function depositNft(ERC721 _nft, uint256 _tokenId) public {
        // will fail if not approved
        _nft.transferFrom(msg.sender, address(this), _tokenId);
        // todo: idea about deposits in the future. fees
        nfts.push(_nft, _tokenId);
    }

    function stealNft(uint256 _stealFrom, address _theirAddress) public yourOrder(msg.sender) onChristmas {
        // 1. user must not have the nft
        // 2. can only steal from the people before them
        // 3. ensure it is their order
        Info player = info[msg.sender];

        require(player.orderNum > _stealFrom, "cant steal from them");
        require(info[_theirAddress].wasStolenFrom == false, "cant steal from them again");

        player.nft = info[_theirAddress].nft;
        player.tokenId = info[_theirAddress].tokenId;

        info[_theirAddress].wasStolenFrom = true;
        info[_theirAddress].nft = address(0);
        info[_theirAddress].tokenId = 0;
    }

    // on Christmas Eve, this gets unlocked
    function unwrap() public yourOrder(msg.sender) onChristmas {
        Info player = info[msg.sender];
        // todo: require christmas
        // ensure the order is respected

        // todo: integrate chainlink. right now linear unwrapping
        player.nft = nfts[currentNftToUnwrap].nft;
        player.tokenId = nfts[currentNftToUnwrap].tokenId;
        currentNftToUnwrap++;
        // ----

        // increment the unwrapper
        currentUnwrapper++;
    }

    function unwrapAfterStolen() public onChristmas {
        Info player = info[msg.sender];
        require(player.exists, "you cant play");

        // ensure that the user was stolen from
        require(player.hasTicket == true, "you must have a ticket");
        require(player.wasStolenFrom == true, "you must have been stolen from");
        require(player.nft == address(0), "you have already unwrapped after steal");

        // todo: integrate chainlink for random unwrapping
        player.nft = nfts[currentNftToUnwrap].nft;
        player.tokenId = nfts[currentNftToUnwrap].tokenId;
        currentNftToUnwrap++;
        // ------
    }

    function endEvent() public onlyOwner onChristmas {
        // todo: require christmas
        for (uint i=0; i < 24; i++) {
            Info player = info[playas[i]];
            player.nft.transferFrom(address(this), playas[i], player.tokenId);
        }
    }
}
