// SPDX-License-Identifier: MIT
pragma solidity ^0.7.5;

// 1. buy a ticket - mapping(address => boolean);
// 2. redeem a ticket - (i) unwrap or (ii) steal
// 3. user address to nft address
contract WhiteElephant {
    struct Info {
        address nft;
        uint256 tokenId;
        bool hasTicket;
        bool wasStolenFrom;
        bool exists;
    }

    mapping(address => Info) private info;

    function buyTicket() public payable {
        require(msg.value >= 0.001 ether, "ticket price is 0.01");
        require(
            info[msg.sender].exists == false,
            "only one ticket per address"
        );

        info[msg.sender].hasTicket = true;
        info[msg.sender].exists = true;
    }
}
