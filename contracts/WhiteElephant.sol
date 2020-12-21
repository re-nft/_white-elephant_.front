// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";

contract WhiteElephant is Ownable, ERC721Holder, VRFConsumerBase {
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
    uint16 public currNftToUnwrap = 0;
    uint256 public ticketPrice = 0.1 ether;

    address[] public players;
    Nft[] public allNfts;

    bytes32 internal keyHash;
    uint256 internal fee;
    uint256 public randomResult;

    modifier yourOrder(address _sender) {
        require(info[_sender].orderNum == currNftToUnwrap + 1, "not your turn");
        _;
    }

    modifier onChristmas() {
        // todo: find the Christmas block number;
        require(block.number >= 1, "wait for Christmas");
        _;
    }

    /**
     * Constructor inherits VRFConsumerBase
     *
     * Network: Kovan
     * Chainlink VRF Coordinator address: 0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9
     * LINK token address:                0xa36085F69e2889c224210F603D836748e7dC0088
     * Key Hash: 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4
     */
    constructor()
        public
        VRFConsumerBase(
            0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9, // VRF Coordinator
            0xa36085F69e2889c224210F603D836748e7dC0088 // LINK Token
        )
    {
        keyHash = 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4;
        fee = 0.1 * 10**18; // 0.1 LINK
    }

    /**
     * Requests randomness from a user-provided seed
     */
    function getRandomNumber(uint256 userProvidedSeed)
        public
        returns (bytes32 requestId)
    {
        require(
            LINK.balanceOf(address(this)) >= fee,
            "Not enough LINK - fill contract with faucet"
        );
        return requestRandomness(keyHash, fee, userProvidedSeed);
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        randomResult = randomness;
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

    // can only deposit before christmas block.number
    // after that we know exactly how many players are taking part
    // that will be the length of the players array.
    // we need to fix the number of players after that point
    // to safely generate random numbers and assign the winners.
    // It is possible to map any interval [a, b] to an interval
    // [c, d] where all are real numbers. This is because intervals
    // are equivalent in set theoretic terms. Now this implies that
    // no matter the size of the generated random number, we can
    // put it in an equivalence relation with the set of the random
    // numbers (which we want) whose upper boundary is the total
    // number of players minus one. This is trivially achieved by looking
    // at the sections of the generated random number.
    // Proof by contradiction:
    // Suppose that the last 2 digit truncation of uint256 randomness is
    // not uniformly distributed. That would mean that numbers with a certain
    // ending ared to turn up more often. For example, numbers with
    // endings 1, but that would mean that other numbers are less likely
    // to turn up. So endings are not uniformly distributed and that implies
    // that the randomness source does not sample uniformly. Which contradicts
    // the premise that the source is uniformly random. And so if the source
    // is uniformly random then that must mean that so is truncation.
    // This implies that if we want to generate a random number where the
    // upper boundary is the number of players, we just need to truncate
    // the randomness. If the NFt is not available, take next closest one
    // Implementation
    // Reqruire a function that takes a uint256, e.g. 21 players
    // and gives us the number of the last few bits we have to
    // look at for our truncated number. For example, suppose
    // that the number of players is 42, then we must look at
    // 2 ** 0 + 2 ** 1 + 2 ** 2 + 2 ** 3 + 2 ** 4 + 2 ** 5
    // 1 + 2 + 4 + 8 + 16 + 32 = 31 + 32 = 63
    // i.e. the last 5 bits, because we can construct 42 like so:
    // 2 ** 5 + 2 ** 3 + 2 ** 1: 10110.
    // this is equivalent to finding the log of base 2
    // lb(42) = 5.39. i.e. we need 6 bits to express 42
    function depositNft(ERC721 _nft, uint256 _tokenId) public {
        _nft.transferFrom(msg.sender, address(this), _tokenId);
        allNfts.push(Nft(_nft, _tokenId));
    }

    function stealNft(address _theirAddress)
        public
        yourOrder(msg.sender)
        onChristmas
    {
        Info storage player = info[msg.sender];
        Info storage them = info[_theirAddress];

        require(them.exists == true);
        require(player.orderNum > them.orderNum, "cant steal from them");
        require(them.wasStolenFrom == false, "cant steal from them again");

        player.nft = info[_theirAddress].nft;
        player.tokenId = info[_theirAddress].tokenId;

        them.wasStolenFrom = true;
        them.nft = address(0);
        them.tokenId = 0;

        currNftToUnwrap++;
    }

    function unwrap() public yourOrder(msg.sender) onChristmas {
        Info storage player = info[msg.sender];

        player.nft = address(allNfts[currNftToUnwrap].nft);
        player.tokenId = allNfts[currNftToUnwrap].tokenId;

        currNftToUnwrap++;
    }

    function unwrapAfterSteal() public onChristmas {
        Info storage player = info[msg.sender];

        require(player.exists == true);
        require(player.wasStolenFrom == true);
        require(player.nft == address(0));
        require(player.tokenId == 0);
        require(player.orderNum != 0);
        require(player.hasTicket == true);

        // todo: chainlink
        player.nft = address(allNfts[currNftToUnwrap].nft);
        player.tokenId = allNfts[currNftToUnwrap].tokenId;
    }

    // todo: test this
    // forbid people to just send ERC721s to us with safeTransfer calls
    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public override returns (bytes4) {
        revert("deposit the NFTs with reNFT front");
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

    function getPlayerInfo(address _player)
        public
        view
        returns (
            address nft,
            uint256 tokenId,
            uint16 orderNumber,
            bool hasTicket,
            bool wasStolenFrom,
            bool exists
        )
    {
        Info storage player = info[_player];
        nft = player.nft;
        tokenId = player.tokenId;
        orderNumber = player.orderNum;
        hasTicket = player.hasTicket;
        wasStolenFrom = player.wasStolenFrom;
        exists = player.exists;
    }

    // ---

    function numberOfPlayers() public view returns (uint256) {
        return players.length;
    }

    function getPlayerNumber(uint256 _number) public view returns (address) {
        return players[_number];
    }

    // todo: test this
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
