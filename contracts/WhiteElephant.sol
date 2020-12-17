// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

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
    uint16 public currNftToUnwrap = 1;
    uint256 public ticketPrice = 0.1 ether;

    address[] public players;
    Nft[] public allNfts;

    modifier yourOrder(address _sender) {
        require(info[_sender].orderNum == currNftToUnwrap, "not your order");
        _;
    }

    modifier onChristmas() {
        // todo: find the Christmas block number;
        require(block.number >= 1, "wait for Christmas");
        _;
    }

    function buyTicket() public payable {
        require(msg.value >= ticketPrice, "you are sending incorrect amount");
        require(
            info[msg.sender].exists == false,
            "only one ticket per address"
        );

        info[msg.sender].hasTicket = true;
        info[msg.sender].exists = true;
        info[msg.sender].orderNum = orderNum;

        orderNum++;

        players.push(msg.sender);
    }

    function depositNft(ERC721 _nft, uint256 _tokenId) public {
        _nft.transferFrom(msg.sender, address(this), _tokenId);
        allNfts.push(Nft(_nft, _tokenId));
    }

    function stealNft(uint256 _stealFrom, address _theirAddress)
        public
        yourOrder(msg.sender)
        onChristmas
    {
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

    function unwrap() public yourOrder(msg.sender) onChristmas {
        Info storage player = info[msg.sender];

        player.nft = address(allNfts[currNftToUnwrap].nft);
        player.tokenId = allNfts[currNftToUnwrap].tokenId;

        currNftToUnwrap++;
    }

    // info related --=

    function myOrderNum() public view returns (uint16) {
        Info storage player = info[msg.sender];
        if (player.exists == false) {
            return 0;
        } else {
            return player.orderNum;
        }
    }

    function myStolenFrom() public view returns (bool) {
        Info storage player = info[msg.sender];
        if (player.exists == false) {
            return false;
        } else {
            return player.wasStolenFrom;
        }
    }

    function myNftAddress() public view returns (address) {
        Info storage player = info[msg.sender];
        if (player.exists == false) {
            return address(0);
        } else {
            return player.nft;
        }
    }

    function myTokenId() public view returns (uint256) {
        Info storage player = info[msg.sender];
        if (player.exists == false) {
            return 0;
        } else {
            return player.tokenId;
        }
    }

    function myTicket() public view returns (bool) {
        Info storage player = info[msg.sender];
        if (player.exists == false) {
            return false;
        } else {
            return player.hasTicket;
        }
    }

    // ---

    function numberOfPlayers() public view returns (uint256) {
        return players.length;
    }

    function getPlayerNumber(uint256 _number) public view returns (address) {
        return players[_number];
    }

    function endEvent() public onChristmas {
        for (uint256 i = 0; i < players.length; i++) {
            Info storage player = info[players[i]];
            ERC721(player.nft).transferFrom(
                address(this),
                players[i],
                player.tokenId
            );
        }
    }

    // admin related
    function setTicketPrice(uint256 _value) public onlyOwner {
        ticketPrice = _value;
    }
}
