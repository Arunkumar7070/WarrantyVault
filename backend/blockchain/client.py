import json
from functools import lru_cache
from pathlib import Path

from web3 import Web3
from web3.contract import Contract

from config import get_settings

ABI_PATH = Path(__file__).parent / "abi" / "WarrantyRegistry.json"


@lru_cache
def get_web3() -> Web3:
    settings = get_settings()
    return Web3(Web3.HTTPProvider(settings.base_sepolia_rpc_url))


@lru_cache
def get_abi() -> list:
    with open(ABI_PATH) as f:
        return json.load(f)


def get_contract() -> Contract:
    settings = get_settings()
    if not settings.contract_address:
        raise RuntimeError("CONTRACT_ADDRESS is not configured")
    w3 = get_web3()
    return w3.eth.contract(address=Web3.to_checksum_address(settings.contract_address), abi=get_abi())
