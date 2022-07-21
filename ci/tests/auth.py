class BaseAuth:
    HEADER_NAME: str = None

    def __init__(self, token):
        self.token = token
        assert self.HEADER_NAME, "Auth class doesn't have HEADER_NAME set"


class OnboardingAuth(BaseAuth):
    HEADER_NAME = "x-fpuser-authorization"
    
class TenantAuth(BaseAuth):
    HEADER_NAME = "x-client-public-key"


class TenantSecretAuth(BaseAuth):
    HEADER_NAME = "x-client-secret-key"


class D2pAuth(BaseAuth):
    HEADER_NAME = "x-d2p-authorization"


class My1fpAuth(BaseAuth):
    HEADER_NAME = "x-my1fp-authorization"

class CustodianAuth(BaseAuth):
    HEADER_NAME = "x-footprint-custodian-key" 