// SPDX-License-Identifier: MIT
pragma solidity ^0.7.5;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract WhiteElephant is Ownable {
    struct Info {
        address nft;
        uint256 tokenId;
        uint16 orderNum;
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
    // 0 signifies no ticket number. i.e. you have not bought the ticket
    uint16 public orderNum = 1;

    // todo: decide on the max total number of players
    address[] public playas;

    uint16 public currentUnwrapper;

    Nft[] public nfts;

    // * for chainlink integration
    uint256[] private unavailableNfts;

    uint256 public currNftToUnwrap;

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
        require(msg.value >= 0.1 ether, "ticket price is 0.001");
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
        nfts.push(Nft(_nft, _tokenId));
    }

    function stealNft(uint256 _stealFrom, address _theirAddress)
        public
        yourOrder(msg.sender)
        onChristmas
    {
        // 1. user must not have the nft
        // 2. can only steal from the people before them
        // 3. ensure it is their order
        Info storage player = info[msg.sender];

        require(player.orderNum > _stealFrom, "cant steal from them");
        require(
            info[_theirAddress].wasStolenFrom == false,
            "cant steal from them again"
        );

        player.nft = info[_theirAddress].nft;
        player.tokenId = info[_theirAddress].tokenId;

        info[_theirAddress].wasStolenFrom = true;
        info[_theirAddress].nft = address(0);
        info[_theirAddress].tokenId = 0;
    }

    // on Christmas Eve, this gets unlocked
    function unwrap() public yourOrder(msg.sender) onChristmas {
        Info storage player = info[msg.sender];
        // todo: require christmas
        // ensure the order is respected

        // todo: integrate chainlink. right now linear unwrapping
        player.nft = address(nfts[currNftToUnwrap].nft);
        player.tokenId = nfts[currNftToUnwrap].tokenId;
        currNftToUnwrap++;
        // ----

        // increment the unwrapper
        currentUnwrapper++;
    }

    // * potential issue if this is called at the same time as unwrap by someone else
    // and both get the same NFT... For cases like that, ensure we have the ability
    // to send NFTs ourselves too
    function unwrapAfterStolen() public onChristmas {
        Info storage player = info[msg.sender];
        require(player.exists, "you cant play");

        // ensure that the user was stolen from
        require(player.hasTicket == true, "you must have a ticket");
        require(player.wasStolenFrom == true, "you must have been stolen from");
        require(
            address(player.nft) == address(0),
            "you have already unwrapped after steal"
        );
        require(player.tokenId == 0, "weird error");

        // todo: integrate chainlink for random unwrapping
        player.nft = address(nfts[currNftToUnwrap].nft);
        player.tokenId = nfts[currNftToUnwrap].tokenId;
        currNftToUnwrap++;
        // ------
    }

    function myOrderNum() public view returns (uint16) {
        Info storage player = info[msg.sender];
        if (player.exists == false) {
            return 0;
        } else {
            return player.orderNum;
        }
    }

    function endEvent() public onlyOwner onChristmas {
        // todo: require christmas
        for (uint256 i = 0; i < playas.length; i++) {
            Info storage player = info[playas[i]];
            ERC721(player.nft).transferFrom(
                address(this),
                playas[i],
                player.tokenId
            );
        }
    }
}
