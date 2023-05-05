from tests.utils import inherit_user, get


def test_my1fp(sandbox_user, twilio):
    phone_number = sandbox_user.client.data["id.phone_number"]
    # Specifically inherit the user through the identify flow without providing any ob public key auth
    auth_token = inherit_user(twilio, phone_number)
    body = get("/hosted/user/token", None, auth_token)
    assert body["scopes"] == ["BasicProfile"]

    print(auth_token.__dict__)
    body = get("/hosted/user/authorized_orgs", None, auth_token)
    assert len(body) == 1
    ob = body[0]
    assert ob["org_name"] == sandbox_user.client.ob_config.tenant.name
    assert set(ob["can_access_data"]) == set(
        sandbox_user.client.ob_config.can_access_data
    )
