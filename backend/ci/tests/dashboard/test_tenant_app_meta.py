from tests.utils import post, get, delete, HttpError


def test_tenant_app_meta(sandbox_tenant):
    # Create some tenant app metadata entries.
    fixtures = [
        ("ios", "Footprint iOS App", "com.onefootprint.my", "E23432FW", None, None),
        (
            "android",
            "Footprint Android App",
            None,
            None,
            "com.onefootprint.my",
            "23knrl3k2nr34oro4334",
        ),
    ]
    tam_ids = []
    for (
        kind,
        name,
        ios_app_bundle_id,
        ios_team_id,
        android_package_name,
        android_apk_cert_sha256,
    ) in fixtures:
        body = post(
            "/org/app_meta",
            {
                "kind": kind,
                "name": name,
                "ios_app_bundle_id": ios_app_bundle_id,
                "ios_team_id": ios_team_id,
                "android_package_name": android_package_name,
                "android_apk_cert_sha256": android_apk_cert_sha256,
            },
            *sandbox_tenant.db_auths,
        )
        assert body["kind"] == kind
        assert body["name"] == name
        assert body["ios_app_bundle_id"] == ios_app_bundle_id
        assert body["ios_team_id"] == ios_team_id
        assert body["android_package_name"] == android_package_name
        assert body["android_apk_cert_sha256"] == android_apk_cert_sha256
        tam_ids.append(body["id"])

    # Ensure read-only creds are blocked for creation.
    post(
        "/org/app_meta",
        {
            "kind": kind,
            "name": name,
            "ios_app_bundle_id": ios_app_bundle_id,
            "ios_team_id": ios_team_id,
            "android_package_name": android_package_name,
            "android_apk_cert_sha256": android_apk_cert_sha256,
        },
        *sandbox_tenant.ro_db_auths,
        status_code=401,
    )

    # List the tenant app meta entries we created.
    for kind in set(f[0] for f in fixtures):
        body = get(f"/org/app_meta?kind={kind}", None, *sandbox_tenant.ro_db_auths)
        got_ids = [entry["id"] for entry in body]
        want_ids = [tam_id for tam_id, tam in zip(tam_ids, fixtures) if tam[0] == kind]

        # Don't compare creation time ordering as that may be flaky.
        assert set(got_ids) == set(want_ids)

    # Attempting to delete fails for read-only creds.
    for tam_id in tam_ids:
        delete(
            f"/org/app_meta/{tam_id}",
            None,
            *sandbox_tenant.ro_db_auths,
            status_code=401,
        )

    # Delete the tenant app meta entries we created.
    for i, tam_id, fixture in zip(range(len(tam_ids)), tam_ids, fixtures):
        delete(f"/org/app_meta/{tam_id}", None, *sandbox_tenant.db_auths)

        # Check that it was deleted.
        kind = fixture[0]
        body = get(f"/org/app_meta?kind={kind}", None, *sandbox_tenant.ro_db_auths)
        got_ids = [entry["id"] for entry in body]
        want_ids = [
            tam_id
            for tam_id, tam in zip(tam_ids[i + 1 :], fixtures[i + 1 :])
            if tam[0] == kind
        ]

        # Don't compare creation time ordering as that may be flaky.
        assert set(want_ids).issubset(set(got_ids))

    # Re-deletion throws errors.
    for tam_id in tam_ids:
        delete(
            f"/org/app_meta/{tam_id}", None, *sandbox_tenant.db_auths, status_code=404
        )
