from tests.utils import _gen_random_str, post, get, delete


def test_create(sandbox_tenant):
    nonce = _gen_random_str(5)
    list = post(
        f"/org/lists",
        dict(
            name=f"Some Real Baddies {nonce}",
            alias=f"some_real_baddies_{nonce}",
            kind="email_domain",
        ),
        *sandbox_tenant.db_auths,
    )
    assert list["name"] == f"Some Real Baddies {nonce}"
    assert list["alias"] == f"some_real_baddies_{nonce}"
    assert list["kind"] == "email_domain"
    assert list["actor"]["kind"] == "tenant_user"

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


def test_delete(sandbox_tenant):
    nonce = _gen_random_str(5)
    list1 = post(
        f"/org/lists",
        dict(
            name=f"My Super List 1 {nonce}",
            alias=f"my_super_list_1_{nonce}",
            kind="ip_address",
        ),
        *sandbox_tenant.db_auths,
    )
    list2 = post(
        f"/org/lists",
        dict(
            name=f"My Super List 2 {nonce}",
            alias=f"my_super_list_2_{nonce}",
            kind="email_address",
        ),
        *sandbox_tenant.db_auths,
    )
    list3 = post(
        f"/org/lists",
        dict(
            name=f"My Super List 3 {nonce}",
            alias=f"my_super_list_3_{nonce}",
            kind="phone_country_code",
        ),
        *sandbox_tenant.db_auths,
    )

    list_ids = set(
        [l["id"] for l in get(f"/org/lists", None, *sandbox_tenant.db_auths)]
    )
    assert (
        set([list1["id"], list2["id"], list3["id"]]) <= list_ids
    )  # ugh the fact we run tests in prod is annoying here, dont wanna pollute with tons of test tenants but then also run into difficulties writing tests like theses where some data is tenant specific

    # delete list2
    delete(f"/org/lists/{list2['id']}", None, *sandbox_tenant.db_auths)
    list_ids = set(
        [l["id"] for l in get(f"/org/lists", None, *sandbox_tenant.db_auths)]
    )

    assert set([list1["id"], list3["id"]]) <= list_ids
    assert list2["id"] not in list_ids

    # error when try to delete list2 again
    delete(f"/org/lists/{list2['id']}", None, *sandbox_tenant.db_auths, status_code=400)

    # delete list3
    delete(f"/org/lists/{list3['id']}", None, *sandbox_tenant.db_auths)
    list_ids = set(
        [l["id"] for l in get(f"/org/lists", None, *sandbox_tenant.db_auths)]
    )
    assert set([list1["id"]]) <= list_ids
    assert list3["id"] not in list_ids

    # delete list1
    delete(f"/org/lists/{list1['id']}", None, *sandbox_tenant.db_auths)
    list_ids = set(
        [l["id"] for l in get(f"/org/lists", None, *sandbox_tenant.db_auths)]
    )
    assert list1["id"] not in list_ids


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


def test_list_list_entries(sandbox_tenant):
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

    entry1 = post(
        f"/org/lists/{list['id']}/entries",
        dict(data="protonmail.com"),
        *sandbox_tenant.db_auths,
    )
    entry2 = post(
        f"/org/lists/{list['id']}/entries",
        dict(data="baddiesinc.org"),
        *sandbox_tenant.db_auths,
    )
    entry3 = post(
        f"/org/lists/{list['id']}/entries",
        dict(data="bobertotech.org"),
        *sandbox_tenant.db_auths,
    )

    entries = get(f"/org/lists/{list['id']}/entries", None, *sandbox_tenant.db_auths)
    assert entries[0]["data"] == entry3["data"]
    assert entries[0]["id"] == entry3["id"]

    assert entries[1]["data"] == entry2["data"]
    assert entries[1]["id"] == entry2["id"]

    assert entries[2]["data"] == entry1["data"]
    assert entries[2]["id"] == entry1["id"]
