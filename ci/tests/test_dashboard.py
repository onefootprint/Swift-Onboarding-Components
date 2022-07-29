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
        
    def test_scoped_users_list(self, user):
        tenant = user.tenant
        # TODO don't filter on fp_user_id in this test. We only do it to ensure it doesn't flake in dev
        # https://linear.app/footprint/issue/FP-390/integration-tests-for-onboarding-list-break-in-dev
        body = get("org/scoped_users", dict(fp_user_id=user.fp_user_id), tenant.sk)
        scoped_users = body["data"]
        assert len(scoped_users)
        assert scoped_users[0]["footprint_user_id"] == user.fp_user_id
        assert set(["first_name", "last_name"]) < set(scoped_users[0]["populated_data_kinds"])

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
        params = dict(footprint_user_id=user.fp_user_id, data_kinds=",".join(["email", "street_address"]))
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

    def test_config_list(self, workos_sandbox_tenant):
        body = get("org/onboarding_configs", None, workos_sandbox_tenant.sk)
        configs = body["data"]
        # TODO better tests when we aren't making a new config for every request
        config = configs[0]
        assert config["key"]
        assert config["name"]
        assert config["must_collect_data_kinds"]
        assert config["can_access_data_kinds"]
        assert config["created_at"]
        assert config["status"]