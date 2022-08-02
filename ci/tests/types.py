from typing import NamedTuple
from tests.auth import TenantAuth, TenantSecretAuth


class SecretApiKey(NamedTuple):
    key: TenantSecretAuth
    id: str
    name: str
    status: str

    def from_response(resp):
        return SecretApiKey(
            TenantSecretAuth(resp["key"]),
            resp["id"],
            resp["name"],
            resp["status"],
        )


class ObConfiguration(NamedTuple):
    key: TenantAuth
    id: str
    name: str
    status: str
    must_collect_data_kinds: list
    can_access_data_kinds: list

    def from_response(resp):
        return ObConfiguration(
            TenantAuth(resp["key"]),
            resp["id"],
            resp["name"],
            resp["status"],
            resp["must_collect_data_kinds"],
            resp["can_access_data_kinds"],
        )


class Tenant(NamedTuple):
    ob_config: ObConfiguration
    sk: SecretApiKey


class User(NamedTuple):
    auth_token: str
    fp_user_id: str
    first_name: str
    last_name: str
    street_address: str
    zip: str
    country: str
    ssn: str
    phone_number: str
    real_phone_number: str
    email: str
    tenant: Tenant