import pytest
from tests.utils import (
    get,
    post,
    patch,
    delete,
)


def test_tenant_ios_app_meta(sandbox_tenant):
    # Create some tenant app metadata entries.
    fixtures = [
        (
            "team1",
            ["com.example.app1", "com.example.app2"],
            "id1",
            "key1",
        ),
        (
            "team2",
            ["com.example.app3"],
            "id2",
            "key2",
        ),
        (
            "team3",
            [],
            "id3",
            "key3",
        ),
    ]

    meta_ids = []
    for (
        team_id,
        app_bundle_ids,
        device_check_key_id,
        device_check_private_key,
    ) in fixtures:
        # Ensure read-only creds are blocked for creation.
        post(
            "/org/app_meta/ios",
            {
                "team_id": team_id,
                "app_bundle_ids": app_bundle_ids,
                "device_check_key_id": device_check_key_id,
                "device_check_private_key": device_check_private_key,
            },
            *sandbox_tenant.ro_db_auths,
            status_code=403,
        )

        # Make sure we can create using correctly permissioned creds
        body = post(
            "/org/app_meta/ios",
            {
                "team_id": team_id,
                "app_bundle_ids": app_bundle_ids,
                "device_check_key_id": device_check_key_id,
                "device_check_private_key": device_check_private_key,
            },
            *sandbox_tenant.db_auths,
        )
        assert body["team_id"] == team_id
        assert body["app_bundle_ids"] == app_bundle_ids
        assert body["device_check_key_id"] == device_check_key_id
        assert body["device_check_private_key"] == device_check_private_key
        meta_ids.append(body["id"])

    # List the tenant app meta entries we created.
    body = get(f"/org/app_meta/ios", None, *sandbox_tenant.ro_db_auths)

    # Make sure we don't reveal the secret keys in the get request
    for meta_body in body:
        assert meta_body["device_check_private_key"] == None
    got_ids = [entry["id"] for entry in body]

    # Don't compare creation time ordering as that may be flaky.
    assert set(meta_ids).issubset(set(got_ids))

    # Test failing to update meta for invalid meta id
    new_team_id = "team9"
    new_app_bundle_ids = ["com.example.app8", "com.example.app9"]
    new_device_check_key_id = "id9"
    new_device_check_private_key = "key9"
    data = dict(
        team_id=new_team_id,
        app_bundle_ids=new_app_bundle_ids,
        device_check_key_id=new_device_check_key_id,
        device_check_private_key=new_device_check_private_key,
    )
    patch(f"org/app_meta/ios/flerp", data, *sandbox_tenant.db_auths, status_code=404)

    # Update all the fields
    body = patch(f"org/app_meta/ios/{meta_ids[0]}", data, *sandbox_tenant.db_auths)
    key = body
    assert key["id"] == meta_ids[0]
    assert key["tenant_id"] == sandbox_tenant.id
    assert key["team_id"] == new_team_id
    assert key["app_bundle_ids"] == new_app_bundle_ids
    assert key["device_check_key_id"] == new_device_check_key_id
    assert key["device_check_private_key"] == new_device_check_private_key

    # Test reveal
    body = post(
        f"/org/app_meta/ios/{meta_ids[0]}/reveal", None, *sandbox_tenant.db_auths
    )
    assert body["device_check_private_key"] == new_device_check_private_key

    # Attempting to delete fails for read-only creds.
    for meta_id in meta_ids:
        delete(
            f"/org/app_meta/ios/{meta_id}",
            None,
            *sandbox_tenant.ro_db_auths,
            status_code=403,
        )

    # Delete the tenant app meta entries we created.
    for meta_id in meta_ids:
        delete(f"/org/app_meta/ios/{meta_id}", None, *sandbox_tenant.db_auths)

    body = get(f"/org/app_meta/ios", None, *sandbox_tenant.ro_db_auths)
    got_ids = [entry["id"] for entry in body]
    assert all(m_id not in got_ids for m_id in meta_ids)

    # Re-deletion throws errors.
    for meta_id in meta_ids:
        delete(
            f"/org/app_meta/{meta_id}", None, *sandbox_tenant.db_auths, status_code=404
        )
