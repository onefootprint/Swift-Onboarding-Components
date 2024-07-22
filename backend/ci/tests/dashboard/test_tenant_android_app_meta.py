import pytest
from tests.utils import (
    get,
    post,
    patch,
    delete,
)


def test_tenant_android_app_meta(sandbox_tenant):
    # Create some tenant app metadata entries.
    fixtures = [
        (
            ["package1" "package2"],
            ["cert1", "cert2"],
            "verif_key1",
            "dec_key1",
        ),
        (
            ["package3"],
            ["cert3"],
            "verif_key2",
            "dec_key2",
        ),
        (
            [],
            [],
            "verif_key2",
            "dec_key2",
        ),
    ]
    meta_ids = []
    for (
        package_names,
        apk_cert_sha256s,
        integrity_verification_key,
        integrity_decryption_key,
    ) in fixtures:
        # Ensure read-only creds are blocked for creation.
        post(
            "/org/app_meta/android",
            {
                "package_names": package_names,
                "apk_cert_sha256s": apk_cert_sha256s,
                "integrity_verification_key": integrity_verification_key,
                "integrity_decryption_key": integrity_decryption_key,
            },
            *sandbox_tenant.ro_db_auths,
            status_code=403,
        )

        # Make sure we can create using correctly permissioned creds
        body = post(
            "/org/app_meta/android",
            {
                "package_names": package_names,
                "apk_cert_sha256s": apk_cert_sha256s,
                "integrity_verification_key": integrity_verification_key,
                "integrity_decryption_key": integrity_decryption_key,
            },
            *sandbox_tenant.db_auths,
        )
        assert body["package_names"] == package_names
        assert body["apk_cert_sha256s"] == apk_cert_sha256s
        assert body["integrity_verification_key"] == integrity_verification_key
        assert body["integrity_decryption_key"] == integrity_decryption_key
        meta_ids.append(body["id"])

    # List the tenant app meta entries we created.
    body = get(f"/org/app_meta/android", None, *sandbox_tenant.ro_db_auths)

    # Make sure we don't reveal the secret keys in the get request
    for meta_body in body:
        assert meta_body["integrity_verification_key"] == None
        assert meta_body["integrity_decryption_key"] == None
    got_ids = [entry["id"] for entry in body]

    # Don't compare creation time ordering as that may be flaky.
    assert set(meta_ids).issubset(set(got_ids))

    # Test failing to update meta for invalid meta id
    new_package_names = ["package8", "package9"]
    new_certs = ["cert8", "cert9"]
    new_verification_key = "new_verif_key"
    new_decryption_key = "new_dec_key"
    data = dict(
        package_names=new_package_names,
        apk_cert_sha256s=new_certs,
        integrity_verification_key=new_verification_key,
        integrity_decryption_key=new_decryption_key,
    )
    patch(
        f"org/app_meta/android/flerp", data, *sandbox_tenant.db_auths, status_code=404
    )

    # Update all the fields
    body = patch(f"org/app_meta/android/{meta_ids[0]}", data, *sandbox_tenant.db_auths)
    key = body
    assert key["id"] == meta_ids[0]
    assert key["tenant_id"] == sandbox_tenant.id
    assert key["package_names"] == new_package_names
    assert key["apk_cert_sha256s"] == new_certs
    assert key["integrity_verification_key"] == new_verification_key
    assert key["integrity_decryption_key"] == new_decryption_key

    # Test reveal
    body = post(
        f"/org/app_meta/android/{meta_ids[0]}/reveal", None, *sandbox_tenant.db_auths
    )
    assert body["integrity_verification_key"] == new_verification_key
    assert body["integrity_decryption_key"] == new_decryption_key

    # Attempting to delete fails for read-only creds.
    for meta_id in meta_ids:
        delete(
            f"/org/app_meta/android/{meta_id}",
            None,
            *sandbox_tenant.ro_db_auths,
            status_code=403,
        )

    # Delete the tenant app meta entries we created.
    for meta_id in meta_ids:
        delete(f"/org/app_meta/android/{meta_id}", None, *sandbox_tenant.db_auths)

    body = get(f"/org/app_meta/android", None, *sandbox_tenant.ro_db_auths)
    got_ids = [entry["id"] for entry in body]
    assert all(m_id not in got_ids for m_id in meta_ids)

    # Re-deletion throws errors.
    for meta_id in meta_ids:
        delete(
            f"/org/app_meta/{meta_id}", None, *sandbox_tenant.db_auths, status_code=404
        )
