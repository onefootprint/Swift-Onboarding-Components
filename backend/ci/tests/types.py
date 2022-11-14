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
    must_collect_identity_document: bool
    can_access_identity_document: bool

    def from_response(resp):
        return ObConfiguration(
            PublishableOnboardingKey(resp["key"]),
            resp["id"],
            resp["name"],
            resp["status"],
            resp["must_collect_data"],
            resp["can_access_data"],
            resp.get("must_collect_identity_document", False),
            resp.get("can_access_identity_document", False),
        )


class Tenant(NamedTuple):
    ob_configs: dict
    sk: SecretApiKey
    auth_token: DashboardAuth

    def ob_config(self):
        return self.ob_configs["default"]


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
