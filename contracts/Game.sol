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
contract Game is Ownable, ERC721Holder, VRFConsumerBase, ReentrancyGuard {
    /// @dev Chainlink related
    address private CHAINLINK_VRF_COORDINATOR =
        0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9;
    address private CHAINLINK_LINK_TOKEN =
        0xa36085F69e2889c224210F603D836748e7dC0088;
    bytes32 private CHAINLINK_REQUEST_KEY_HASH =
        0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4;
    uint256 private CHAINLINK_LINK_CALL_FEE = 0.1 * 10**18;
    /// @dev I have repeated these, but the above make for clearer intent
    bytes32 private keyHash;
    uint256 private fee;

    /// @dev Miners can manipulate up to this much seconds
    uint256 private TIME_MINERS_MAX_MANIPULATION = 900;

    uint256 public ticketPrice = 0.0001 ether;
    /// @dev before this date, you can be buying tickets. After this date, unwrapping begins
    uint256 private TIME_beforeGameStart = 1609095600;
    /// @dev I have read miners can manipulate block time for up to 900 seconds
    /// @dev I am creating two times here to ensure that there is no overlap
    /// @dev To avoid a situation where both are true
    /// @dev 2 * 900 = 1800 gives extra cushion
    uint256 private TIME_gameStart =
        TIME_beforeGameStart + 2 * TIME_MINERS_MAX_MANIPULATION;

    struct Nft {
        address adr;
        uint256 id;
    }

    /// order in which the players take turns. This gets set after gameStart once everyone has randomness associated to them
    /// an example of this is 231, 0, 21, 3, ...; the numbers signify the addresses at
    /// indices 231, 0, 3 and so on from the players array. We avoid having a map
    /// of indices like 0, 1, 2 and so on to addresses which are then duplicated
    /// as well in the players array
    uint8[256] public playersOrder;
    /// Chainlink entropies
    uint256[8] public entropies;
    /// this array tracks the addresses of all the players that will participate in the game
    /// these guys bought the ticket before `gameStart`
    address[256] public players;
    /// to keep track of all the deposited NFTs
    Nft[256] public nfts;
    /// address on the left stole from address on the right
    /// think of it as a swap of NFTs
    /// once again the address is the index in players array
    mapping(uint8 => uint8) public swaps;
    /// for onlyOwner use only, this lets the contract know who is allowed to
    /// deposit the NFTs into the prize pool
    mapping(address => bool) public depositors;
    /// flag that indicates if the game is ready to start
    /// after people bought the tickets, owners initialize the
    /// contract with chainlink entropy. Before this is done
    /// the game cannot begin
    bool initComplete = false;

    /// we slice up Chainlink's uint256 into 32 chunks to obtaink 32 uint8 vals
    /// each one now represents the order of the ticket buyers, which also
    /// represents the NFT that they will unwrap (unless swapped with)
    function initStart(uint8 numCalls, uint256[] calldata ourEntropy)
        external
        onlyOwner
        afterGameStart
    {
        require(numCalls == ourEntropy.length, "incorrect entropy size");
        for (uint256 i = 0; i < numCalls; i++) {
            getRandomness(ourEntropy[i]);
        }
    }

    /// After slicing the Chainlink entropy off-chain, give back the randomness
    /// result here. The technique which will be used must be voiced prior to the
    /// game, obviously
    function initEnd(uint8[256] calldata _playersOrder)
        external
        onlyOwner
        afterGameStart
    {
        require(_playersOrder.length == players.length, "incorrect len");
        playersOrder = _playersOrder;
        initComplete = true;
    }

    /// @dev at this point we have a way to track all of the players - players
    /// @dev we have the NFT that each player will win (unless stolen from) - playersOrder
    /// @dev we have a way to determine which NFT the player will get if stolen from - swaps

    modifier beforeGameStart() {
        require(block.timestamp < TIME_beforeGameStart, "game has now begun");
        _;
    }

    modifier afterGameStart() {
        require(block.timestamp > TIME_gameStart, "game has not started yet");
        require(initComplete, "game has not initialized yet");
        _;
    }

    modifier onlyWhitelisted() {
        require(depositors[msg.sender], "you are not allowed to deposit");
        _;
    }

    /// Add who is allowed to deposit NFTs with this function
    /// All addresses that are not whitelisted will not be
    /// allowed to deposit.
    function addDepositors(address[] calldata ds) external onlyOwner {
        for (uint256 i = 0; i < ds.length; i++) {
            depositors[ds[i]] = true;
        }
    }

    constructor()
        public
        VRFConsumerBase(CHAINLINK_VRF_COORDINATOR, CHAINLINK_LINK_TOKEN)
    {
        // keyHash = CHAINLINK_REQUEST_KEY_HASH;
        // fee = CHAINLINK_LINK_CALL_FEE;
        depositors[0x465DCa9995D6c2a81A9Be80fBCeD5a770dEE3daE] = true;
        depositors[0x426923E98e347158D5C471a9391edaEa95516473] = true;
        depositors[0x63A556c75443b176b5A4078e929e38bEb37a1ff2] = true;
    }

    function deposit(ERC721[] calldata _nfts, uint256[] calldata tokenIds)
        public
        onlyWhitelisted
    {
        require(_nfts.length == tokenIds.length, "variable lengths");
        for (uint256 i = 0; i < _nfts.length; i++) {
            _nfts[i].transferFrom(msg.sender, address(this), tokenIds[i]);
        }
    }

    function buyTicket(uint256 userEntropy) public payable beforeGameStart {
        require(msg.value >= ticketPrice, "sent ether too low");
        /// @dev pay ticket price and call this function to appear in the arr
        players[players.length] = msg.sender;
    }

    /// Randomness is queried afterGameStart but before initComplete (flag)
    function getRandomness(uint256 ourEntropy)
        internal
        returns (bytes32 requestId)
    {
        require(
            LINK.balanceOf(address(this)) >= CHAINLINK_LINK_CALL_FEE,
            "not enough LINK"
        );
        requestId = requestRandomness(
            CHAINLINK_REQUEST_KEY_HASH,
            CHAINLINK_LINK_CALL_FEE,
            ourEntropy
        );
    }

    /// Gets called by Chainlink
    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        entropies[entropies.length] = randomness;
    }

    function unwrap() external afterGameStart {}

    function steal() external afterGameStart {}

    /// Will revert the safeTransfer
    /// on transfer nothing happens, the NFT is not added to the prize pool
    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public override returns (bytes4) {
        revert("we are saving you your NFT, you are welcome");
    }

    /// @dev utility read funcs
}
