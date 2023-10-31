from tests.utils import get, post


def test_match_signals(sandbox_user, sandbox_tenant):
    body = get(
        f"/users/{sandbox_user.fp_id}/match_signals", None, sandbox_tenant.sk.key
    )
    assert "name" in body
    assert "email" in body


def test_liveness(sandbox_user, sandbox_tenant):
    get(f"/users/{sandbox_user.fp_id}/liveness", None, sandbox_tenant.sk.key)


def test_auth_events(sandbox_user, sandbox_tenant):
    body = get(f"/users/{sandbox_user.fp_id}/auth_events", None, sandbox_tenant.sk.key)
    assert any(i["kind"] == "sms" for i in body["data"])
    assert any(i["kind"] == "passkey" for i in body["data"])


def test_risk_signals(sandbox_user, sandbox_tenant):
    body = get(f"/users/{sandbox_user.fp_id}/risk_signals", None, sandbox_tenant.sk.key)
    print(body)
    assert all(i["reason_code"] for i in body)


def test_decision(sandbox_user, sandbox_tenant):
    data = dict(status="fail", annotation="Flerp")
    post(f"/users/{sandbox_user.fp_id}/decisions", data, sandbox_tenant.sk.key)
    body = get(f"/users/{sandbox_user.fp_id}", None, sandbox_tenant.sk.key)
    assert body["status"] == "fail"
