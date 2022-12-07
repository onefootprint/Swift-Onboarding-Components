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


class GetObConfigError(Exception):
    pass
class Tenant(NamedTuple):
    ob_configs: dict
    sk: SecretApiKey
    auth_token: DashboardAuth

    def ob_config(self, name=None):
        if name:
            return self.ob_configs[name]
        configs = list(self.ob_configs.keys())
        if len(configs) == 1:
            return self.ob_configs[configs[0]]
        else:
            raise GetObConfigError(f"There are {len(configs)} defined for this Tenant. Please specify which one you want!")


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
    city: str
    state: str
    country: str
    ssn: str
    phone_number: str
    real_phone_number: str
    email: str
    tenant: Tenant

    def identity_data(self): 
        return {
        "name": {
            "first_name": self.first_name,
            "last_name": self.last_name,
        },
        # todo
        # "dob": None,
        "address": {
            "line1": self.address_line1,
            "line2": self.address_line2,
            "city": self.city,
            "state": self.state,
            "zip": self.zip,
            "country": self.country,
        },
        "ssn9": self.ssn,
    }

    # Represents the challenged user, the base user construct 
    # that becomes an onboarded User once information is supplied
    # for a given onboarding config
    def basic_user(self):
        return BasicUser(
            auth_token=self.auth_token,
            phone_number=self.phone_number,
            real_phone_number=self.real_phone_number,
            email=self.email,
        )
