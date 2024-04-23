import pytest
from tests.utils import _gen_random_str, create_ob_config, post, get, delete, patch


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


def test_list(sandbox_tenant, must_collect_data, can_access_data):
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
    list2 = post(
        f"/org/lists",
        dict(
            name=f"My Super List 2 {nonce}",
            alias=f"my_super_list_2_{nonce}",
            kind="email_address",
            entries=["a@bobertotech.com", "b@badppl.org", "c@somethingelseketchy.net"],
        ),
        *sandbox_tenant.db_auths,
    )
    list3 = post(
        f"/org/lists",
        dict(
            name=f"My Super List 3 {nonce}",
            alias=f"my_super_list_3_{nonce}",
            kind="phone_country_code",
            entries=["+1", "+44"],
        ),
        *sandbox_tenant.db_auths,
    )

    obc1 = create_ob_config(
        sandbox_tenant, "Test OB Config", must_collect_data, can_access_data
    )
    obc2 = create_ob_config(
        sandbox_tenant, "Test OB Config", must_collect_data, can_access_data
    )

    # use list2 in a rule in obc1
    patch(
        f"/org/onboarding_configs/{obc1.id}/rules",
        dict(
            expected_rule_set_version=1,
            add=[
                dict(
                    rule_action="manual_review",
                    rule_expression=[
                        {
                            "field": "id.email",
                            "op": "is_in",
                            "value": list2["id"],
                        }
                    ],
                ),
            ],
        ),
        *sandbox_tenant.db_auths,
    )

    # use list2 and list3 in a rule in obc2
    patch(
        f"/org/onboarding_configs/{obc2.id}/rules",
        dict(
            expected_rule_set_version=1,
            add=[
                dict(
                    rule_action="fail",
                    rule_expression=[
                        {
                            "field": "id.email",
                            "op": "is_in",
                            "value": list2["id"],
                        }
                    ],
                ),
                dict(
                    rule_action="manual_review",
                    rule_expression=[
                        {
                            "field": "id.phone_number",
                            "op": "is_in",
                            "value": list3["id"],
                        }
                    ],
                ),
            ],
        ),
        *sandbox_tenant.db_auths,
    )

    lists = get(f"/org/lists", None, *sandbox_tenant.db_auths)["data"]
    lists = iter(lists)
    list3 = next(i for i in lists if i["name"] == f"My Super List 3 {nonce}")
    assert list3["used_in_playbook"] == True
    list2 = next(i for i in lists if i["name"] == f"My Super List 2 {nonce}")
    assert list2["used_in_playbook"] == True
    list1 = next(i for i in lists if i["name"] == f"My Super List 1 {nonce}")
    assert list1["used_in_playbook"] == False

    list = get(f"/org/lists/{list3['id']}", None, *sandbox_tenant.db_auths)
    assert list["name"] == f"My Super List 3 {nonce}"
    assert len(list["playbooks"]) == 1
    assert list["playbooks"][0]["id"] == obc2.id
    assert list["playbooks"][0]["name"] == obc2.name
    assert len(list["playbooks"][0]["rules"]) == 1
    assert list["playbooks"][0]["rules"][0]["rule_expression"] == [
        {
            "field": "id.phone_number",
            "op": "is_in",
            "value": list3["id"],
        }
    ]

    list = get(f"/org/lists/{list2['id']}", None, *sandbox_tenant.db_auths)
    assert list["name"] == f"My Super List 2 {nonce}"
    assert len(list["playbooks"]) == 2

    assert list["playbooks"][0]["id"] == obc2.id
    assert list["playbooks"][0]["name"] == obc2.name
    assert len(list["playbooks"][0]["rules"]) == 1
    assert list["playbooks"][0]["rules"][0]["action"] == "fail"
    assert list["playbooks"][0]["rules"][0]["rule_expression"] == [
        {"field": "id.email", "op": "is_in", "value": list2["id"]}
    ]

    assert list["playbooks"][1]["id"] == obc1.id
    assert list["playbooks"][1]["name"] == obc1.name
    assert len(list["playbooks"][1]["rules"]) == 1
    assert list["playbooks"][1]["rules"][0]["action"] == "manual_review"
    assert list["playbooks"][1]["rules"][0]["rule_expression"] == [
        {"field": "id.email", "op": "is_in", "value": list2["id"]}
    ]

    list = get(f"/org/lists/{list1['id']}", None, *sandbox_tenant.db_auths)
    assert list["name"] == f"My Super List 1 {nonce}"
    assert len(list["playbooks"]) == 0


def test_list_type_di_match(sandbox_tenant, must_collect_data, can_access_data):
    # We should only be able to use lists in a rule expression with a field
    # that matches the list type.

    # Create some lists.
    nonce = _gen_random_str(5)
    ssn9_list = post(
        f"/org/lists",
        dict(
            name=f"SSN0 {nonce}",
            alias=f"ssn9_{nonce}",
            kind="ssn9",
            entries=["123121234", "234232345", "345343456"],
        ),
        *sandbox_tenant.db_auths,
    )
    email_addr_list = post(
        f"/org/lists",
        dict(
            name=f"Email address {nonce}",
            alias=f"email_addr_{nonce}",
            kind="email_address",
            entries=["a@bobertotech.com", "b@badppl.org", "c@somethingelseketchy.net"],
        ),
        *sandbox_tenant.db_auths,
    )
    email_domain_list = post(
        f"/org/lists",
        dict(
            name=f"Email domain {nonce}",
            alias=f"email_domain_{nonce}",
            kind="email_domain",
            entries=["bobertotech.com", "badppl.org", "verybad.com"],
        ),
        *sandbox_tenant.db_auths,
    )

    obc = create_ob_config(
        sandbox_tenant, "Test OB Config", must_collect_data, can_access_data
    )

    # [POST] Try to create a rule with a mismatching field and list type.
    resp = post(
        f"/org/onboarding_configs/{obc.id}/rules",
        dict(
            action="manual_review",
            rule_expression=[
                {
                    "field": "id.email",
                    "op": "is_in",
                    "value": ssn9_list["id"],
                }
            ],
        ),
        *sandbox_tenant.db_auths,
        status_code=400,
    )
    assert resp["error"]["message"] == "Vaulted field id.email can not be matched against list with kind ssn9"

    # [POST] Create a rule with a list that accepts exact matches on a field.
    post(
        f"/org/onboarding_configs/{obc.id}/rules",
        dict(
            action="manual_review",
            rule_expression=[
                {
                    "field": "id.email",
                    "op": "is_in",
                    "value": email_addr_list["id"],
                }
            ],
        ),
        *sandbox_tenant.db_auths,
    )

    # [POST] Create a rule with a list that accepts transformed matches on a field.
    post(
        f"/org/onboarding_configs/{obc.id}/rules",
        dict(
            action="manual_review",
            rule_expression=[
                {
                    "field": "id.email",
                    "op": "is_in",
                    "value": email_domain_list["id"],
                }
            ],
        ),
        *sandbox_tenant.db_auths,
    )

    # [POST] Create a rule matching against a custom list.
    post(
        f"/org/onboarding_configs/{obc.id}/rules",
        dict(
            action="manual_review",
            rule_expression=[
                {
                    "field": "custom.other_email",
                    "op": "is_in",
                    "value": email_addr_list["id"],
                }
            ],
        ),
        *sandbox_tenant.db_auths,
    )

    # [PATCH] Try to augment a playbook with a rule with a mismatching field and list type.
    resp = patch(
        f"/org/onboarding_configs/{obc.id}/rules",
        dict(
            expected_rule_set_version=4,
            add=[
                dict(
                    rule_action="manual_review",
                    rule_expression=[
                        {
                            "field": "id.email",
                            "op": "is_in",
                            "value": ssn9_list["id"],
                        }
                    ],
                ),
            ],
        ),
        *sandbox_tenant.db_auths,
        status_code=400,
    )
    assert resp["error"]["message"] == "Vaulted field id.email can not be matched against list with kind ssn9"

    # [PATCH] Augment a playbook with a rule with a list that accepts exact matches on a field.
    patch(
        f"/org/onboarding_configs/{obc.id}/rules",
        dict(
            expected_rule_set_version=4,
            add=[
                dict(
                    rule_action="manual_review",
                    rule_expression=[
                        {
                            "field": "id.email",
                            "op": "is_in",
                            "value": email_domain_list["id"],
                        }
                    ],
                ),
            ],
        ),
        *sandbox_tenant.db_auths,
    )

    # [PATCH] Augment a playbook with a rule with a list that accepts transformed matches on a field.
    patch(
        f"/org/onboarding_configs/{obc.id}/rules",
        dict(
            expected_rule_set_version=5,
            add=[
                dict(
                    rule_action="manual_review",
                    rule_expression=[
                        {
                            "field": "id.email",
                            "op": "is_in",
                            "value": email_addr_list["id"],
                        }
                    ],
                ),
            ],
        ),
        *sandbox_tenant.db_auths,
    )

    # [PATCH] Augment a playbook with a rule matching against a custom DI.
    patch(
        f"/org/onboarding_configs/{obc.id}/rules",
        dict(
            expected_rule_set_version=6,
            add=[
                dict(
                    rule_action="manual_review",
                    rule_expression=[
                        {
                            "field": "custom.other_email",
                            "op": "is_in",
                            "value": email_addr_list["id"],
                        }
                    ],
                ),
            ],
        ),
        *sandbox_tenant.db_auths,
    )

    resp = get(f"/org/onboarding_configs/{obc.id}/rules", None, *sandbox_tenant.db_auths)
    assert len([
            rule for rule in resp
            if rule["rule_expression"] == [{
                "field": "id.email",
                "op": "is_in",
                "value": ssn9_list["id"],
            }]
        ]) == 0
    assert len([
            rule for rule in resp
            if rule["rule_expression"] == [{
                "field": "id.email",
                "op": "is_in",
                "value": email_addr_list["id"],
            }]
        ]) == 2
    assert len([
            rule for rule in resp
            if rule["rule_expression"] == [{
                "field": "id.email",
                "op": "is_in",
                "value": email_domain_list["id"],
            }]
        ]) == 2
    assert len([
            rule for rule in resp
            if rule["rule_expression"] == [{
                "field": "custom.other_email",
                "op": "is_in",
                "value": email_addr_list["id"],
            }]
        ]) == 2


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


def test_create_list_entry(sandbox_tenant):
    nonce = _gen_random_str(5)
    resp = post(
        f"/org/lists",
        dict(
            name=f"My Super List {nonce}",
            alias=f"my_super_list_{nonce}",
            kind="email_domain",
        ),
        *sandbox_tenant.db_auths,
    )
    list_id = resp["id"]

    # add single
    entries = post(
        f"/org/lists/{list_id}/entries",
        dict(entries=["protonmail.com"]),
        *sandbox_tenant.db_auths,
    )
    assert len(entries) == 1
    assert entries[0]["data"] == "protonmail.com"
    assert entries[0]["actor"]["kind"] == "tenant_user"

    entries = get(f"/org/lists/{list_id}/entries", None, *sandbox_tenant.db_auths)
    assert len(entries) == 1

    # add multiple
    entries = post(
        f"/org/lists/{list_id}/entries",
        dict(entries=["bobertotech.com", "badppl.org", "somethingelseketchy.net"]),
        *sandbox_tenant.db_auths,
    )
    assert len(entries) == 3
    assert entries[0]["data"] == "bobertotech.com"
    assert entries[1]["data"] == "badppl.org"
    assert entries[2]["data"] == "somethingelseketchy.net"

    entries = get(f"/org/lists/{list_id}/entries", None, *sandbox_tenant.db_auths)
    assert len(entries) == 4

    # Adding duplicates should be a no-op
    entries = post(
        f"/org/lists/{list_id}/entries",
        dict(entries=["protonmail.com"]),
        *sandbox_tenant.db_auths,
    )
    assert len(entries) == 0

    entries = post(
        f"/org/lists/{list_id}/entries",
        dict(entries=["protonmail.com", "newdomain.com"]),
        *sandbox_tenant.db_auths,
    )
    assert len(entries) == 1
    assert entries[0]["data"] == "newdomain.com"

    entries = get(f"/org/lists/{list_id}/entries", None, *sandbox_tenant.db_auths)
    assert len(entries) == 5


def test_create_list_entry_format_canonicalization(sandbox_tenant):
    nonce = _gen_random_str(5)

    # Invalid SSN yields HTTP 400
    resp = post(
        f"/org/lists",
        dict(
            name=f"My Super List {nonce}",
            alias=f"my_super_list_{nonce}",
            kind="ssn9",
            entries=[
                "000-45-6789",
            ]
        ),
        *sandbox_tenant.db_auths,
        status_code=400,
    )
    assert resp["error"]["message"] == "Invalid SSN9: Leading three digit number must not be 000, 666, or a value between 900 and 999 (inclusive)"

    # Entries can be given in the list creation call.
    resp = post(
        f"/org/lists",
        dict(
            name=f"My Super List {nonce}",
            alias=f"my_super_list_{nonce}",
            kind="ssn9",
            entries=[
                "123-45-6789",
            ]
        ),
        *sandbox_tenant.db_auths,
    )
    list_id = resp["id"]

    # Valid SSNs are canonicalized.
    entries = post(
        f"/org/lists/{list_id}/entries",
        dict(entries=[
            "234-56-2983",
            "345671234",
            "456-781234",
        ]),
        *sandbox_tenant.db_auths,
    )
    assert len(entries) == 3
    assert entries[0]["data"] == "234562983"
    assert entries[1]["data"] == "345671234"
    assert entries[2]["data"] == "456781234"

    # Listing all entries inclues entries given when list was created.
    entries = get(f"/org/lists/{list_id}/entries", None, *sandbox_tenant.db_auths)
    assert set([e["data"] for e in entries]) == set(["123456789", "234562983", "345671234", "456781234"])


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
