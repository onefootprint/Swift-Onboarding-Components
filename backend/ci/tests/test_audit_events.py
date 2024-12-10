from tests.utils import (
    get,
    post,
)


def test_audit_events(sandbox_user):
    tenant = sandbox_user.tenant

    # Create some audit events
    num_events = 5
    exp_reasons = []
    for i in range(num_events):
        reason = f"reason {i}"
        data = {
            "fields": ["id.last_name", "id.ssn9"],
            "reason": reason,
        }
        exp_reasons.append(reason)
        body = post(
            f"entities/{sandbox_user.fp_id}/vault/decrypt",
            data,
            tenant.sk.key,
        )
        attributes = body
        for di, value in attributes.items():
            assert sandbox_user.client.decrypted_data[di] == value

    # Make sure we get back all the audit events when we paginate through all results.
    exp_num_results_by_page = [num_events - 2, 2]
    cursor = None
    got_timestamps = []
    got_reasons = []
    for exp_num_results in exp_num_results_by_page:
        resp = get(
            f"org/audit_events",
            {
                "names": "decrypt_user_data",
                "page_size": num_events - 2,
                "search": sandbox_user.fp_id,
                "cursor": cursor,
            },
            *tenant.db_auths,
        )
        assert len(resp["data"]) == exp_num_results

        cursor = resp["meta"]["next"]
        for event in resp["data"]:
            assert event["name"] == "decrypt_user_data"
            got_timestamps.append(event["timestamp"])
            got_reasons.append(event["detail"]["data"]["reason"])

    assert len(got_timestamps) == num_events
    assert sorted(got_reasons) == sorted(exp_reasons)
    assert got_timestamps == sorted(got_timestamps, reverse=True)
