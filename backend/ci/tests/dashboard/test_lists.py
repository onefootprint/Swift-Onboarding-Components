from tests.utils import _gen_random_str, post


def test_create(sandbox_tenant):
    nonce = _gen_random_str(5)
    res = post(
        f"/org/lists",
        dict(
            name=f"Some Real Baddies {nonce}",
            alias=f"some_real_baddies_{nonce}",
            kind="email_domain",
        ),
        *sandbox_tenant.db_auths,
    )
    assert res["name"] == f"Some Real Baddies {nonce}"
    assert res["alias"] == f"some_real_baddies_{nonce}"
    assert res["kind"] == "email_domain"
    assert res["actor"]["kind"] == "tenant_user"

    # Trying to use a name that already exists fails
    post(
        f"/org/lists",
        dict(
            name=f"SoMe REAL baDDies {nonce}",
            alias="some_real_baddies2",
            kind="email_domain",
        ),
        *sandbox_tenant.db_auths,
        status_code=400,
    )

    # Trying to use an alias that already exists fails
    post(
        f"/org/lists",
        dict(
            name="More Baddies",
            alias=f"some_real_baddies_{nonce}",
            kind="email_domain",
        ),
        *sandbox_tenant.db_auths,
        status_code=400,
    )
