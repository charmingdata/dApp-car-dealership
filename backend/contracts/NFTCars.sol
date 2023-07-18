// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "contracts/NFTCarsMarketplace.sol";

contract NFTCars is ERC721URIStorage, Pausable {
    address public owner; // owner of NFTCars contract

    uint256 public tokenSupply; // amount of car NFTs that have been listed

    // NOTE ALL NFTCARS NFTS SHOULD HAVE A SETURI() FUNCTION
    // AS MILEAGE, CONDITION ETC CAN CHANGE

    error ContractIsNotERC721();
    error NotApproved();

    constructor (
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {
        owner = msg.sender;
    }

    /**
     * @dev Mints and lists a new CarNFT at id of current `tokenSupply` to function caller
     * and sets listing price to `_cost`.
     * 
     * @param _tokenURI is the URI containing the metadata for the NFT
     * 
     * Sets the URI to `_tokenURI` via {ERC721URIStorage-_setTokenURI}.
     * Mints the NFT using {ERC721-_safeMint}
     */

    function safeMint(string memory _tokenURI) public whenNotPaused {
        tokenSupply++;

        // mints NFT within contract
        _safeMint(msg.sender, tokenSupply);
        
        // sets token URI that points to NFT metadata
        _setTokenURI(tokenSupply, _tokenURI);

    }

    /**
     * @dev Burns `tokenId`. See {ERC721-_burn}.
     *
     * Requirements:
     *
     * - The caller must own `tokenId` or be an approved operator.
     */
    function burn(uint256 tokenId) public {
        if (!_isApprovedOrOwner(_msgSender(), tokenId))
            revert NotApproved();
        _burn(tokenId);
    }

}