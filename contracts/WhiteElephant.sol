/// @author Nazariy Vavryk [nazariy@inbox.ru] - reNFT Labs [https://twitter.com/renftlabs]
// SPDX-License-Identifier: MIT
pragma solidity >=0.6.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Holder.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";

/** Holiday season NFT game. Players buy tickets to win the NFTs
 * in the prize pool. Every ticket buyer will win an NFT. */
contract WhiteElephant is
    Ownable,
    ERC721Holder,
    VRFConsumerBase,
    ReentrancyGuard
{
    struct Info {
        address nft;
        uint256 tokenId;
        bytes32 randomnessRequestId;
        bytes32 stealerRequestId;
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
    /// requestId => randomness
    mapping(bytes32 => uint256) public entropy;
    uint256 public ticketPrice = 0.001 ether;
    address[] public players;
    Nft[] public allNfts;
    /// @dev Chainlink related
    bytes32 private keyHash;
    uint256 private fee;
    /// ---------------------
    /// Whose turn it is to unwrap or steal
    address public playersTurn;
    /** @dev Each player has this many seconds after last actionTime
     * to unwrap or steal. */
    uint256 unwrapIn = 120;
    /// Todo: 2020-12-25 is 1608854400
    uint256 public christmasTimestamp = 1;
    /// @dev Denotes the timestamp at which the last unwrap / steal took place
    uint256 lastActionTime = christmasTimestamp;
    bool public eventEnded;

    modifier onChristmas() {
        // todo;
        require(block.timestamp >= christmasTimestamp, "wait for event start");
        _;
    }

    // KeyHash: 0xAA77729D3466CA35AE8D28B3BBAC7CC36A5031EFDC430821C02BC31A238AF445
    // Coordinator: 0xf0d54349aDdcf704F77AE15b96510dEA15cb7952
    // Fee: 2000000000000000000
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

    function getRandomNumber(uint256 _userProvidedSeed)
        private
        returns (bytes32 requestId)
    {
        Info storage player = info[msg.sender];
        require(
            player.randomnessRequestId == 0,
            "cant generate more than once"
        );
        require(LINK.balanceOf(address(this)) >= fee, "not enough LINK");
        requestId = requestRandomness(keyHash, fee, _userProvidedSeed);
        player.randomnessRequestId = requestId;
        return requestId;
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        entropy[requestId] = randomness;
    }

    function buyTicket(uint256 _userProvidedSeed) public payable nonReentrant {
        require(msg.value >= ticketPrice, "you are sending incorrect amount");
        require(
            info[msg.sender].exists == false,
            "only one ticket per address"
        );
        getRandomNumber(_userProvidedSeed);
        info[msg.sender].hasTicket = true;
        info[msg.sender].exists = true;
        players.push(msg.sender);
    }

    // do not allow depositing just about anyone
    // todo: make a whitelesited arr. Otherwise, people
    // can spam with their sub-par NFTs and the whole
    // event becomes less exciting
    function depositNft(ERC721 _nft, uint256 _tokenId) public {
        _nft.transferFrom(msg.sender, address(this), _tokenId);
        allNfts.push(Nft(_nft, _tokenId));
    }

    /** When someone steals from someone, they do not use their
     * randomness, we will then steal their randomness and give
     * it to the person who has been stolen from. When they unwrap
     * they will unwrap what the stealer would have unwrapped.
     * If they yet steal from someone else, then we once again
     * transfer their randomness. This way everyone will always have
     * an NFT to unwrap. */
    function unwrap(address[] calldata order, address[] calldata redro)
        external
        nonReentrant
        onChristmas
    {
        Info storage player = info[msg.sender];
        /// the below line will revert if the order passed is incorrect
        /// by passing the ordered array of players, we avoid ordering
        /// ourselves on-chain
        (uint256 myOrder, address nextPlayer) =
            ensureOrder(order, player.randomnessRequestId, false);
        // miners can manipulate for up to 900 seconds
        // now determine if unwrap is on time
        uint256 deadline = lastActionTime + unwrapIn;
        uint256 currTime = block.timestamp;
        uint256 missedUnwrap = 1;
        // someone forgot to unwrap
        if (currTime > deadline) {
            // let's determine if it is singular or plural
            while (currTime > deadline) {
                deadline += unwrapIn;
                missedUnwrap += 1;
            }
            // if deadline == currTime, then the player
            // has missed their chance to unwrap and the
            // currently unwrapping address did it as
            // early as they could.
            // If however, we overflow, then it must be the
            // new players turn and so deduct one.
            if (deadline > currTime) {
                missedUnwrap -= 1;
            }
            // now let's determine if our checks are valid
            // if they are not, there is something super frigging wrong
            bool startDecrement;
            address expectedCurr;
            // loop through the reverse sorted array
            for (uint256 i = 0; i < players.length; i++) {
                if (missedUnwrap == 0) {
                    expectedCurr = redro[i];
                    break;
                }
                if (startDecrement) {
                    missedUnwrap -= 1;
                }
                if (redro[i] == msg.sender) {
                    startDecrement = true;
                }
            }
            // all checks out. Proceed ignoring the ones that
            // have failed to unwrap
            if (expectedCurr == playersTurn) {
                playersTurn = msg.sender;
            }
        }
        require(msg.sender == playersTurn, "not your turn");
        player.nft = address(allNfts[myOrder].nft);
        player.tokenId = allNfts[myOrder].tokenId;
        delete player.randomnessRequestId;
        playersTurn = nextPlayer;
        lastActionTime = currTime;
    }

    // this consumes the stealerRandomness. can do this at any point
    function unwrapAfterSteal(address[] calldata _order)
        external
        nonReentrant
        onChristmas
    {
        // order here no longer matters
        Info storage player = info[msg.sender];
        require(player.hasTicket == true);
        require(player.wasStolenFrom == true);
        require(player.stealerRequestId != 0);
        require(player.nft == address(0));
        (uint256 nftToUnwrap, ) =
            ensureOrder(_order, player.stealerRequestId, true);
        player.nft = address(allNfts[nftToUnwrap].nft);
        player.tokenId = allNfts[nftToUnwrap].tokenId;
        delete player.stealerRequestId;
    }

    // savage convention discarder
    function stealNft(
        address _theirAddress,
        address[] calldata _order,
        address[] calldata redro_
    ) public nonReentrant onChristmas {
        Info storage player = info[msg.sender];
        Info storage them = info[_theirAddress];
        require(them.exists == true);
        require(them.wasStolenFrom == false, "cant steal from them again");
        // * player's turn must be after the stolen from turn
        require(
            entropy[player.randomnessRequestId] >
                entropy[them.randomnessRequestId],
            "cant steal from them"
        );
        address nextPlayer = ensureOrder(_order);
        // miners can manipulate for up to 900 seconds
        // now determine if unwrap is on time
        uint256 deadline = lastActionTime + unwrapIn;
        uint256 currTime = block.timestamp;
        uint256 missedUnwrap = 1;
        // someone forgot to unwrap
        if (currTime > deadline) {
            // let's determine if it is singular or plural
            while (currTime > deadline) {
                deadline += unwrapIn;
                missedUnwrap += 1;
            }
            // if deadline == currTime, then the player
            // has missed their chance to unwrap and the
            // currently unwrapping address did it as
            // early as they could.
            // If however, we overflow, then it must be the
            // new players turn and so deduct one.
            if (deadline > currTime) {
                missedUnwrap -= 1;
            }
            // now let's determine if our checks are valid
            // if they are not, there is something super frigging wrong
            bool startDecrement;
            address expectedCurr;
            // loop through the reverse sorted array
            for (uint256 i = 0; i < players.length; i++) {
                if (missedUnwrap == 0) {
                    expectedCurr = redro_[i];
                    break;
                }
                if (startDecrement) {
                    missedUnwrap -= 1;
                }
                if (redro_[i] == msg.sender) {
                    startDecrement = true;
                }
            }
            // have failed to unwrap
            if (expectedCurr == playersTurn) {
                playersTurn = msg.sender;
            }
        }
        require(msg.sender == playersTurn, "not your turn");
        player.nft = info[_theirAddress].nft;
        player.tokenId = info[_theirAddress].tokenId;
        them.wasStolenFrom = true;
        them.stealerRequestId = player.randomnessRequestId;
        delete them.nft;
        delete them.tokenId;
        delete player.randomnessRequestId;
        playersTurn = nextPlayer;
    }

    function ensureOrder(address[] calldata _turns)
        private
        view
        returns (address nextPlayer)
    {
        require(_turns.length == players.length, "huh get your lengths sorted");
        if (_turns.length == 1) {
            return address(0);
        }
        require(info[_turns[0]].hasTicket == true, "dont be cheating");
        uint256 currRandomness = entropy[info[_turns[0]].randomnessRequestId];
        for (uint256 i = 1; i < players.length - 1; i++) {
            require(info[_turns[i]].hasTicket == true, "dont be cheating");
            uint256 nextRandomness =
                entropy[info[_turns[i]].randomnessRequestId];
            require(
                currRandomness <= nextRandomness,
                "incorrectly ordered turns arr"
            );
            if (_turns[i] == address(msg.sender)) {
                if (i + 1 == players.length) {
                    nextPlayer = address(0);
                } else {
                    nextPlayer = _turns[i + 1];
                }
            }
        }
    }

    function ensureOrder(
        address[] calldata _turns,
        bytes32 _requestId,
        bool _stolenFrom
    ) private view returns (uint256 myOrder, address nextPlayer) {
        require(_turns.length == players.length, "huh get your lengths sorted");
        if (_turns.length == 1) {
            // well that's a bummer;
            return (0, address(0));
        }
        require(info[_turns[0]].hasTicket == true, "dont be cheating");
        uint256 currRandomness = entropy[info[_turns[0]].randomnessRequestId];
        for (uint256 i = 1; i < players.length - 1; i++) {
            require(info[_turns[i]].hasTicket == true, "dont be cheating");
            uint256 nextRandomness =
                entropy[info[_turns[i]].randomnessRequestId];
            require(
                currRandomness <= nextRandomness,
                "incorrectly ordered turns arr"
            );
            bytes32 compareVersus;
            if (_stolenFrom) {
                compareVersus = info[_turns[i]].randomnessRequestId;
            } else {
                compareVersus = info[_turns[i]].stealerRequestId;
            }
            if (compareVersus == _requestId) {
                myOrder = i;
                if (i + 1 == players.length) {
                    nextPlayer = address(0);
                } else {
                    nextPlayer = _turns[i + 1];
                }
            }
        }
    }

    function whichTurn(address[] calldata _turns, bytes32 _requestId)
        private
        view
        returns (uint256 myOrder)
    {
        require(_turns.length == players.length, "huh get your lengths sorted");
        if (_turns.length == 1) {
            return 0;
        }
        require(info[_turns[0]].hasTicket == true, "dont be cheating");
        for (uint256 i = 1; i < players.length - 1; i++) {
            require(info[_turns[i]].hasTicket == true, "dont be cheating");
            if (info[_turns[i]].randomnessRequestId == _requestId) {
                return i;
            }
        }
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public override returns (bytes4) {
        revert("deposit the NFTs with reNFT front");
    }

    function getPlayerInfo(address _player)
        public
        view
        returns (
            address nft,
            uint256 tokenId,
            bytes32 randomnessRequestId,
            bytes32 stealerRequestId,
            bool hasTicket,
            bool wasStolenFrom,
            bool exists
        )
    {
        Info storage player = info[_player];
        nft = player.nft;
        tokenId = player.tokenId;
        randomnessRequestId = player.randomnessRequestId;
        stealerRequestId = player.stealerRequestId;
        hasTicket = player.hasTicket;
        wasStolenFrom = player.wasStolenFrom;
        exists = player.exists;
    }

    function numberOfPlayers() public view returns (uint256) {
        return players.length;
    }

    function getPlayerNumber(uint256 _number) public view returns (address) {
        return players[_number];
    }

    function endEvent() external onlyOwner {
        eventEnded = true;
    }

    // to be called by each player on event end
    function claimNft() external {
        require(eventEnded, "the event is not finished yet");
        Info storage player = info[msg.sender];
        require(player.nft != address(0), "nothing to claim");
        require(player.hasTicket, "you dont have a ticket");
        ERC721(player.nft).transferFrom(
            address(this),
            msg.sender,
            player.tokenId
        );
    }

    function setTicketPrice(uint256 _value) external onlyOwner {
        ticketPrice = _value;
    }

    function withdrawERC721(address nft, uint256 tokenId) external onlyOwner {
        ERC721(nft).transferFrom(address(this), msg.sender, tokenId);
    }

    function withdrawERC20(address erc20) external onlyOwner {
        ERC20 token = ERC20(erc20);
        token.approve(msg.sender, 0xfffffffffffffffffffffffffffffff);
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }

    function withdrawEth() external onlyOwner {
        msg.sender.transfer(address(this).balance);
    }
}
