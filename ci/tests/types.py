from typing import NamedTuple
from tests.auth import TenantAuth, TenantSecretAuth

class Tenant(NamedTuple):
    pk: TenantAuth
    sk: TenantSecretAuth
    configuration_id: str


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