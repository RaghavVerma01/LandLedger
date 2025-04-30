//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Property.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title Property Escrow
 * @dev Facilitates secure property transactions between buyers and sellers
 */

contract Escrow is Ownable, ReentrancyGuard {
    //Property Contract address
    address public propertyContract;

    // Custom errors

    error InvalidAddress();
    error InvalidAmount();
    error EscrowNotFound();
    error NotAuthorized();
    error EscrowNotActive();
    error InsufficientFunds();
    error TransferFailed();
    error NFTTransferFailed();
    error InvalidEscrowState();
    error EscrowAlreadyExists();

    // Escrow Statuses

    enum EscrowStatus {
        NotExists,
        Active,
        Completed,
        Cancelled,
        Disputed
    }

    // Structure to store escrow details
    struct EscrowDetails {
        address propertyContract;
        uint256 tokenId;
        address buyer;
        address seller;
        uint256 amount;
        uint256 createdAt;
        uint256 expiresAt;
        EscrowStatus status;
        bool inspectionPassed;
        bool buyerApproved;
        bool sellerApproved;
    }

    //Mapping escrowId to escrow details
    mapping(bytes32 => EscrowDetails) public escrows;

    //Escrow fee percentage (in basis points, 100 = 1%)
    uint256 public escrowFeeRate;

    //Time limit for escrow in seconds (default 30 days)
    uint256 public escrowTimeLimit;

    //Events
    event EscrowCreated(
        bytes32 indexed escrowId,
        address indexed propertyContract,
        uint256 indexed tokenId,
        address buyer,
        address seller,
        uint256 amount,
        uint256 expiresAt
    );

    event FundsDeposited(
        bytes32 indexed escrowId,
        address indexed from,
        uint256 amount
    );

    event InspectionUpdated(
        bytes32 indexed escrowId,
        bool passed,
        address updatedBy
    );

    event ApprovalUpdated(
        bytes32 indexed escrowId,
        bool buyerApproved,
        bool sellerApproved
    );

    event EscrowCompleted(
        bytes32 indexed escrowId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        uint256 fee
    );

    event EscrowCancelled(bytes32 indexed escrowId, string reason);

    event EscrowDisputed(
        bytes32 indexed escrowId,
        address disputedBy,
        string Reason
    );

    event EscrowResolved(bytes32 indexed escrowId, EscrowStatus resolution);

    event FeeRateUpdated(uint256 oldRate, uint256 newRate);

    event TimeLimitUpdated(uint256 oldLimit, uint256 newLimit);

    constructor(
        address _propertyContract,
        uint256 _feeRate,
        uint256 _timeLimit
    ) Ownable(msg.sender) {
        propertyContract = _propertyContract;

        if (_feeRate > 1000) revert InvalidAmount(); // Max fee of 10%
        escrowFeeRate = _feeRate;
        escrowTimeLimit = _timeLimit > 0 ? _timeLimit : 30 days;
    }

    /**
     * @dev Creates a new escrow agreement for a property transaction
     * @param _propertyContract Address of the Property NFT Contract
     * @param _tokenId The token Id of the property being sold
     * @param _seller Address of the property seller (current owner)
     * @param _price Agreed price for the property
     * @return escrowId Unique Identifier for the escrow
     */

    function createEscrow(
        address _propertyContract,
        uint256 _tokenId,
        address _seller,
        uint256 _price
    ) external nonReentrant returns (bytes32) {
        if (_propertyContract == address(0) || _seller == address(0))
            revert InvalidAddress();
        if (_price == 0) revert InvalidAmount();

        //Verify that seller is the owner of the property being sold
        address propertyOwner = IERC721(_propertyContract).ownerOf(_tokenId);
        if (propertyOwner != _seller) revert NotAuthorized();

        //Generate a unique Escrow ID
        bytes32 escrowId = keccak256(
            abi.encodePacked(
                _propertyContract,
                _tokenId,
                msg.sender,
                _seller,
                block.timestamp
            )
        );

        // Ensure this escrow doesn't already exist
        if (escrows[escrowId].status != EscrowStatus.NotExists)
            revert EscrowAlreadyExists();

        // Create the escrow
        escrows[escrowId] = EscrowDetails({
            propertyContract: _propertyContract,
            tokenId: _tokenId,
            buyer: msg.sender,
            seller: _seller,
            amount: _price,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + escrowTimeLimit,
            status: EscrowStatus.Active,
            inspectionPassed: false,
            buyerApproved: false,
            sellerApproved: false
        });

        emit EscrowCreated(
            escrowId,
            _propertyContract,
            _tokenId,
            msg.sender,
            _seller,
            _price,
            block.timestamp + escrowTimeLimit
        );

        return escrowId;
    }

    /**
     * @dev Deposit funds into an escrow
     * @param _escrowId The ID of the escrow
     */

    function depositFunds(bytes32 _escrowId) external payable nonReentrant {
        EscrowDetails storage escrow = escrows[_escrowId];

        if (escrow.status != EscrowStatus.Active) revert EscrowNotActive();
        if (msg.sender != escrow.buyer) revert NotAuthorized();
        if (msg.value != escrow.amount) revert InvalidAmount();

        emit FundsDeposited(_escrowId, msg.sender, msg.value);
    }

    /**
     * @dev Update insepction status
     * @param _escrowId The ID of the escrow
     * @param _passed Whether the inspection passed
     */

    function updateInspectionStatus(bytes32 _escrowId, bool _passed) external {
        EscrowDetails storage escrow = escrows[_escrowId];

        if (escrow.status != EscrowStatus.Active) revert EscrowNotActive();
        if (
            msg.sender != escrow.buyer &&
            msg.sender != escrow.seller &&
            msg.sender != owner()
        ) revert NotAuthorized();

        escrow.inspectionPassed = _passed;

        emit InspectionUpdated(_escrowId, _passed, msg.sender);
    }

    /**
     * @dev Approve the escrow transaction
     * @param _escrowId The ID of the escrow
     */

    function approveEscrow(bytes32 _escrowId) external nonReentrant {
        EscrowDetails storage escrow = escrows[_escrowId];

        if (escrow.status != EscrowStatus.Active) revert EscrowNotActive();

        if (msg.sender == escrow.buyer) {
            escrow.buyerApproved = true;
        } else if (msg.sender == escrow.seller) {
            escrow.sellerApproved = true;
        } else {
            revert NotAuthorized();
        }

        emit ApprovalUpdated(
            _escrowId,
            escrow.buyerApproved,
            escrow.sellerApproved
        );

        //If both buyer and seller approved and inspection passed, complete the escrow

        if (
            escrow.buyerApproved &&
            escrow.sellerApproved &&
            escrow.inspectionPassed
        ) {
            _completeEscrow(_escrowId);
        }
    }

    /**
     * @dev Internal function to complete escrow
     * @param _escrowId Unique ID of escrow
     */

    function _completeEscrow(bytes32 _escrowId) internal {
        EscrowDetails storage escrow = escrows[_escrowId];

        //Verify conditions
        if (escrow.status != EscrowStatus.Active) revert EscrowNotActive();
        if (
            !escrow.buyerApproved ||
            !escrow.sellerApproved ||
            !escrow.inspectionPassed
        ) revert InvalidEscrowState();

        //Check if contract has enough funds

        uint256 contractBalance = address(this).balance;
        if (contractBalance < escrow.amount) revert InsufficientFunds();

        //Calculate fees
        uint256 fee = (escrow.amount * escrowFeeRate) / 10000;
        uint256 sellerAmount = escrow.amount - fee;

        //Update escrow status
        escrow.status = EscrowStatus.Completed;

        // Transfer NFT from seller to buyer

        try
            IERC721(escrow.propertyContract).transferFrom(
                escrow.seller,
                escrow.buyer,
                escrow.tokenId
            )
        {
            //Transfer Successful
        } catch {
            revert NFTTransferFailed();
        }

        //Transfer funds to seller
        (bool sellerSuccess, ) = payable(escrow.seller).call{
            value: sellerAmount
        }("");
        if (!sellerSuccess) revert TransferFailed();

        //Transfer fee to contract owner
        if (fee > 0) {
            (bool feeSuccess, ) = payable(owner()).call{value: fee}("");
            if (!feeSuccess) revert TransferFailed();
        }

        emit EscrowCompleted(
            _escrowId,
            escrow.buyer,
            escrow.seller,
            escrow.amount,
            fee
        );
    }

    /**
     * @dev Cancel an escrow and refund buyer
     * @param _escrowId Unique ID of the escrow
     * @param _reason Reason for cancellation
     */

    function cancelEscrow(
        bytes32 _escrowId,
        string memory _reason
    ) external nonReentrant {
        EscrowDetails storage escrow = escrows[_escrowId];

        if (escrow.status != EscrowStatus.Active) revert EscrowNotActive();
        if (
            msg.sender != escrow.buyer &&
            msg.sender != escrow.seller &&
            msg.sender != owner()
        ) revert NotAuthorized();

        escrow.status = EscrowStatus.Cancelled;

        //Refund any deposited funds to the buyer
        uint256 contractBalance = address(this).balance;
        if (contractBalance > 0) {
            (bool success, ) = payable(escrow.buyer).call{
                value: contractBalance
            }("");
            if (!success) revert TransferFailed();
        }

        emit EscrowCancelled(_escrowId, _reason);
    }

    /**
     * @dev Raise a dispute on an escrow
     * @param _escrowId The ID of the escrow
     * @param _reason Reason for dispute
     */

    function disputeEscrow(bytes32 _escrowId, string memory _reason) external {
        EscrowDetails storage escrow = escrows[_escrowId];

        if (escrow.status != EscrowStatus.Active) revert EscrowNotActive();
        if (
            msg.sender != escrow.buyer &&
            msg.sender != escrow.seller &&
            msg.sender != owner()
        ) revert NotAuthorized();

        escrow.status = EscrowStatus.Disputed;

        emit EscrowDisputed(_escrowId, msg.sender, _reason);
    }

    /**
     * @dev Resolve a disputed escrow (only contract owner)
     * @param _escrowId The ID of the escrow
     * @param _resolution The resolution (Completed or Cancelled)
     */

    function resolveDispute(
        bytes32 _escrowId,
        EscrowStatus _resolution
    ) external onlyOwner nonReentrant {
        EscrowDetails storage escrow = escrows[_escrowId];

        if (escrow.status != EscrowStatus.Disputed) revert InvalidEscrowState();
        if (
            _resolution != EscrowStatus.Completed &&
            _resolution != EscrowStatus.Cancelled
        ) revert InvalidEscrowState();
        if (_resolution == EscrowStatus.Completed) {
            _completeEscrow(_escrowId);
        } else {
            escrow.status = EscrowStatus.Cancelled;

            //Refund deposited funds to buyer
            uint256 contractBalance = address(this).balance;
            if (contractBalance > 0) {
                (bool success, ) = payable(escrow.buyer).call{
                    value: contractBalance
                }("");
                if (!success) revert TransferFailed();
            }
        }

        emit EscrowResolved(_escrowId, _resolution);
    }

    /**
     * @dev Update the escrow fee rate (only owner)
     * @param _newFeeRate New fee rate in basis points (100 = 1%)
     */

    function updateFeeRate(uint256 _newFeeRate) external onlyOwner {
        if (_newFeeRate > 1000) revert InvalidAmount(); // Max fee of 10%

        uint256 oldRate = escrowFeeRate;
        escrowFeeRate = _newFeeRate;

        emit FeeRateUpdated(oldRate, _newFeeRate);
    }

    /**
     * @dev Update the escrow time limit (only owner)
     * @param _newTimeLimit New Time limit in seconds
     */

    function updateTimeLimit(uint256 _newTimeLimit) external onlyOwner {
        if (_newTimeLimit == 0) revert InvalidAmount();

        uint256 oldLimit = escrowTimeLimit;
        escrowTimeLimit = _newTimeLimit;

        emit TimeLimitUpdated(oldLimit, _newTimeLimit);
    }

    /**
     * @dev Get escrow details by ID
     * @param _escrowId The ID of the escrow
     * @return Escrow Details
     */

    function getEscrowDetails(
        bytes32 _escrowId
    ) external view returns (EscrowDetails memory) {
        EscrowDetails memory escrow = escrows[_escrowId];
        if (escrow.status == EscrowStatus.NotExists) revert EscrowNotFound();
        return escrow;
    }

    /**
     * @dev Get the current escrow balance
     */
    function getContractBalance() external view onlyOwner returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Function to receive  ether when msg.data is empty
     */

    receive() external payable {}

    /**
     * @dev Fallback function
     */
    fallback() external payable {}
}
