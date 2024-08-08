from tests.utils import post, get, delete, HttpError


def test_org_tenant_tag(sandbox_tenant):
    # Create some tenant tags.
    fixtures = [
        ("person", "high_risk"),
        ("person", "nice_guy"),
        ("business", "bad_biz"),
        ("business", "nice_biz"),
    ]
    tt_ids = []
    for kind, tag in fixtures:
        body = post(
            "/org/tags",
            {
                "kind": kind,
                "tag": tag,
            },
            *sandbox_tenant.db_auths,
        )
        assert body["kind"] == kind
        assert body["tag"] == tag
        tt_ids.append(body["id"])

    # Ensure read-only creds are blocked for creation.
    post(
        "/org/tags",
        {
            "kind": "person",
            "tag": "the tag",
        },
        *sandbox_tenant.ro_db_auths,
        status_code=403,
    )

    # List the tenant tags we created.
    for kind in set(f[0] for f in fixtures):
        body = get(f"/org/tags?kind={kind}", None, *sandbox_tenant.ro_db_auths)
        got_ids = [entry["id"] for entry in body]
        want_ids = [tt_id for tt_id, tt in zip(tt_ids, fixtures) if tt[0] == kind]

        # Don't compare creation time ordering as that may be flaky.
        # Don't compare set equality either since other concurrent tests may create tenant tags.
        assert set(want_ids).issubset(set(got_ids))

    # Attempting to delete fails for read-only creds.
    for tt_id in tt_ids:
        delete(
            f"/org/tags/{tt_id}",
            None,
            *sandbox_tenant.ro_db_auths,
            status_code=403,
        )

    # Delete the tenant tags we created.
    for i, tt_id, fixture in zip(range(len(tt_ids)), tt_ids, fixtures):
        delete(f"/org/tags/{tt_id}", None, *sandbox_tenant.db_auths)

        # Check that it was deleted.
        kind = fixture[0]
        body = get(f"/org/tags?kind={kind}", None, *sandbox_tenant.ro_db_auths)
        got_ids = [entry["id"] for entry in body]
        want_ids = [
            tt_id
            for tt_id, tt in zip(tt_ids[i + 1 :], fixtures[i + 1 :])
            if tt[0] == kind
        ]

        # Don't compare creation time ordering as that may be flaky.
        # Don't compare set equality either since other concurrent tests may create tenant tags.
        assert set(want_ids).issubset(set(got_ids))

    # Re-deletion throws errors.
    for tt_id in tt_ids:
        delete(
            f"/org/tags/{tt_id}",
            None,
            *sandbox_tenant.db_auths,
            status_code=404,
        )


def test_tenant_tag_must_be_non_empty(sandbox_tenant):
    body = post(
        "/org/tags",
        {
            "kind": "person",
            "tag": "",
        },
        *sandbox_tenant.db_auths,
        status_code=400,
    )

    assert body["message"] == "Validation error: tag cannot be empty"
