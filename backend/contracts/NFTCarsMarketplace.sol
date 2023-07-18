// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

import "hardhat/console.sol";

contract NFTCarsMarketplace is Ownable {
    // interface id for erc721: 0x80ac58cd

    uint256 public totalSupply; // amount of car NFTs that have been listed

    struct CarListing {
        address listingOwner;
        address contractAddress; // address of the NFTs contract
        uint256 nativeId; // tokenId of the NFT in its contract
        uint256 cost; // listPrice
        bool isListed; // whether or not the token is avaliable to buy
    }

    // note mileage should not be kept in NFT as it changes

    mapping(address => uint256) balances;
    mapping(uint256 => CarListing) carListings;

    error NotAuthorized();
    error InsufficientFunds();
    error NotAvaliable();
    error TransactionFailed();
    error ContractIsNotERC721();

    event CarSaleExecuted(address from, address to, uint256 listingId);

    constructor () Ownable() {}

    modifier onlyTokenOwner(uint256 _listingId) {
        if (msg.sender != getOwner(_listingId)) {
            revert NotAuthorized();
        }

        _;
    }

    /**
     * @dev Lists car NFT and produces new `Car` struct to represent it in
     * this contract and sets listing price to `cost`.
     * Allows for users to migrate existing ERC721 NFTs to this marketplace.
     *
     * @param _contractAddress The contract address of the NFT that
     * will be sold in this marketplace
     * @param _tokenId The id of the NFT in its contract
     *
     * Requirements:
     * - NFT contract must be ERC721
     * - This contract must be approved to manage all tokens
     * - Caller must be owner or approved to manage the token
     *
     */
    function listCar(
        address _contractAddress,
        uint256 _tokenId,
        uint256 _cost)
        public {

        // Checks to see if contract is ERC721
        if (!ERC165Checker.supportsInterface(_contractAddress, 0x80ac58cd)) {
            revert ContractIsNotERC721();
        }

        // Checks to see if the msg.sender is the owner of the token
        if (msg.sender != IERC721(_contractAddress).ownerOf(_tokenId)) {
            // If they are not owner, check to see if they are approved to
            // manage token
            if (!IERC721(_contractAddress).isApprovedForAll(
                IERC721(_contractAddress).ownerOf(_tokenId),
                msg.sender)
                ) {
                    revert NotAuthorized();
                }
        }

        // Checks to see if contract is approved to manage
        if (!IERC721(_contractAddress).isApprovedForAll(
                IERC721(_contractAddress).ownerOf(_tokenId), address(this)
            )) {

            revert NotAuthorized();
        }

        totalSupply++;

        // Stores the NFT & listing data in struct
        carListings[totalSupply] = CarListing(
            msg.sender,
            _contractAddress,
            _tokenId,
            _cost,
            true
        );

    }

    /**
     * @dev Transfers Car NFT to buyer, checking first that contract recipients
     * are aware of the ERC721 protocol to prevent tokens from being forever
     * locked.
     *
     * Uses {ERC721-safeTransferFrom}
     *
     * Requirements:
     * - Car must be listed (`isListed = true`)
     * - `_listingId` must exist
     * - `msg.value` must be equal to the cost
     * - Listing owner must be the same as token owner
     */
    function buyCar(uint256 _listingId) public payable {
        address tokenContract = carListings[_listingId].contractAddress;

        // Checks to see if the car is avaliable and if the listing Id is valid
        if (!carListings[_listingId].isListed ||
            _listingId > totalSupply ||
            _listingId == 0

        ) {
            revert NotAvaliable();
        }

        // Checks that the ETH sent is equal to the car cost
        if (msg.value != carListings[_listingId].cost) {
            revert InsufficientFunds();
        }

        // Checks that listing owner is still the token owner as the token
        // may have changed hands since listing outside of the marketplace.
        // This is just extra measures, in case it isn't updated on frontend
        if (carListings[_listingId].listingOwner != IERC721(tokenContract
            ).ownerOf(carListings[_listingId].nativeId)) {

            revert NotAuthorized();
        }

        // Sets car listing as unavaliable to buy
        carListings[_listingId].isListed = false;

        // Updates the balances of the token owner
        balances[getOwner(_listingId)] += msg.value;

        // Transfers the NFT to the buyer's address
        // We use a try block here in case the token has changed hands and approval is false
        IERC721(
            carListings[_listingId].contractAddress
        ).safeTransferFrom(getOwner(_listingId), msg.sender, _listingId);

        emit CarSaleExecuted(getOwner(_listingId), msg.sender, _listingId);

    }

    /**
     * @dev Updates the price of the Car NFT.
     *
     * Requires caller to be token owner.
     *
     */
    function updateCost(
        uint256 _listingId,
        uint256 _cost
        )

        public onlyTokenOwner(_listingId) {
        // We check if cost value is different to optimise gas
        if (_cost != carListings[_listingId].cost) {
            carListings[_listingId].cost = _cost;
        }

        carListings[_listingId].cost = _cost;
    }

    /**
     * @dev Allows user's to withdraw `_amount` of ETH from the smart contract.
     *
     * Requirements:
     * - `_amount` cannot be more than user balances
     *
     * Reverts upon transaction failiure
     */
    function withdraw(uint256 _amount) public {
        if (_amount > balances[msg.sender]) {
            revert InsufficientFunds();
        }

        balances[msg.sender] -= _amount;

        (bool sent,) = msg.sender.call{value: _amount}("");

        if(!sent) {
            revert TransactionFailed();
        }
    }

        /**
     * @dev Pauses the listing of the Car NFT so that it cannot be purchased.
     *
     * Requires caller to be token owner.
     *
     */
    function makeUnavaliable(uint256 _listingId) external onlyTokenOwner(_listingId) {
        carListings[_listingId].isListed = false;
    }

    /**
     * @dev Unpauses the listing of the Car NFT so that it can be purchased.
     *
     * Requires caller to be token owner.
     *
     */
    function makeAvaliable(
        uint256 _listingId,
        uint256 _cost
        )
        external onlyTokenOwner(_listingId) {
        // Checks if listing owner is the same as token owner
        if (carListings[_listingId].listingOwner != getOwner(_listingId)) {
            // Updates the state if this is not the case
            //      This allows the same listing to be preserved
            //      if the new owner decides to sell
            //      the car again, therefore saving gas.
            carListings[_listingId].listingOwner = msg.sender;
        }

        // We check if cost value is different to optimise gas
        if (_cost != carListings[_listingId].cost) {
            carListings[_listingId].cost = _cost;
        }

        carListings[_listingId].isListed = true;
    }

    /**
     * @dev Returns the `CarListing` struct associated with a `_listingId`.
     *
     * Listing id must exist.
     */
    function getCarListing(uint256 _listingId) public view returns (CarListing memory) {
        // Checks to see if the car is avaliable and if the listing Id is valid
        if (_listingId > totalSupply || _listingId == 0) {
            revert NotAvaliable();
        }

        return carListings[_listingId];
    }


    /**
     * @dev Returns the balance of address `_addr`.
     *
     * `_addr` must not be address zero.
     */
    function getBalances(address _addr) public view returns (uint256) {
        if (_addr == address(0)) {
            revert NotAvaliable();
        }

        return balances[_addr];
    }

    /**
     * @dev Returns the owner of listing with id `_listingId`.
     *
     * Listing id must exist.
     */
    function getOwner(uint256 _listingId) public view returns (address) {
        // Checks to see if the listing Id is valid
        if ( _listingId > totalSupply || _listingId == 0) {
            revert NotAvaliable();
        }

        return IERC721(
                carListings[_listingId].contractAddress
            ).ownerOf(carListings[_listingId].nativeId);
    }

}