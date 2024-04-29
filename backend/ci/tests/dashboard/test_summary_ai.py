import pytest
from tests.utils import post


@pytest.mark.skip(reason="expensive calls to openai")
def test_ai_summarize(sandbox_tenant, sandbox_user):
    body = post(
        f"entities/{sandbox_user.fp_id}/ai_summarize",
        None,
        *sandbox_tenant.db_auths,
    )
    assert body["detailed_summary"]
    print(body)
