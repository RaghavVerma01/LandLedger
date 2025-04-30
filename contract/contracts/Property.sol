// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title Property
 * @dev Represents real estate properties as NFTs with metadata
 */

contract Property is
    ERC721URIStorage,
    ERC721Enumerable,
    Ownable,
    ReentrancyGuard,
    IERC2981
{
    // Simple uint256 counter for token IDs
    uint256 private _tokenIdTracker;

    // Custom errors (gas-efficient)
    error NotOwner();
    error InvalidInput();
    error PropertyNotForSale();
    error IncorrectPayment();
    error TransferFailed();

    // Property status
    enum PropertyStatus {
        Available,
        UnderContract,
        Sold
    }

    // Property struct to store additional information
    // Removed 'owner' field since we'll use ERC721's ownerOf function
    struct PropertyDetails {
        string location;
        uint256 price;
        PropertyStatus status;
        uint256 sqFootage;
        uint256 bedrooms;
        uint256 bathrooms;
        uint256 yearBuilt;
    }

    // Royalty info
    struct RoyaltyInfo {
        address recipient;
        uint24 basisPoints; // 1% = 100 basis points
    }

    // Mapping from token ID to Property Details
    mapping(uint256 => PropertyDetails) public _propertyDetails;
    RoyaltyInfo private _royaltyInfo;
    uint256 public constant ROYALTY_BASIS = 10000; //Basis for percentage calculations

    // Events
    event PropertyListed(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 price
    );
    event PropertySold(
        uint256 indexed tokenId,
        address indexed oldOwner,
        address indexed newOwner,
        uint256 price
    );
    event PropertyStatusChanged(uint256 indexed tokenId, PropertyStatus status);
    event PropertyPriceChanged(
        uint256 indexed tokenId,
        uint256 oldPrice,
        uint256 newPrice
    );

    constructor(
        string memory name,
        string memory symbol,
        address initialOwner,
        uint24 royaltyBasisPoints
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _tokenIdTracker = 0;
        _royaltyInfo = RoyaltyInfo({
            recipient: initialOwner,
            basisPoints: royaltyBasisPoints
        });
    }

    /**
     * @dev Creates a new property token with comprehensive validation
     */
    function createProperty(
        address to,
        string memory tokenURI,
        string memory location,
        uint256 price,
        uint256 sqFootage,
        uint256 bedrooms,
        uint256 bathrooms,
        uint256 yearBuilt
    ) external nonReentrant returns (uint256) {
        if (bytes(tokenURI).length == 0 || bytes(location).length == 0)
            revert InvalidInput();
        if (
            price == 0 ||
            sqFootage == 0 ||
            bedrooms == 0 ||
            bathrooms == 0 ||
            yearBuilt == 0
        ) revert InvalidInput();

        // Increment the token ID tracker
        _tokenIdTracker += 1;
        uint256 newTokenId = _tokenIdTracker;

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        _propertyDetails[newTokenId] = PropertyDetails({
            location: location,
            price: price,
            status: PropertyStatus.Available,
            sqFootage: sqFootage,
            bedrooms: bedrooms,
            bathrooms: bathrooms,
            yearBuilt: yearBuilt
        });

        emit PropertyListed(newTokenId, msg.sender, price);
        return newTokenId;
    }
    // function createProperty(
    //     address to,
    //     string memory tokenURI,
    //     string memory location,
    //     uint256 price,
    //     uint256 sqFootage,
    //     uint256 bedrooms,
    //     uint256 bathrooms,
    //     uint256 yearBuilt
    // ) external onlyOwner nonReentrant returns (uint256) {
    //     if (bytes(tokenURI).length == 0 || bytes(location).length == 0)
    //         revert InvalidInput();
    //     if (
    //         price == 0 ||
    //         sqFootage == 0 ||
    //         bedrooms == 0 ||
    //         bathrooms == 0 ||
    //         yearBuilt == 0
    //     ) revert InvalidInput();

    //     // Increment the token ID tracker
    //     _tokenIdTracker += 1;
    //     uint256 newTokenId = _tokenIdTracker;

    //     _mint(to, newTokenId);
    //     _setTokenURI(newTokenId, tokenURI);

    //     _propertyDetails[newTokenId] = PropertyDetails({
    //         location: location,
    //         price: price,
    //         status: PropertyStatus.Available,
    //         sqFootage: sqFootage,
    //         bedrooms: bedrooms,
    //         bathrooms: bathrooms,
    //         yearBuilt: yearBuilt
    //     });

    //     emit PropertyListed(newTokenId, to, price);
    //     return newTokenId;
    // }

    /**
     * @dev Allows purchase of property with ETH
     */
    function buyProperty(uint256 tokenId) external payable nonReentrant {
        PropertyDetails storage details = _propertyDetails[tokenId];
        if (details.status != PropertyStatus.Available)
            revert PropertyNotForSale();
        if (msg.value != details.price) revert IncorrectPayment();

        address seller = ownerOf(tokenId);
        _transfer(seller, msg.sender, tokenId);
        details.status = PropertyStatus.Sold;

        (bool success, ) = seller.call{value: msg.value}("");
        if (!success) revert TransferFailed();

        emit PropertySold(tokenId, seller, msg.sender, msg.value);
    }

    /**
     * @dev Updates the property Status with validation
     */
    function updatePropertyStatus(
        uint256 tokenId,
        PropertyStatus status
    ) external {
        try this.ownerOf(tokenId) {
            // Token exists, continue with function
        } catch {
            revert InvalidInput();
        }

        if (ownerOf(tokenId) != msg.sender && owner() != msg.sender)
            revert NotOwner();

        _propertyDetails[tokenId].status = status;
        emit PropertyStatusChanged(tokenId, status);
    }

    /**
     * @dev Updates the property price
     */
    function updatePropertyPrice(uint256 tokenId, uint256 newPrice) external {
        try this.ownerOf(tokenId) {
            // Token exists, continue with function
        } catch {
            revert InvalidInput();
        }

        if (ownerOf(tokenId) != msg.sender) revert NotOwner();
        if (newPrice == 0) revert InvalidInput();

        uint256 oldPrice = _propertyDetails[tokenId].price;
        _propertyDetails[tokenId].price = newPrice;

        emit PropertyPriceChanged(tokenId, oldPrice, newPrice);
    }

    /**
     * @dev Implements ERC-2981 royalty standard
     */
    function royaltyInfo(
        uint256,
        uint256 salePrice
    ) external view override returns (address receiver, uint256 royaltyAmount) {
        royaltyAmount = (salePrice * _royaltyInfo.basisPoints) / ROYALTY_BASIS;
        return (_royaltyInfo.recipient, royaltyAmount);
    }

    /**
     * @dev Returns property details by tokenId
     */
    function getPropertyDetails(
        uint256 tokenId
    ) external view returns (PropertyDetails memory) {
        ownerOf(tokenId); // This will revert if token doesn't exist
        return _propertyDetails[tokenId];
    }

    /**
     * @dev Returns the current owner of a property
     */
    function getPropertyOwner(uint256 tokenId) external view returns (address) {
        return ownerOf(tokenId);
    }

    // Required overrides due to multiple inheritance
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return ERC721URIStorage.tokenURI(tokenId);
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 amount
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, amount);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721Enumerable, ERC721URIStorage, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}