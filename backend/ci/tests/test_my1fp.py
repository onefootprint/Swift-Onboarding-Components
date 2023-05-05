from tests.utils import inherit_user, get


def test_auth(sandbox_user, twilio):
    phone_number = sandbox_user.client.data["id.phone_number"]
    # Specifically inherit the user through the identify flow without providing any ob public key auth
    auth_token = inherit_user(twilio, phone_number)
    body = get("/hosted/user/token", None, auth_token)
    assert body["scopes"] == ["BasicProfile"]
