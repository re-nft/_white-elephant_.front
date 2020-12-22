// I shall not be like Riemann, there shall-eth be scaffolding left in place. 10-4 as Nick says
// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Holder.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";

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

    // todo: this will be chainlink
    // 0 signifies no ticket number. i.e. you have not bought the ticket
    uint16 public orderNum = 1;
    uint16 public currNftToUnwrap = 0;
    uint256 public ticketPrice = 0.001 ether;

    address[] public players;
    Nft[] public allNfts;

    bytes32 internal keyHash;
    uint256 internal fee;

    // requestId => randomness
    mapping(bytes32 => uint256) public entropy;
    // this variable is used to signify whose turn it currently is
    address public playersTurn;
    // each player has this much time to to unwrap.
    // this is in seconds
    uint256 unwrapIn = 120;
    // * todo
    // 2020-12-25 is 1608854400
    uint256 public christmasTimestamp = 1;
    // denotes the timestamp at which the last unwrap / steal took place
    uint256 lastActionTime = christmasTimestamp;

    // this check that it is your turn
    // if it is not but the previous player / players
    // have exceeded the deadline by which they should
    // have unwrapped, you can unwrap!
    // If the person knows which NFT they get, it is in
    // their interest to avoid unwrapping. Because then,
    // noone can steal from them. This implies that
    // we must make the player forefeit their ticket
    // if they do not unwrap on time. Creates an incentive
    // to unwrap, because if they do not, they will lose their
    // ticket price.
    // modifier yourTurn(address _sender) {
    //     require(_sender == playersTurn, "not your turn");
    //     _;
    // }

    modifier onChristmas() {
        // todo;
        require(block.timestamp >= christmasTimestamp, "wait for Christmas");
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

    // foreseeable that someone may try to game this by calling this
    // as soon as they see a transaction pending to buy ticket.
    // or if someone was stolen from. How do I get rid of front-running here?
    // This function is not a problem on the initial ticket buy.
    // It certainly is when someone steals from someone. The party that is stolen
    // from will need to draw a random number again. The new number cannot be
    // based on the original randomness, and it cannot be offchain. Because then
    // the user can keep generating the RN until he gets the NFT that he wants
    // by rejecting the transactions that are not "suitable". We must perform
    // another Chainlink fetch. That, however, implies that someone else can
    // be front-running the user that was stolen from by calling getRandomNumber
    // to make so that the user gets a number that will yield a lower quality
    // NFT. This is only possible if the hijacker somehow uncracked chainlink's
    // randomness generation. I am making a big assumption here, that Chainlink's
    // randomness is truly random and so hijacking the user will yield to nada.
    // This then means that no front-running safeguards are required. We can
    // ensure that randomness is used by the user that has generated it, though!
    // This can be done, by adding the address that has last generated the randomness
    // and requiring that the randomness last generated be consumed by the generator.
    // Need to ensure that such randomness is not being consumes more than once
    // by the generator. This can be avoided by resetting the randomness, whenever
    // it is being consumed by the producer.
    // Even better, let someone buy the ticket, and then mark a flag that they are yet
    // to generate randomness for themselves. And so if someone tries to front-run this
    // person, then they must have a ticket themselves, otherwise they are not allowed
    // to generate the randomness. If they have a ticket and they have generated the
    // randomness, then they will get a revert. This way only ticket holders can generate
    // the randomness. In fact, the flag can be simply the randomness attribute. If it is
    // the default value i.e. 0, and the player has ticket, then they can request the
    // generation of the random number. Otherwise, they can't. In that sense, only the
    // people who have bought the ticket can "front-run". Even then, they do not know
    // the source of Chainlink's randomness. This however, will ensure that our contract's
    // LINK is only ever spent by the people who actually bought the ticket to participate.
    // Lol, so much thought and the solution is simple: make random generation internal
    // function, and call on ticket buying which should be non-reentrant.
    /**
     * Requests randomness from a user-provided seed
     */
    function getRandomNumber(uint256 _userProvidedSeed)
        internal
        returns (bytes32 requestId)
    {
        Info storage player = info[msg.sender];
        // todo: this requires resetting the randomness when it is being consumed
        // unwrap after stolen mustn't reset. Because each player is only ever allowed
        // to unwrap twice at most.
        require(
            player.randomnessRequestId == 0,
            "cant generate more than once"
        );
        require(LINK.balanceOf(address(this)) >= fee, "not enough LINK");
        requestId = requestRandomness(keyHash, fee, _userProvidedSeed);
        player.randomnessRequestId = requestId;
        return requestId;
    }

    /**
     * Callback function used by VRF Coordinator
     */
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
    // *** in fact the above is not neccessary. It is possible to simplify the process
    // considerably. By simply storing the Chainlink randomness and on the day of Christmas
    // New Year determine the order of the players. When someone steals from someone
    // a random implementation that uses previously generated randomness will be used
    // which unwrapped NFT will go to the player who will unwrap after steal.
    function depositNft(ERC721 _nft, uint256 _tokenId) public {
        _nft.transferFrom(msg.sender, address(this), _tokenId);
        allNfts.push(Nft(_nft, _tokenId));
    }

    // when someone steals from someone, they do not use their
    // randomness, we will then steal their randomness and give
    // it to the person who has been stolen from. When they unwrap
    // they will unwrap what the stealer would have unwrapped.
    // If they yet steal from someone else, then we once again
    // transfer their randomness. This way everyone will always have
    // an NFT to unwrap
    function unwrap(address[] calldata order, address[] calldata redro)
        external
        nonReentrant
        onChristmas
    {
        Info storage player = info[msg.sender];
        // the below line will revert if the order passed is incorrect
        // by passing the ordered array of players, we avoid ordering
        // ourselves on-chain
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
            // all checks out. Proceed ignoring the ones that
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
        internal
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

    // the turns here are in the order of the players
    // first address is the one with the lowest chainlink randomness
    // so when we compare its randomness to that of the next player
    // it must be lower and so on. When we have looped through all
    // of the players we know the order is established
    function ensureOrder(
        address[] calldata _turns,
        bytes32 _requestId,
        bool _stolenFrom
    ) internal view returns (uint256 myOrder, address nextPlayer) {
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
        internal
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

    // -- info related --

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

    // ----

    function endEvent(address[] calldata _turns) public onChristmas {
        ensureOrder(_turns);
        // if someone hasn't unwrapped, just send them what they
        // would have gotten if they would have unwrapped
        // if someone hasn't unwrapped, then noone has stolen from
        // them, so there is only randomness generated when the ticket
        // was bought
        // if someone bricks this with untransfarable NFT, we can always
        // send the winners them manually with the methods below
        for (uint256 i = 0; i < players.length; i++) {
            Info storage player = info[players[i]];
            // those whose address is zero
            if (player.nft != address(0)) {
                ERC721(player.nft).transferFrom(
                    address(this),
                    players[i],
                    player.tokenId
                );
            }
        }
    }

    // admin related

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
