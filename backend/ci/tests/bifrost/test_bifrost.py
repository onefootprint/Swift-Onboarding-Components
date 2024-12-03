from tests.bifrost_client import BifrostClient


def test_basic_bifrost(sandbox_tenant):
    obc = sandbox_tenant.default_ob_config
    bifrost = BifrostClient.new_user(obc)
    user = bifrost.run()
    # These should be ordered
    assert [i["kind"] for i in bifrost.handled_requirements] == [
        "collect_data",
        "liveness",
        "process",
    ]

    # If we re-onboard onto the same playbook, should no-op
    bifrost = BifrostClient.login_user(obc, bifrost.sandbox_id)
    body = bifrost.get_status()
    assert not body["can_update_user_data"]
    assert all(i["is_met"] for i in body["all_requirements"])
    # Not by design, just asserting implementation detail
    assert [i["kind"] for i in body["all_requirements"]] == ["authorize"]

    user2 = bifrost.run()

    assert user2.fp_id == user.fp_id
