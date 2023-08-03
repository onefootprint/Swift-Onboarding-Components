from typing import NamedTuple

from pyparsing import Any
from tests.headers import PublishableOnboardingKey, TenantSecretAuth, DashboardAuth


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
    tenant: Any  # Tenant

    def from_response(resp, tenant):
        return ObConfiguration(
            PublishableOnboardingKey(resp["key"]),
            resp["id"],
            resp["name"],
            resp["status"],
            resp["must_collect_data"],
            resp["can_access_data"],
            tenant,
        )


class Tenant(NamedTuple):
    id: str
    default_ob_config: ObConfiguration
    sk: SecretApiKey
    name: str
    db_auths: list
    auth_token: DashboardAuth
    # The tenant user id for the authed user
    member_id: str


class BasicUser(NamedTuple):
    auth_token: str
    phone_number: str
    sandbox_id: str


class User(NamedTuple):
    validation_token: str
    fp_id: str
    auth_token: str
    tenant: Tenant
    phone_number: str
    email: str
    ssn: str
