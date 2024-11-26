from tests.utils import get, patch, post, _gen_random_n_digit_number


def latest_audit_event_for(fp_id, tenant):
    body = get("org/audit_events", dict(search=fp_id), *tenant.db_auths)
    audit_events = body["data"]
    return audit_events[0]


def list_audit_events_with_details(tenant, name, **kwargs):
    data = dict(names=[name])
    audit_events = get("org/audit_events?page_size=100", data, *tenant.db_auths)
    for event in audit_events["data"]:
        matches = True
        for key, value in kwargs.items():
            if isinstance(value, dict):
                # Handle nested dictionary matching
                event_value = event["detail"]["data"].get(key)
                if not event_value or not isinstance(event_value, dict):
                    matches = False
                    break
                # Check all nested key/values match
                for nested_key, nested_value in value.items():
                    if event_value.get(nested_key) != nested_value:
                        matches = False
                        break
            else:
                # Handle flat key/value matching
                if event["detail"]["data"].get(key) != value:
                    matches = False
                    break
        if matches:
            yield event


def get_audit_event_with_details(tenant, name, **kwargs):
    return next(list_audit_events_with_details(tenant, name, **kwargs), None)


def assert_has_audit_event_with_details(tenant, name, **kwargs):
    event = get_audit_event_with_details(tenant, name, **kwargs)
    assert (
        event
    ), f"Expected to find audit event with name={name} and details={kwargs} but found none"


def generate_role(tenant, scopes, kind="api_key"):
    """Create a role with given scopes and kind for testing purposes"""
    suffix = _gen_random_n_digit_number(10)
    return post(
        "org/roles",
        dict(name=f"Test role {suffix}", scopes=scopes, kind=kind),
        *tenant.db_auths,
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
