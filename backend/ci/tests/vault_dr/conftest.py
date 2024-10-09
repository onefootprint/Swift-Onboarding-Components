import pytest
from tests.vault_dr.utils import ensure_enrolled_in_live_vdr


@pytest.fixture(scope="session")
def tenant_and_live_vdr_cfg(tenant):
    cfg = ensure_enrolled_in_live_vdr(tenant)
    return (tenant, cfg)
