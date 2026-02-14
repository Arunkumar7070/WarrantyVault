// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title WarrantyRegistry
/// @notice On-chain registry of tamper-proof product warranties for WarrantyVault.
/// Off-chain product/user metadata lives in MongoDB; this contract is the
/// source of truth for warranty existence, ownership, and validity.
contract WarrantyRegistry is Ownable {
    enum Status {
        NotFound,
        Active,
        Expired,
        Revoked
    }

    struct Warranty {
        uint256 id;
        address owner;
        string productId; // off-chain Product._id reference
        string serialNumber;
        uint256 purchaseDate; // unix timestamp
        uint256 expiryDate; // unix timestamp
        string invoiceCID; // IPFS CID of the invoice
        bool revoked;
        bool exists;
    }

    uint256 private _nextWarrantyId = 1;

    mapping(uint256 => Warranty) private _warranties;
    mapping(bytes32 => uint256) private _serialToWarrantyId; // keccak256(serialNumber) => id
    mapping(address => uint256[]) private _ownerWarranties;
    mapping(address => bool) public registrars; // manufacturers/retailers allowed to register

    event RegistrarUpdated(address indexed account, bool allowed);
    event WarrantyRegistered(
        uint256 indexed warrantyId,
        address indexed owner,
        string productId,
        string serialNumber,
        uint256 expiryDate
    );
    event WarrantyTransferred(uint256 indexed warrantyId, address indexed from, address indexed to);
    event WarrantyRevoked(uint256 indexed warrantyId);

    modifier onlyRegistrar() {
        require(registrars[msg.sender] || msg.sender == owner(), "WarrantyRegistry: not a registrar");
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {
        registrars[initialOwner] = true;
        emit RegistrarUpdated(initialOwner, true);
    }

    /// @notice Grant or revoke permission to register warranties (manufacturers/retailers).
    function setRegistrar(address account, bool allowed) external onlyOwner {
        registrars[account] = allowed;
        emit RegistrarUpdated(account, allowed);
    }

    /// @notice Register a new warranty for a product, minting a unique warranty id.
    function registerWarranty(
        address initialOwner,
        string calldata productId,
        string calldata serialNumber,
        uint256 purchaseDate,
        uint256 expiryDate,
        string calldata invoiceCID
    ) external returns (uint256 warrantyId) {
        require(initialOwner != address(0), "WarrantyRegistry: zero owner");
        require(bytes(serialNumber).length > 0, "WarrantyRegistry: empty serial");
        require(expiryDate > purchaseDate, "WarrantyRegistry: invalid warranty period");

        bytes32 serialHash = keccak256(bytes(serialNumber));
        require(_serialToWarrantyId[serialHash] == 0, "WarrantyRegistry: serial already registered");

        warrantyId = _nextWarrantyId++;

        _warranties[warrantyId] = Warranty({
            id: warrantyId,
            owner: initialOwner,
            productId: productId,
            serialNumber: serialNumber,
            purchaseDate: purchaseDate,
            expiryDate: expiryDate,
            invoiceCID: invoiceCID,
            revoked: false,
            exists: true
        });

        _serialToWarrantyId[serialHash] = warrantyId;
        _ownerWarranties[initialOwner].push(warrantyId);

        emit WarrantyRegistered(warrantyId, initialOwner, productId, serialNumber, expiryDate);
    }

    /// @notice Transfer ownership of a warranty to another wallet. Only the current owner may call.
    function transferWarranty(uint256 warrantyId, address newOwner) external {
        Warranty storage w = _warranties[warrantyId];
        require(w.exists, "WarrantyRegistry: warranty not found");
        require(w.owner == msg.sender, "WarrantyRegistry: not warranty owner");
        require(newOwner != address(0), "WarrantyRegistry: zero new owner");
        require(!w.revoked, "WarrantyRegistry: warranty revoked");

        address previousOwner = w.owner;
        w.owner = newOwner;
        _ownerWarranties[newOwner].push(warrantyId);
        _removeFromOwnerList(previousOwner, warrantyId);

        emit WarrantyTransferred(warrantyId, previousOwner, newOwner);
    }

    /// @notice Revoke a warranty (e.g. fraud, recall). Only a registrar or the contract owner.
    function revokeWarranty(uint256 warrantyId) external onlyRegistrar {
        Warranty storage w = _warranties[warrantyId];
        require(w.exists, "WarrantyRegistry: warranty not found");
        w.revoked = true;
        emit WarrantyRevoked(warrantyId);
    }

    /// @notice Verify a warranty's current status by id.
    function verifyWarranty(uint256 warrantyId) external view returns (Status status) {
        Warranty storage w = _warranties[warrantyId];
        if (!w.exists) return Status.NotFound;
        if (w.revoked) return Status.Revoked;
        if (block.timestamp > w.expiryDate) return Status.Expired;
        return Status.Active;
    }

    /// @notice Verify a warranty's current status by serial number.
    function verifyWarrantyBySerial(string calldata serialNumber) external view returns (Status status, uint256 warrantyId) {
        warrantyId = _serialToWarrantyId[keccak256(bytes(serialNumber))];
        if (warrantyId == 0) return (Status.NotFound, 0);
        Warranty storage w = _warranties[warrantyId];
        if (w.revoked) return (Status.Revoked, warrantyId);
        if (block.timestamp > w.expiryDate) return (Status.Expired, warrantyId);
        return (Status.Active, warrantyId);
    }

    /// @notice Fetch full warranty details by id.
    function getWarranty(uint256 warrantyId) external view returns (Warranty memory) {
        require(_warranties[warrantyId].exists, "WarrantyRegistry: warranty not found");
        return _warranties[warrantyId];
    }

    /// @notice List all warranty ids currently owned by an address.
    function getOwnerProducts(address ownerAddr) external view returns (uint256[] memory) {
        return _ownerWarranties[ownerAddr];
    }

    function totalWarranties() external view returns (uint256) {
        return _nextWarrantyId - 1;
    }

    function _removeFromOwnerList(address account, uint256 warrantyId) private {
        uint256[] storage ids = _ownerWarranties[account];
        for (uint256 i = 0; i < ids.length; i++) {
            if (ids[i] == warrantyId) {
                ids[i] = ids[ids.length - 1];
                ids.pop();
                break;
            }
        }
    }
}
