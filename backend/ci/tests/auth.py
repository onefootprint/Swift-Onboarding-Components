class BaseAuth:
    HEADER_NAME: str = None

    def __init__(self, token):
        self.token = token
        assert self.HEADER_NAME, "Auth class doesn't have HEADER_NAME set"


class FpAuth(BaseAuth):
    HEADER_NAME = "x-fp-authorization"
    

class PublishableOnboardingKey(BaseAuth):
    HEADER_NAME = "X-Onboarding-Config-Key"

class OnboardingSessionToken(BaseAuth):
    HEADER_NAME = "X-Onboarding-Session-Token"


class TenantSecretAuth(BaseAuth):
    HEADER_NAME = "X-Footprint-Secret-Key"


class CustodianAuth(BaseAuth):
    HEADER_NAME = "x-footprint-custodian-key" 