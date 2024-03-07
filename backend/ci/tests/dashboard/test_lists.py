from tests.utils import _gen_random_str, post, get


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


def test_list(sandbox_tenant):
    nonce = _gen_random_str(5)
    post(
        f"/org/lists",
        dict(
            name=f"My Super List 1 {nonce}",
            alias=f"my_super_list_1_{nonce}",
            kind="ip_address",
        ),
        *sandbox_tenant.db_auths,
    )
    post(
        f"/org/lists",
        dict(
            name=f"My Super List 2 {nonce}",
            alias=f"my_super_list_2_{nonce}",
            kind="email_address",
        ),
        *sandbox_tenant.db_auths,
    )
    post(
        f"/org/lists",
        dict(
            name=f"My Super List 3 {nonce}",
            alias=f"my_super_list_3_{nonce}",
            kind="phone_country_code",
        ),
        *sandbox_tenant.db_auths,
    )

    lists = get(f"/org/lists", None, *sandbox_tenant.db_auths)
    assert lists[0]["name"] == f"My Super List 3 {nonce}"
    assert lists[1]["name"] == f"My Super List 2 {nonce}"
    assert lists[2]["name"] == f"My Super List 1 {nonce}"


def test_create_list_entry(sandbox_tenant):
    nonce = _gen_random_str(5)
    list = post(
        f"/org/lists",
        dict(
            name=f"My Super List {nonce}",
            alias=f"my_super_list_{nonce}",
            kind="email_domain",
        ),
        *sandbox_tenant.db_auths,
    )

    entry = post(
        f"/org/lists/{list['id']}/entries",
        dict(data="protonmail.com"),
        *sandbox_tenant.db_auths,
    )
    assert entry["data"] == "protonmail.com"
    assert entry["actor"]["kind"] == "tenant_user"
