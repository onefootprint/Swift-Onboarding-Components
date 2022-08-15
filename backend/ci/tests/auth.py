class BaseAuth:
    HEADER_NAME: str = None

    def __init__(self, token):
        self.token = token
        assert self.HEADER_NAME, "Auth class doesn't have HEADER_NAME set"


class OnboardingAuth(BaseAuth):
    HEADER_NAME = "x-fp-authorization"
    

class TenantAuth(BaseAuth):
    HEADER_NAME = "X-Onboarding-Config-Key"


class TenantSecretAuth(BaseAuth):
    HEADER_NAME = "x-client-secret-key"


class D2pAuth(BaseAuth):
    HEADER_NAME = "x-fp-authorization"


class My1fpAuth(BaseAuth):
    HEADER_NAME = "x-fp-authorization"


class CustodianAuth(BaseAuth):
    HEADER_NAME = "x-footprint-custodian-key" 