import arrow
import pytest
from urllib.parse import quote
from typing import NamedTuple
from tests.constants import EMAIL, FIELDS_TO_DECRYPT
from tests.utils import get, put, post, patch, _gen_random_ssn
from tests.types import SecretApiKey, ObConfiguration
from .auth import (
    PublishableOnboardingKey,
    DashboardAuthIsLive,
)


@pytest.fixture(scope="session")
def secret_key(workos_sandbox_tenant):
    data = dict(name="Test secret key")
    body = post("org/api_keys", data, workos_sandbox_tenant.sk.key)
    return SecretApiKey.from_response(body)


@pytest.fixture(scope="session")
def ob_configuration(workos_sandbox_tenant, must_collect_data, can_access_data):
    data = dict(
        name="Test OB config",
        must_collect_data=must_collect_data,
        can_access_data=can_access_data,
    )
    body = post("org/onboarding_configs", data, workos_sandbox_tenant.sk.key)
    return ObConfiguration.from_response(body)


class TestDashboardOnboardings:
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
                "fields": attributes,
                "reason": "Doing a hecking decrypt",
            }
            body = post(
                f"users/{user.fp_user_id}/vault/identity/decrypt", data, tenant.sk.key
            )
            attributes = body
            for attribute, value in attributes.items():
                assert expected_data[attribute] == value

    def test_tenant_decrypt_no_permissions(self, user):
        tenant = user.tenant
        data = {
            "fields": ["dob"],
            "reason": "Not doing a hecking decrypt",
        }
        post(
            f"users/{user.fp_user_id}/vault/identity/decrypt",
            data,
            tenant.sk.key,
            status_code=401,
        )

    def test_get_org(self, user):
        body = get("org", None, user.tenant.sk.key)
        tenant = body
        assert tenant["name"] == "Acme Bank"
        assert not tenant["is_sandbox_restricted"]
        tenant["logo_url"]

    def test_get_users_list(self, user):
        tenant = user.tenant
        # TODO don't filter on fp_user_id in this test. We only do it to ensure it doesn't flake in dev
        # https://linear.app/footprint/issue/FP-390/integration-tests-for-onboarding-list-break-in-dev
        body = get("users", dict(fp_user_id=user.fp_user_id), tenant.sk.key)
        scoped_users = body["data"]
        assert len(scoped_users)

        scoped_user = list(filter(lambda su: su["id"] == user.fp_user_id, scoped_users))
        assert len(scoped_user) == 1

        assert set(["first_name", "last_name"]) < set(
            scoped_user[0]["identity_data_attributes"]
        )

    def test_get_users_detail(self, user):
        tenant = user.tenant
        scoped_user = get(f"users/{user.fp_user_id}", None, tenant.sk.key)
        assert set(["first_name", "last_name"]) < set(
            scoped_user["identity_data_attributes"]
        )

    def test_liveness_list(self, user):
        tenant = user.tenant
        print(user.fp_user_id)
        body = get(f"users/{user.fp_user_id}/liveness", None, tenant.sk.key)
        creds = body
        assert len(creds)
        assert creds[0]["insight_event"]

    def test_access_events_list(self, user):
        tenant = user.tenant
        body = get(
            "org/access_events",
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
        body = get("org/access_events", params, tenant.sk.key)
        access_events = body["data"]
        assert len(access_events) == 2
        assert "identity.email" in set(access_events[0]["targets"])
        assert "identity.address_line1" in set(access_events[1]["targets"])

        # Test filtering on timestamp - if we filter for events in the future, there shouldn't be any
        params = dict(timestamp_gte=arrow.utcnow().shift(days=1).isoformat())
        body = get("org/access_events", params, tenant.sk.key)
        assert not body["data"]

    def test_portable_failed_data_write(self, user):
        data = dict(reason="test", fields=["first_name", "ssn9"])
        body = post(
            f"users/{user.fp_user_id}/vault/identity/decrypt", data, user.tenant.sk.key
        )
        print(body)
        assert body["first_name"]

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
            f"users/{user.fp_user_id}/vault/identity",
            data,
            user.tenant.sk.key,
            status_code=401,
        )

    def test_override_onboarding_decision(self, user):
        tenant = user.tenant

        # TODO This will get simpler with the onboarding-scoped dashboard
        scoped_user = get(f"users/{user.fp_user_id}", None, tenant.sk.key)
        onboarding = scoped_user["onboarding"]
        assert onboarding["status"] == "pass"
        latest_decision = onboarding["latest_decision"]
        assert latest_decision["status"] == onboarding["status"]
        assert latest_decision["source"]["kind"] == "footprint"

        test_note = "This is a test note. Flerp derp"
        decision_data = dict(
            annotation=dict(note=test_note, is_pinned=True),
            status="fail",
        )
        post(
            f"users/{user.fp_user_id}/decisions",
            decision_data,
            tenant.auth_token,
            DashboardAuthIsLive("false"),
        )

        scoped_user = get(f"users/{user.fp_user_id}", None, tenant.sk.key)
        onboarding = scoped_user["onboarding"]
        assert onboarding["status"] == "fail"
        # Assert the latest decision is a manual decision
        latest_decision = onboarding["latest_decision"]
        assert latest_decision["status"] == onboarding["status"]
        assert latest_decision["source"]["kind"] == "organization"
        assert "@onefootprint.com" in latest_decision["source"]["member"]

        # Assert that the annotation is pinned
        pinned_annotations = get(
            f"users/{user.fp_user_id}/annotations",
            dict(is_pinned="true"),
            tenant.sk.key,
        )
        annotation = pinned_annotations[0]
        assert annotation["is_pinned"]
        assert annotation["note"] == test_note
        assert "@onefootprint.com" in annotation["source"]["member"]


class TestDashboardObConfigs:
    def test_config_list(self, workos_sandbox_tenant, ob_configuration):
        body = get("org/onboarding_configs", None, workos_sandbox_tenant.sk.key)
        config = next(
            config for config in body["data"] if config["id"] == ob_configuration.id
        )
        assert config["key"] == ob_configuration.key.value
        assert config["name"] == ob_configuration.name
        assert config["must_collect_data"] == ob_configuration.must_collect_data
        assert config["can_access_data"] == ob_configuration.can_access_data
        assert config["status"] == ob_configuration.status
        assert config["created_at"]

    def test_config_create(self, workos_sandbox_tenant, basic_user):
        data = dict(
            name="Acme Bank Loan",
            must_collect_data=["ssn4", "phone_number", "email", "name", "full_address"],
            can_access_data=["ssn4", "phone_number", "email", "name", "full_address"],
        )
        body = post("org/onboarding_configs", data, workos_sandbox_tenant.sk.key)
        ob_config = body
        ob_config_key = PublishableOnboardingKey(ob_config["key"])

        post("hosted/onboarding", None, basic_user.auth_token, ob_config_key)

    @pytest.mark.parametrize(
        "must_collect,can_access,expected_status",
        [
            (["ssn4", "name", "full_address", "email", "phone_number"], [], 200),
            (
                ["ssn4", "ssn9", "name", "full_address", "email", "phone_number"],
                [],
                400,
            ),
            (
                ["full_address", "partial_address", "name", "email", "phone_number"],
                [],
                400,
            ),
            (
                ["name", "email", "phone_number", "full_address"],
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
        ob_config = body
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


class TestDashboardApiKeys:
    def test_api_key_check(self, secret_key):
        body = get("org/api_keys/check", None, secret_key.key)
        assert body["id"] == secret_key.id

    def test_api_key_list(self, secret_key):
        body = get("org/api_keys", None, secret_key.key)
        key = next(key for key in body["data"] if key["id"] == secret_key.id)
        assert key["name"] == secret_key.name
        assert key["status"] == secret_key.status
        assert key["created_at"]
        assert "key" not in key
        assert key["last_used_at"]

    def test_api_key_reveal(self, secret_key):
        body = get(f"org/api_keys/{secret_key.id}/reveal", None, secret_key.key)
        key = body
        assert key["key"] == secret_key.key.value
        assert key["status"] == "enabled"
        assert key["name"] == "Test secret key"

    def test_api_key_update(self, workos_sandbox_tenant, secret_key):
        # Test failing to update
        new_name = "Updated secret key name"
        data = dict(name=new_name, status="disabled")
        patch(f"org/api_keys/flerpderp", data, secret_key.key, status_code=404)

        # Update the name and status
        body = patch(f"org/api_keys/{secret_key.id}", data, secret_key.key)
        key = body
        assert key["name"] == new_name
        assert key["status"] == "disabled"

        # Verify the update, using the reveal endpoint as the detail endpoint
        body = get(
            f"org/api_keys/{secret_key.id}/reveal", None, workos_sandbox_tenant.sk.key
        )
        assert body["name"] == new_name
        assert body["status"] == "disabled"

        # Verify we can't use the disabled API key for anything anymore
        get(
            f"org/api_keys/{secret_key.id}/reveal",
            None,
            secret_key.key,
            status_code=401,
        )


@pytest.fixture(scope="session")
def limited_role(workos_sandbox_tenant):
    role_data = dict(
        name="Test limited role",
        permissions=[dict(kind="users"), dict(kind="security_logs")],
    )
    body = post("org/roles", role_data, workos_sandbox_tenant.auth_token)
    assert body["name"] == role_data["name"]
    assert set(i["kind"] for i in body["permissions"]) == set(
        i["kind"] for i in role_data["permissions"]
    )
    return body


@pytest.fixture(scope="session")
def admin_role(workos_sandbox_tenant):
    body = get("org/roles", None, workos_sandbox_tenant.auth_token)
    roles = body["data"]
    return next(i for i in roles if i["permissions"][0]["kind"] == "admin")


@pytest.fixture(scope="session")
def tenant_user(workos_sandbox_tenant, admin_role):
    user_data = dict(
        email="integrationtest+1@onefootprint.com",
        role_id=admin_role["id"],
        redirect_url="http://localhost:3001/auth",
    )
    body = post("org/members", user_data, workos_sandbox_tenant.auth_token)
    assert not body["last_login_at"]
    assert body["role_id"] == admin_role["id"]
    return body


class TestDashboardAdminUsers:
    def test_update_roles(self, workos_sandbox_tenant, limited_role, admin_role):
        role_id = limited_role["id"]
        patch_data = dict(
            name="New role name", permissions=[{"kind": "onboarding_configuration"}]
        )
        patch(f"org/roles/{role_id}", patch_data, workos_sandbox_tenant.auth_token)

        body = get("org/roles", None, workos_sandbox_tenant.auth_token)
        role_ids = set(r["id"] for r in body["data"])
        assert role_id in role_ids
        assert admin_role["id"] in role_ids
        role = next(r for r in body["data"] if r["id"] == role_id)
        assert role["name"] == patch_data["name"]
        assert set(i["kind"] for i in role["permissions"]) == set(
            i["kind"] for i in patch_data["permissions"]
        )

    def test_update_user_role(self, workos_sandbox_tenant, tenant_user, limited_role):
        user_id = tenant_user["id"]
        user_data = dict(role_id=limited_role["id"])
        patch(f"org/members/{user_id}", user_data, workos_sandbox_tenant.auth_token)

        body = get(f"org/members", None, workos_sandbox_tenant.auth_token)
        user = next(u for u in body["data"] if u["id"] == user_id)
        assert user["role_id"] == limited_role["id"]

    def test_deactivate_role_and_user(
        self, workos_sandbox_tenant, tenant_user, limited_role
    ):
        role_id = limited_role["id"]
        user_id = tenant_user["id"]
        # Make sure the tenant_user is using the limited role
        user_data = dict(role_id=limited_role["id"])
        patch(f"org/members/{user_id}", user_data, workos_sandbox_tenant.auth_token)

        # Can't deactivate role that has activate users
        post(
            f"org/roles/{role_id}/deactivate",
            None,
            workos_sandbox_tenant.auth_token,
            status_code=400,
        )

        # So we deactivate the user
        post(
            f"org/members/{user_id}/deactivate", None, workos_sandbox_tenant.auth_token
        )

        # And now we can deactivate it
        post(f"org/roles/{role_id}/deactivate", None, workos_sandbox_tenant.auth_token)

        # Make sure the deactivated user isn't displayed anymore
        body = get("org/members", None, workos_sandbox_tenant.auth_token)
        assert user_id not in set(u["id"] for u in body["data"])

        # Make sure the deactivated role isn't displayed anymore
        body = get("org/roles", None, workos_sandbox_tenant.auth_token)
        assert role_id not in set(u["id"] for u in body["data"])
