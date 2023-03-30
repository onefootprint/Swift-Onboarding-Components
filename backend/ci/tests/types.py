from typing import NamedTuple
from tests.auth import PublishableOnboardingKey, TenantSecretAuth, DashboardAuth


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
    id: str
    default_ob_config: ObConfiguration
    sk: SecretApiKey
    name: str
    auth_token: DashboardAuth
    # The tenant user id for the authed user
    member_id: str


class BasicUser(NamedTuple):
    auth_token: str
    phone_number: str


class User(NamedTuple):
    auth_token: str
    fp_id: str
    first_name: str
    last_name: str
    address_line1: str
    address_line2: str
    zip: str
    city: str
    state: str
    country: str
    ssn: str
    phone_number: str
    real_phone_number: str
    email: str
    validation_token: str
    tenant: Tenant
