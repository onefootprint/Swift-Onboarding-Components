from tests.utils import get, patch


def latest_access_event_for(fp_id, tenant):
    body = get("org/access_events", dict(search=fp_id), *tenant.db_auths)
    access_events = body["data"]
    return access_events[0]


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
