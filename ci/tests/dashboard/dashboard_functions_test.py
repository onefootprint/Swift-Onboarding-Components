from urllib.parse import quote
import arrow
from tests.constants import EMAIL, FIELDS_TO_DECRYPT
from tests.utils import get, post


class TestDashboard:
    def test_tenant_decrypt(self, user):
        tenant = user.tenant
        expected_data = dict(
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            street_address=user.street_address,
            zip=user.zip,
            country=user.country,
            ssn=user.ssn,
            last_four_ssn=user.ssn[-4:],
        )
        for attributes in FIELDS_TO_DECRYPT:
            data = {
                "footprint_user_id": user.fp_user_id,
                "attributes": attributes,
                "reason": "Doing a hecking decrypt",
            }
            body = post("org/decrypt", data, tenant.sk)
            attributes = body["data"]
            for data_kind, value in attributes.items():
                assert expected_data[data_kind].upper() == value.upper()

    def test_tenant_decrypt_no_permissions(self, user):
        tenant = user.tenant
        data = {
            "footprint_user_id": user.fp_user_id,
            "attributes": ["city"],
            "reason": "Not doing a hecking decrypt",
        }
        post("org/decrypt", data, tenant.sk, status_code=401)
        
    def test_onboardings_list(self, user):
        tenant = user.tenant
        # TODO don't filter on fp_user_id in this test. We only do it to ensure it doesn't flake in dev
        # https://linear.app/footprint/issue/FP-390/integration-tests-for-onboarding-list-break-in-dev
        body = get("org/onboardings", dict(fp_user_id=user.fp_user_id), tenant.sk)
        onboardings = body["data"]
        print(onboardings)
        assert len(onboardings)
        assert onboardings[0]["footprint_user_id"] == user.fp_user_id
        assert set(["first_name", "last_name"]) < set(onboardings[0]["populated_data_kinds"])

    def test_liveness_list(self, user):
        tenant = user.tenant
        body = get("org/liveness", dict(footprint_user_id=user.fp_user_id), tenant.sk)
        creds = body["data"]
        assert len(creds)
        assert creds[0]["insight_event"]

    def test_access_events_list(self, user):
        tenant = user.tenant
        body = get("org/access_events", dict(footprint_user_id=user.fp_user_id), tenant.sk)
        access_events = body["data"]
        assert len(access_events) == len(FIELDS_TO_DECRYPT)
        for i, expected_fields in enumerate(FIELDS_TO_DECRYPT[-1:0]):
            assert set(access_events[i]["data_kinds"]) == set(expected_fields)

        # Test filtering on kinds. We provide two different kinds, and we should get all access events
        # that contain at least one of these fields
        # https://linear.app/footprint/issue/FP-641/fix-test-for-access-events-querystring
        # TODO we should be able to pass this as a dict. I think the server is expecting the
        # querystring to not be urlencoded
        params = f"footprint_user_id={user.fp_user_id}&data_kinds=email,street_address"
        body = get("org/access_events", params, tenant.sk)
        access_events = body["data"]
        assert len(access_events) == 2
        assert "email" in set(access_events[0]["data_kinds"])
        assert "street_address" in set(access_events[1]["data_kinds"])

        # Test filtering on timestamp - if we filter for events in the future, there shouldn't be any
        params = dict(
            timestamp_gte=arrow.utcnow().shift(days=1).isoformat()
        )
        body = get("org/access_events", params, tenant.sk)
        assert not body["data"]