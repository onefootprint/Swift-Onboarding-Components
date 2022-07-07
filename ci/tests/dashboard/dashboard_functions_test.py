

from urllib.parse import urlencode
import requests
import arrow
from tests.constants import FIELDS_TO_DECRYPT
from tests.utils import _client_priv_key_headers, _assert_response, url

    
def test_tenant_decrypt(request, workos_tenant):
    path = "org/decrypt"
    expected_data = dict(
        first_name="Flerp2",
        last_name="Derp2",
        email=request.config.cache.get("email", None),
        street_address="1 Footprint Way",
        zip="10009",
        country="USA",
        ssn=request.config.cache.get("ssn", None),
        last_four_ssn=request.config.cache.get("ssn", None)[-4:],
    )
    for attributes in FIELDS_TO_DECRYPT:
        data = {
            "footprint_user_id": request.config.cache.get("fp_user_id", None),
            "attributes": attributes,
            "reason": "Doing a hecking decrypt",
        }
        r = requests.post(
            url(path),
            headers=_client_priv_key_headers(workos_tenant["sk"]),
            json=data,
        )
        body = _assert_response(r)
        attributes = body["data"]
        for data_kind, value in attributes.items():
            assert expected_data[data_kind] == value
    
def test_onboardings_list(request, workos_tenant):
    # TODO don't filter on fp_user_id in this test. We only do it to ensure it doesn't flake in dev
    # https://linear.app/footprint/issue/FP-390/integration-tests-for-onboarding-list-break-in-dev
    old_fp_user_id = request.config.cache.get("fp_user_id", None)
    path = "org/onboardings?fp_user_id={old_fp_user_id}"
    r = requests.get(
        url(path),
        headers=_client_priv_key_headers(workos_tenant["sk"]),  
    )
    body = _assert_response(r)
    onboardings = body["data"]
    assert len(onboardings)
    assert onboardings[0]["footprint_user_id"] == old_fp_user_id
    assert set(["first_name", "last_name"]) < set(onboardings[0]["populated_data_kinds"])

def test_liveness_list(request, workos_tenant):
    old_fp_user_id = request.config.cache.get("fp_user_id", None)
    path = f"org/liveness?footprint_user_id={old_fp_user_id}"
    r = requests.get(
        url(path),
        headers=_client_priv_key_headers(workos_tenant["sk"]),
    )
    body = _assert_response(r)
    creds = body["data"]
    assert len(creds)
    assert creds[0]["insight_event"]

def test_access_events_list(request, workos_tenant):
    fp_user_id = request.config.cache.get("fp_user_id", None)
    path = f"org/access_events?footprint_user_id={fp_user_id}"
    r = requests.get(
        url(path),
        headers=_client_priv_key_headers(workos_tenant["sk"]),  
    )
    body = _assert_response(r)
    access_events = body["data"]
    assert len(access_events) == len(FIELDS_TO_DECRYPT)
    for i, expected_fields in enumerate(FIELDS_TO_DECRYPT[-1:0]):
        assert set(access_events[i]["data_kinds"]) == set(expected_fields)

    # Test filtering on kinds. We provide two different kinds, and we should get all access events
    # that contain at least one of these fields
    path = f"org/access_events?footprint_user_id={fp_user_id}&data_kinds=email,street_address"
    r = requests.get(
        url(path),
        headers=_client_priv_key_headers(workos_tenant["sk"]),
    )
    body = _assert_response(r)
    access_events = body["data"]
    assert len(access_events) == 2
    assert "email" in set(access_events[0]["data_kinds"])
    assert "street_address" in set(access_events[1]["data_kinds"])

    # Test filtering on timestamp - if we filter for events in the future, there shouldn't be any
    params = dict(
        timestamp_gte=arrow.utcnow().shift(days=1).isoformat()
    )
    path = f"org/access_events?{urlencode(params)}"
    r = requests.get(
        url(path),
        headers=_client_priv_key_headers(workos_tenant["sk"]),
    )
    body = _assert_response(r)
    assert not body["data"]