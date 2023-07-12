from tests.utils import get


def latest_access_event_for(fp_id, sk):
    body = get(
        "org/access_events",
        dict(search=fp_id),
        sk.key,
    )
    access_events = body["data"]
    return access_events[0]
