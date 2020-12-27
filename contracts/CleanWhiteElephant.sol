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
    /// Chainlink related
    address internal CHAINLINK_VRF_COORDINATOR =
        0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9;
    address internal CHAINLINK_LINK_TOKEN =
        0xa36085F69e2889c224210F603D836748e7dC0088;
    bytes32 internal CHAINLINK_REQUEST_KEY_HASH =
        0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9;
    uint256 internal CHAINLINK_LINK_CALL_FEE = 0.1 * 10**18;

    /// before this date, you can be buying tickets. After this date, unwrapping begins
    uint256 gameStart = 1609095600;
    /// order in which the players take turns. This gets set after gameStart once everyone has randomness associated to them
    /// an example of this is 231, 0, 21, 3, ...; the numbers signify the addresses at
    /// indices 231, 0, 3 and so on from the players array. We avoid having a map
    /// of indices like 0, 1, 2 and so on to addresses which are then duplicated
    /// as well in the players array
    uint8[256] public playersOrder;
    /// this array tracks the addresses of all the players that will participate in the game
    /// these guys bought the ticket before `gameStart`
    address[256] public players;
    /// address on the left stole from address on the right
    /// think of it as a swap of NFTs
    /// once again the address is the index in players array
    mapping(uint8 => uint8) public swaps;
    /// for onlyOwner use only, this lets the contract know who is allowed to
    /// deposit the NFTs into the prize pool
    mapping(address => bool) public depositors;

    /// @dev at this point we have a way to track all of the players - players
    /// @dev we have the NFT that each player will win (unless stolen from) - playersOrder
    /// @dev we have a way to determine which NFT the player will get if stolen from - swaps

    modifier beforeGameStart() {}

    modifier afterGameStart() {}

    modifier onlyWhitelisted() {}

    constructor()
        public
        VRFConsumerBase(CHAINLINK_VRF_COORDINATOR, CHAINLINK_LINK_TOKEN)
    {
        keyHash = CHAINLINK_REQUEST_KEY_HASH;
        fee = CHAINLINK_LINK_CALL_FEE;
    }

    function generateRandomNumber() internal {}
}
