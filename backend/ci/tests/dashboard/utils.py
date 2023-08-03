from tests.utils import get


def latest_access_event_for(fp_id, tenant):
    body = get("org/access_events", dict(search=fp_id), *tenant.db_auths)
    access_events = body["data"]
    return access_events[0]
