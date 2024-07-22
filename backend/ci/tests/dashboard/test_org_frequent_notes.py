from tests.utils import post, get, delete, HttpError


def test_org_frequent_notes(sandbox_tenant):
    # Create some frequent notes.
    fixtures = [
        ("manual_review", "this is a manual review note"),
        ("manual_review", "this is another manual review note"),
        ("annotation", "this is an annotation note"),
        ("annotation", "this is another annotation note"),
        ("trigger", "this is a trigger note"),
        ("trigger", "this is another trigger note"),
    ]
    fn_ids = []
    for kind, content in fixtures:
        body = post(
            "/org/frequent_notes",
            {
                "kind": kind,
                "content": content,
            },
            *sandbox_tenant.db_auths,
        )
        assert body["kind"] == kind
        assert body["content"] == content
        fn_ids.append(body["id"])

    # Ensure read-only creds are blocked for creation.
    post(
        "/org/frequent_notes",
        {
            "kind": "manual_review",
            "content": "the content",
        },
        *sandbox_tenant.ro_db_auths,
        status_code=403,
    )

    # List the frequent notes we created.
    for kind in set(f[0] for f in fixtures):
        body = get(
            f"/org/frequent_notes?kind={kind}", None, *sandbox_tenant.ro_db_auths
        )
        got_ids = [entry["id"] for entry in body]
        want_ids = [fn_id for fn_id, fn in zip(fn_ids, fixtures) if fn[0] == kind]

        # Don't compare creation time ordering as that may be flaky.
        # Don't compare set equality either since other concurrent tests may create frequent notes.
        assert set(want_ids).issubset(set(got_ids))

    # Attempting to delete fails for read-only creds.
    for fn_id in fn_ids:
        delete(
            f"/org/frequent_notes/{fn_id}",
            None,
            *sandbox_tenant.ro_db_auths,
            status_code=403,
        )

    # Delete the frequent notes we created.
    for i, fn_id, fixture in zip(range(len(fn_ids)), fn_ids, fixtures):
        delete(f"/org/frequent_notes/{fn_id}", None, *sandbox_tenant.db_auths)

        # Check that it was deleted.
        kind = fixture[0]
        body = get(
            f"/org/frequent_notes?kind={kind}", None, *sandbox_tenant.ro_db_auths
        )
        got_ids = [entry["id"] for entry in body]
        want_ids = [
            fn_id
            for fn_id, fn in zip(fn_ids[i + 1 :], fixtures[i + 1 :])
            if fn[0] == kind
        ]

        # Don't compare creation time ordering as that may be flaky.
        # Don't compare set equality either since other concurrent tests may create frequent notes.
        assert set(want_ids).issubset(set(got_ids))

    # Re-deletion throws errors.
    for fn_id in fn_ids:
        delete(
            f"/org/frequent_notes/{fn_id}",
            None,
            *sandbox_tenant.db_auths,
            status_code=404,
        )
