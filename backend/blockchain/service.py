from datetime import datetime

from web3 import Web3

from blockchain.client import get_contract, get_web3
from config import get_settings
from models.common import WarrantyStatus

_STATUS_MAP = {
    0: WarrantyStatus.NOT_FOUND,
    1: WarrantyStatus.ACTIVE,
    2: WarrantyStatus.EXPIRED,
    3: WarrantyStatus.REVOKED,
}


def _iso_to_timestamp(iso_date: str) -> int:
    return int(datetime.fromisoformat(iso_date).timestamp())


def verify_registration_onchain(tx_hash: str) -> tuple[int, str]:
    """Confirms a registerWarranty transaction was mined and returns (warranty_id, owner)."""
    w3 = get_web3()
    contract = get_contract()
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    if receipt["status"] != 1:
        raise RuntimeError("Registration transaction failed on-chain")

    events = contract.events.WarrantyRegistered().process_receipt(receipt)
    if not events:
        raise RuntimeError("WarrantyRegistered event not found in transaction receipt")

    args = events[0]["args"]
    return args["warrantyId"], args["owner"]


def verify_transfer_onchain(tx_hash: str, expected_warranty_id: int) -> tuple[str, str]:
    """Confirms a transferWarranty transaction was mined and matches the
    expected warranty id. Returns (fromWallet, toWallet)."""
    w3 = get_web3()
    contract = get_contract()
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    if receipt["status"] != 1:
        raise RuntimeError("Transfer transaction failed on-chain")

    events = contract.events.WarrantyTransferred().process_receipt(receipt)
    matching = [e for e in events if e["args"]["warrantyId"] == expected_warranty_id]
    if not matching:
        raise RuntimeError("WarrantyTransferred event not found for this warranty")

    args = matching[0]["args"]
    return args["from"], args["to"]


def get_warranty_status_onchain(warranty_id: int) -> WarrantyStatus:
    contract = get_contract()
    status_code = contract.functions.verifyWarranty(warranty_id).call()
    return _STATUS_MAP.get(status_code, WarrantyStatus.NOT_FOUND)


def verify_by_serial_onchain(serial_number: str) -> tuple[WarrantyStatus, int]:
    contract = get_contract()
    status_code, warranty_id = contract.functions.verifyWarrantyBySerial(serial_number).call()
    return _STATUS_MAP.get(status_code, WarrantyStatus.NOT_FOUND), warranty_id


def get_owner_products_onchain(wallet: str) -> list[int]:
    contract = get_contract()
    return contract.functions.getOwnerProducts(Web3.to_checksum_address(wallet)).call()
