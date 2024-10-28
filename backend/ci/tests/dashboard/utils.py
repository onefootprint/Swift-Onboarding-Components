from tests.utils import get, patch


def latest_audit_event_for(fp_id, tenant):
    body = get("org/audit_events", dict(search=fp_id), *tenant.db_auths)
    audit_events = body["data"]
    return audit_events[0]


def has_audit_event_with_details(tenant, name, **kwargs):
    data = dict(names=[name])
    audit_events = get("org/audit_events", data, *tenant.db_auths)
    # ok to print, will only actually log if the test fails
    print(audit_events)
    filtered_events = [event for event in audit_events["data"] if event["name"] == name]
    return next(
        event
        for event in filtered_events
        if all(event["detail"]["data"].get(k, None) == v for (k, v) in kwargs.items())
    )


def update_rules(
    obc_id,
    expected_rule_set_version,
    *auths,
    add=None,
    delete=None,
    edit=None,
    status_code=200,
):
    body = dict(
        expected_rule_set_version=expected_rule_set_version,
        add=add,
        delete=delete,
        edit=edit,
    )
    return patch(
        f"/org/onboarding_configs/{obc_id}/rules",
        body,
        *auths,
        status_code=status_code,
    )
