from typing import NamedTuple, List

from pyparsing import Any
from tests.headers import PlaybookKey, TenantSecretAuth, DashboardAuth


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
    key: PlaybookKey
    tenant: Any  # Tenant
    id: str
    playbook_id: str
    name: str
    status: str
    must_collect_data: List[str]
    can_access_data: List[str]
    is_live: bool
    required_auth_methods: List[str]
    is_no_phone_flow: bool

    def from_response(resp, tenant):
        return ObConfiguration(
            PlaybookKey(resp["key"]),
            tenant,
            resp["id"],
            resp["playbook_id"],
            resp["name"],
            resp["status"],
            resp["must_collect_data"],
            resp["can_access_data"],
            resp["is_live"],
            resp["required_auth_methods"],
            resp["is_no_phone_flow"],
        )


class Tenant(NamedTuple):
    id: str
    default_ob_config: ObConfiguration
    # Just a convenience shorthand for the key created with the specified is_live.
    sk: SecretApiKey
    # Live key
    l_sk: TenantSecretAuth
    # Sandbox key
    s_sk: TenantSecretAuth
    name: str
    db_auths: list
    auth_token: DashboardAuth
    ro_db_auths: list
    ro_auth_token: DashboardAuth


class PartnerTenant(NamedTuple):
    id: str
    name: str
    db_auths: list
    auth_token: DashboardAuth
    ro_db_auths: list
    ro_auth_token: DashboardAuth


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
