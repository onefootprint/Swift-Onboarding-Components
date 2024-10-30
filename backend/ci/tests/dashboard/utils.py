from tests.utils import get, patch


def latest_audit_event_for(fp_id, tenant):
    body = get("org/audit_events", dict(search=fp_id), *tenant.db_auths)
    audit_events = body["data"]
    return audit_events[0]


def get_audit_event_with_details(tenant, name, **kwargs):
    data = dict(names=[name])
    audit_events = get("org/audit_events", data, *tenant.db_auths)
    for event in audit_events["data"]:
        if all(event["detail"]["data"].get(k, None) == v for (k, v) in kwargs.items()):
            return event
    return None


def assert_has_audit_event_with_details(tenant, name, **kwargs):
    event = get_audit_event_with_details(tenant, name, **kwargs)
    assert (
        event
    ), f"Expected to find audit event with name={name} and details={kwargs} but found none"


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
