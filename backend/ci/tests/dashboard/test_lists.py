import pytest
from tests.utils import _gen_random_str, post, get, delete, patch


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
    assert list["entries_count"] == 0

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


def test_create_no_permissions(sandbox_tenant):
    nonce = _gen_random_str(5)
    post(
        f"/org/lists",
        dict(
            name=f"Some Real Baddies {nonce}",
            alias=f"some_real_baddies_{nonce}",
            kind="email_domain",
        ),
        *sandbox_tenant.ro_db_auths,
        status_code=401,
    )


@pytest.mark.skip()
def test_list(sandbox_tenant):
    nonce = _gen_random_str(5)
    post(
        f"/org/lists",
        dict(
            name=f"My Super List 1 {nonce}",
            alias=f"my_super_list_1_{nonce}",
            kind="ip_address",
            entries=[],
        ),
        *sandbox_tenant.db_auths,
    )
    post(
        f"/org/lists",
        dict(
            name=f"My Super List 2 {nonce}",
            alias=f"my_super_list_2_{nonce}",
            kind="email_address",
            entries=["bobertotech.com", "badppl.org", "somethingelseketchy.net"],
        ),
        *sandbox_tenant.ro_auth_token,
    )
    post(
        f"/org/lists",
        dict(
            name=f"My Super List 3 {nonce}",
            alias=f"my_super_list_3_{nonce}",
            kind="phone_country_code",
            entries=["+1", "+44"],
        ),
        *sandbox_tenant.db_auths,
    )

    lists = get(f"/org/lists", None, *sandbox_tenant.db_auths)["data"]
    assert lists[0]["name"] == f"My Super List 3 {nonce}"
    assert lists[1]["name"] == f"My Super List 2 {nonce}"
    assert lists[2]["name"] == f"My Super List 1 {nonce}"

    list = get(f"/org/lists/{lists[0]['id']}", None, *sandbox_tenant.db_auths)
    assert list["name"] == f"My Super List 3 {nonce}"
    assert list["entries_count"] == 2
    assert list["used_in_playbook"] == False

    list = get(f"/org/lists/{lists[1]['id']}", None, *sandbox_tenant.db_auths)
    assert list["name"] == f"My Super List 2 {nonce}"
    assert list["entries_count"] == 3
    assert list["used_in_playbook"] == False

    list = get(f"/org/lists/{lists[2]['id']}", None, *sandbox_tenant.db_auths)
    assert list["name"] == f"My Super List 1 {nonce}"
    assert list["entries_count"] == 0
    assert list["used_in_playbook"] == False


@pytest.mark.skip()
def test_update(sandbox_tenant):
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

    post(
        f"/org/lists",
        dict(
            name=f"Some Real Baddies 2 {nonce}",
            alias=f"some_real_baddies_2_{nonce}",
            kind="email_domain",
        ),
        *sandbox_tenant.db_auths,
    )

    # update name and alias
    patch(
        f"/org/lists/{list['id']}",
        dict(name=f"Super Duper Baddies {nonce}", alias=f"super_duper_baddies_{nonce}"),
        *sandbox_tenant.db_auths,
    )

    list = get(f"/org/lists/{list['id']}", None, *sandbox_tenant.db_auths)
    assert list["name"] == f"Super Duper Baddies {nonce}"
    assert list["alias"] == f"super_duper_baddies_{nonce}"

    # updating to a name and alias that already exist fails
    patch(
        f"/org/lists/{list['id']}",
        dict(name=f"Some Real Baddies 2 {nonce}", alias=f"some_real_baddies_2_{nonce}"),
        *sandbox_tenant.db_auths,
        status_code=400,
    )


def test_update_no_permissions(sandbox_tenant):
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

    patch(
        f"/org/lists/{list['id']}",
        dict(name=f"Super Duper Baddies {nonce}", alias=f"super_duper_baddies_{nonce}"),
        *sandbox_tenant.ro_db_auths,
        status_code=401,
    )

    list = get(f"/org/lists/{list['id']}", None, *sandbox_tenant.db_auths)
    assert list["name"] == f"Some Real Baddies {nonce}"


@pytest.mark.skip()
def test_delete_list(sandbox_tenant):
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
        [l["id"] for l in get(f"/org/lists", None, *sandbox_tenant.db_auths)["data"]]
    )
    assert (
        set([list1["id"], list2["id"], list3["id"]]) <= list_ids
    )  # ugh the fact we run tests in prod is annoying here, dont wanna pollute with tons of test tenants but then also run into difficulties writing tests like theses where some data is tenant specific

    # delete list2
    delete(f"/org/lists/{list2['id']}", None, *sandbox_tenant.db_auths)
    list_ids = set(
        [l["id"] for l in get(f"/org/lists", None, *sandbox_tenant.db_auths)["data"]]
    )

    assert set([list1["id"], list3["id"]]) <= list_ids
    assert list2["id"] not in list_ids

    # error when try to delete list2 again
    delete(f"/org/lists/{list2['id']}", None, *sandbox_tenant.db_auths, status_code=400)

    # delete list3
    delete(f"/org/lists/{list3['id']}", None, *sandbox_tenant.db_auths)
    list_ids = set(
        [l["id"] for l in get(f"/org/lists", None, *sandbox_tenant.db_auths)["data"]]
    )
    assert set([list1["id"]]) <= list_ids
    assert list3["id"] not in list_ids

    # delete list1
    delete(f"/org/lists/{list1['id']}", None, *sandbox_tenant.db_auths)
    list_ids = set(
        [l["id"] for l in get(f"/org/lists", None, *sandbox_tenant.db_auths)["data"]]
    )
    assert list1["id"] not in list_ids


def test_delete_no_permissions(sandbox_tenant):
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

    delete(
        f"/org/lists/{list['id']}", None, *sandbox_tenant.ro_db_auths, status_code=401
    )

    list = get(f"/org/lists/{list['id']}", None, *sandbox_tenant.db_auths)
    assert list["name"] == f"Some Real Baddies {nonce}"


@pytest.mark.skip()
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

    # add single
    entries = post(
        f"/org/lists/{list['id']}/entries",
        dict(entries=["protonmail.com"]),
        *sandbox_tenant.db_auths,
    )
    assert len(entries) == 1
    assert entries[0]["data"] == "protonmail.com"
    assert entries[0]["actor"]["kind"] == "tenant_user"

    list = get(f"/org/lists/{list['id']}", None, *sandbox_tenant.db_auths)
    assert list["entries_count"] == 1

    # add multiple
    entries = post(
        f"/org/lists/{list['id']}/entries",
        dict(entries=["bobertotech.com", "badppl.org", "somethingelseketchy.net"]),
        *sandbox_tenant.db_auths,
    )
    assert len(entries) == 3
    assert entries[0]["data"] == "bobertotech.com"
    assert entries[1]["data"] == "badppl.org"
    assert entries[2]["data"] == "somethingelseketchy.net"

    list = get(f"/org/lists/{list['id']}", None, *sandbox_tenant.db_auths)
    assert list["entries_count"] == 4


def test_create_list_entry_no_permissions(sandbox_tenant):
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

    post(
        f"/org/lists/{list['id']}/entries",
        dict(entries=["protonmail.com"]),
        *sandbox_tenant.ro_db_auths,
        status_code=401,
    )

    list = get(f"/org/lists/{list['id']}", None, *sandbox_tenant.db_auths)
    assert list["entries_count"] == 0


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
        dict(entries=["protonmail.com", "somethingelse.com"]),
        *sandbox_tenant.db_auths,
    )
    entry2 = post(
        f"/org/lists/{list['id']}/entries",
        dict(entries=["baddiesinc.org"]),
        *sandbox_tenant.db_auths,
    )
    entry3 = post(
        f"/org/lists/{list['id']}/entries",
        dict(entries=["bobertotech.org"]),
        *sandbox_tenant.db_auths,
    )

    entries = get(f"/org/lists/{list['id']}/entries", None, *sandbox_tenant.db_auths)
    assert entries[0]["data"] == entry3[0]["data"]
    assert entries[0]["id"] == entry3[0]["id"]

    assert entries[1]["data"] == entry2[0]["data"]
    assert entries[1]["id"] == entry2[0]["id"]

    assert entries[2]["data"] == entry1[0]["data"]
    assert entries[2]["id"] == entry1[0]["id"]

    events = get(
        f"/org/lists/{list['id']}/timeline",
        dict(
            page_size=10,
        ),
        *sandbox_tenant.db_auths,
    )
    assert len(events["data"]) == 3
    assert set(events["data"][0]["detail"]["data"]["entries"]) == set(
        ["bobertotech.org"]
    )
    assert set(events["data"][1]["detail"]["data"]["entries"]) == set(
        ["baddiesinc.org"]
    )
    assert set(events["data"][2]["detail"]["data"]["entries"]) == set(
        ["protonmail.com", "somethingelse.com"]
    )


def test_delete_list_entries(sandbox_tenant):
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
        dict(entries=["protonmail.com"]),
        *sandbox_tenant.db_auths,
    )
    entry2 = post(
        f"/org/lists/{list['id']}/entries",
        dict(entries=["baddiesinc.org"]),
        *sandbox_tenant.db_auths,
    )
    entry3 = post(
        f"/org/lists/{list['id']}/entries",
        dict(entries=["bobertotech.org"]),
        *sandbox_tenant.db_auths,
    )

    entries = get(f"/org/lists/{list['id']}/entries", None, *sandbox_tenant.db_auths)
    assert len(entries) == 3

    # delete entry2
    delete(
        f"/org/lists/{list['id']}/entries/{entry2[0]['id']}",
        None,
        *sandbox_tenant.db_auths,
    )

    entries = get(f"/org/lists/{list['id']}/entries", None, *sandbox_tenant.db_auths)
    assert len(entries) == 2
    assert entries[0]["id"] == entry3[0]["id"]
    assert entries[1]["id"] == entry1[0]["id"]

    # error when try to delete entry2 again
    delete(
        f"/org/lists/{list['id']}/entries/{entry2[0]['id']}",
        None,
        *sandbox_tenant.db_auths,
        status_code=400,
    )

    # delete entry1
    delete(
        f"/org/lists/{list['id']}/entries/{entry1[0]['id']}",
        None,
        *sandbox_tenant.db_auths,
    )

    entries = get(f"/org/lists/{list['id']}/entries", None, *sandbox_tenant.db_auths)
    assert len(entries) == 1
    assert entries[0]["id"] == entry3[0]["id"]

    # delete entry3
    delete(
        f"/org/lists/{list['id']}/entries/{entry3[0]['id']}",
        None,
        *sandbox_tenant.db_auths,
    )
    assert (
        len(get(f"/org/lists/{list['id']}/entries", None, *sandbox_tenant.db_auths))
        == 0
    )

    events = get(
        f"/org/lists/{list['id']}/timeline",
        dict(
            page_size=10,
        ),
        *sandbox_tenant.db_auths,
    )
    # should have 3 delete events then 3 create events
    assert all([events["data"][i]["name"] == "delete_list_entry" for i in range(3)])
    assert all([events["data"][i]["name"] == "create_list_entry" for i in range(3, 6)])
    # assert expected decrypted entries for the deletions
    assert events["data"][0]["detail"]["data"]["entry"] == entry3[0]["data"]
    assert events["data"][1]["detail"]["data"]["entry"] == entry1[0]["data"]
    assert events["data"][2]["detail"]["data"]["entry"] == entry2[0]["data"]


def test_delete_list_entries_no_permissions(sandbox_tenant):
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
        dict(entries=["protonmail.com"]),
        *sandbox_tenant.db_auths,
    )

    delete(
        f"/org/lists/{list['id']}/entries/{entry1[0]['id']}",
        None,
        *sandbox_tenant.ro_db_auths,
        status_code=401,
    )

    entries = get(f"/org/lists/{list['id']}/entries", None, *sandbox_tenant.db_auths)
    assert len(entries) == 1
    assert entries[0]["data"] == entry1[0]["data"]
