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
    can_access_identity_document_images: bool

    def from_response(resp):
        return ObConfiguration(
            PublishableOnboardingKey(resp["key"]),
            resp["id"],
            resp["name"],
            resp["status"],
            resp["must_collect_data"],
            resp["can_access_data"],
            resp.get("must_collect_identity_document", False),
            resp.get("can_access_identity_document_images", False),
        )


class Tenant(NamedTuple):
    default_ob_config: ObConfiguration
    sk: SecretApiKey
    name: str
    auth_token: DashboardAuth
    # The rolebinding id for the authed user
    rolebinding_id: str


class BasicUser(NamedTuple):
    auth_token: str
    phone_number: str
    real_phone_number: str


class User(NamedTuple):
    auth_token: str
    fp_user_id: str
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
