import arrow
import pytest
from urllib.parse import quote
from typing import NamedTuple
from tests.constants import EMAIL, FIELDS_TO_DECRYPT
from tests.utils import get, put, post, patch, _gen_random_ssn
from tests.types import SecretApiKey, ObConfiguration
from .auth import (
    TenantAuth,
)


@pytest.fixture(scope="session")
def secret_key(workos_sandbox_tenant):
    data = dict(name="Test secret key")
    body = post("org/api_keys", data, workos_sandbox_tenant.sk.key)
    return SecretApiKey.from_response(body["data"])


@pytest.fixture(scope="session")
def ob_configuration(workos_sandbox_tenant, must_collect_data, can_access_data):
    data = dict(
        name="Test OB config",
        must_collect_data=must_collect_data,
        can_access_data=can_access_data,
    )
    body = post("org/onboarding_configs", data, workos_sandbox_tenant.sk.key)
    return ObConfiguration.from_response(body["data"])


class TestDashboard:
    def test_tenant_decrypt(self, user):
        tenant = user.tenant
        expected_data = dict(
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            address_line1=user.address_line1,
            address_line2=user.address_line2,
            zip=user.zip,
            country=user.country,
            ssn9=user.ssn,
            ssn4=user.ssn[-4:],
        )
        for attributes in FIELDS_TO_DECRYPT:
            data = {
                "footprint_user_id": user.fp_user_id,
                "attributes": attributes,
                "reason": "Doing a hecking decrypt",
            }
            body = post("users/decrypt", data, tenant.sk.key)
            attributes = body["data"]
            for attribute, value in attributes.items():
                assert expected_data[attribute].upper() == value.upper()

    def test_tenant_decrypt_no_permissions(self, user):
        tenant = user.tenant
        data = {
            "footprint_user_id": user.fp_user_id,
            "attributes": ["dob"],
            "reason": "Not doing a hecking decrypt",
        }
        post("users/decrypt", data, tenant.sk.key, status_code=401)

    def test_get_org(self, user):
        body = get("org", None, user.tenant.sk.key)
        tenant = body["data"]
        assert tenant["name"] == "Acme Bank"
        assert not tenant["is_sandbox_restricted"]
        tenant["logo_url"]

    def test_scoped_users_list(self, user):
        tenant = user.tenant
        # TODO don't filter on fp_user_id in this test. We only do it to ensure it doesn't flake in dev
        # https://linear.app/footprint/issue/FP-390/integration-tests-for-onboarding-list-break-in-dev
        body = get("users", dict(fp_user_id=user.fp_user_id), tenant.sk.key)
        scoped_users = body["data"]
        assert len(scoped_users)
        assert scoped_users[0]["footprint_user_id"] == user.fp_user_id
        assert set(["first_name", "last_name"]) < set(
            scoped_users[0]["populated_data_kinds"]
        )

    def test_liveness_list(self, user):
        tenant = user.tenant
        body = get(
            "users/liveness", dict(footprint_user_id=user.fp_user_id), tenant.sk.key
        )
        creds = body["data"]
        assert len(creds)
        assert creds[0]["insight_event"]

    def test_access_events_list(self, user):
        tenant = user.tenant
        body = get(
            "users/access_events",
            dict(footprint_user_id=user.fp_user_id),
            tenant.sk.key,
        )
        access_events = body["data"]
        assert len(access_events) == len(FIELDS_TO_DECRYPT)
        for i, expected_fields in enumerate(FIELDS_TO_DECRYPT[-1:0]):
            expected_targets = [f"identity.{k}" for k in expected_fields]
            access_events[i]["kind"] == "decrypt"
            assert set(access_events[i]["targets"]) == set(expected_targets)

        # Test filtering on kinds. We provide two different kinds, and we should get all access events
        # that contain at least one of these fields
        params = dict(
            footprint_user_id=user.fp_user_id,
            targets=",".join(["identity.email", "identity.address_line1"]),
            kind="decrypt",
        )
        body = get("users/access_events", params, tenant.sk.key)
        access_events = body["data"]
        assert len(access_events) == 2
        assert "identity.email" in set(access_events[0]["targets"])
        assert "identity.address_line1" in set(access_events[1]["targets"])

        # Test filtering on timestamp - if we filter for events in the future, there shouldn't be any
        params = dict(timestamp_gte=arrow.utcnow().shift(days=1).isoformat())
        body = get("users/access_events", params, tenant.sk.key)
        assert not body["data"]

    def test_config_list(self, workos_sandbox_tenant, ob_configuration):
        body = get("org/onboarding_configs", None, workos_sandbox_tenant.sk.key)
        config = next(
            config for config in body["data"] if config["id"] == ob_configuration.id
        )
        assert config["key"] == ob_configuration.key.token
        assert config["name"] == ob_configuration.name
        assert config["must_collect_data"] == ob_configuration.must_collect_data
        assert config["can_access_data"] == ob_configuration.can_access_data
        assert config["status"] == ob_configuration.status
        assert config["created_at"]

    def test_config_create(self, workos_sandbox_tenant, basic_user):
        data = dict(
            name="Acme Bank Loan",
            must_collect_data=["ssn4"],
            can_access_data=["ssn4"],
        )
        body = post("org/onboarding_configs", data, workos_sandbox_tenant.sk.key)
        ob_config = body["data"]
        ob_config_key = TenantAuth(ob_config["key"])

        body = post("hosted/onboarding", None, basic_user.auth_token, ob_config_key)
        assert body["data"]["missing_attributes"] == ["ssn4"]

    @pytest.mark.parametrize(
        "must_collect,can_access,expected_status",
        [
            (["ssn4", "partial_address", "name"], [], 200),
            (["ssn4", "ssn9"], [], 400),
            (["full_address", "partial_address"], [], 400),
            (
                ["first_name", "last_name"],
                ["ssn9"],
                400,
            ),  # can_access must be < must_collect
        ],
    )
    def test_config_create_validation(
        self, workos_sandbox_tenant, must_collect, can_access, expected_status
    ):
        # Test validation errors
        data = dict(
            name="Acme Bank Loan",
            must_collect_data=must_collect,
            can_access_data=can_access,
        )
        post(
            "org/onboarding_configs",
            data,
            workos_sandbox_tenant.sk.key,
            status_code=expected_status,
        )

    def test_config_update(self, workos_sandbox_tenant, ob_configuration):
        # Test failing to update
        new_name = "Updated ob config name"
        new_status = "disabled"
        data = dict(name=new_name, status=new_status)
        patch(
            f"org/onboarding_configs/flerpderp",
            data,
            workos_sandbox_tenant.sk.key,
            status_code=404,
        )

        # Update the name and status
        body = patch(
            f"org/onboarding_configs/{ob_configuration.id}",
            data,
            workos_sandbox_tenant.sk.key,
        )
        ob_config = body["data"]
        assert ob_config["name"] == new_name
        assert ob_config["status"] == new_status

        # Verify the update
        body = get(f"org/onboarding_configs", None, workos_sandbox_tenant.sk.key)
        configs = body["data"]
        ob_config = next(i for i in configs if i["id"] == ob_configuration.id)
        assert ob_config["name"] == new_name
        assert ob_config["status"] == new_status

        # Verify we can't use the disabled ob config for anything anymore
        get("org/onboarding_config", None, ob_configuration.key, status_code=401)

    def test_api_key_check(self, secret_key):
        body = get("org/api_keys/check", None, secret_key.key)
        assert body["data"]["id"] == secret_key.id

    def test_api_key_list(self, secret_key):
        body = get("org/api_keys", None, secret_key.key)
        key = next(key for key in body["data"] if key["id"] == secret_key.id)
        assert key["name"] == secret_key.name
        assert key["status"] == secret_key.status
        assert key["created_at"]
        assert not key["key"]
        assert key["last_used_at"]

    def test_api_key_reveal(self, secret_key):
        body = get(f"org/api_keys/{secret_key.id}/reveal", None, secret_key.key)
        key = body["data"]
        assert key["key"] == secret_key.key.token
        assert key["status"] == "enabled"
        assert key["name"] == "Test secret key"

    def test_api_key_update(self, workos_sandbox_tenant, secret_key):
        # Test failing to update
        new_name = "Updated secret key name"
        data = dict(name=new_name, status="disabled")
        patch(f"org/api_keys/flerpderp", data, secret_key.key, status_code=404)

        # Update the name and status
        body = patch(f"org/api_keys/{secret_key.id}", data, secret_key.key)
        key = body["data"]
        assert key["name"] == new_name
        assert key["status"] == "disabled"

        # Verify the update, using the reveal endpoint as the detail endpoint
        body = get(
            f"org/api_keys/{secret_key.id}/reveal", None, workos_sandbox_tenant.sk.key
        )
        assert body["data"]["name"] == new_name
        assert body["data"]["status"] == "disabled"

        # Verify we can't use the disabled API key for anything anymore
        get(
            f"org/api_keys/{secret_key.id}/reveal",
            None,
            secret_key.key,
            status_code=401,
        )

    def test_portable_failed_data_write(self, user):
        data = dict(reason="test", fields=["first_name", "ssn9"])
        body = post(
            f"users/{user.fp_user_id}/identity/decrypt", data, user.tenant.sk.key
        )
        print(body)
        assert body["data"]["first_name"]

        data = {
            "dob": {
                "month": 1,
                "day": 1,
                "year": 1970,
            },
            "ssn9": _gen_random_ssn(),
        }

        # ensure we cannot change data in a portable vault
        put(
            f"users/{user.fp_user_id}/identity",
            data,
            user.tenant.sk.key,
            status_code=401,
        )
