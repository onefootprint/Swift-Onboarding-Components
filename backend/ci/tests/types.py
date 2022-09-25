from typing import NamedTuple
from tests.auth import PublishableOnboardingKey, TenantSecretAuth


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
    key: PublishableOnboardingKey
    id: str
    name: str
    status: str
    must_collect_data: list
    can_access_data: list

    def from_response(resp):
        return ObConfiguration(
            PublishableOnboardingKey(resp["key"]),
            resp["id"],
            resp["name"],
            resp["status"],
            resp["must_collect_data"],
            resp["can_access_data"],
        )


class Tenant(NamedTuple):
    ob_config: ObConfiguration
    sk: SecretApiKey


class BasicUser(NamedTuple):
    auth_token: str
    phone_number: str
    real_phone_number: str
    email: str


class User(NamedTuple):
    auth_token: str
    fp_user_id: str
    first_name: str
    last_name: str
    address_line1: str
    address_line2: str
    zip: str
    country: str
    ssn: str
    phone_number: str
    real_phone_number: str
    email: str
    tenant: Tenant
