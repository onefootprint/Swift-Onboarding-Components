import pytest
from tests.utils import post, get


@pytest.mark.parametrize(
    "key,value",
    [
        ("custom.hello", ["hayes", "valley"]),
        ("custom.today", {"office": "hayes valley", "flerp": 1}),
        ("custom.hi", '["hayes", "valley"]'),
        ("id.citizenships", ["US", "NO"]),
        ("investor_profile.investment_goals", ["growth", "preserve_capital"]),
        (
            "investor_profile.declarations",
            [
                "affiliated_with_us_broker",
                "family_of_political_figure",
            ],
        ),
        ("investor_profile.senior_executive_symbols", ["AAPL", "HOOOD", "SPY"]),
        ("investor_profile.family_member_names", ["Hayes Valley", "Piip Penguin"]),
    ],
)
def test_vault_json(key, value, sandbox_tenant):
    data = {key: value}
    body = post("users/", data, sandbox_tenant.sk.key)
    fp_id = body["id"]

    data = dict(fields=[key], reason="Hayes Valley")
    body = post(f"users/{fp_id}/vault/decrypt", data, sandbox_tenant.sk.key)
    assert body[key] == value


def test_client_token_json(sandbox_tenant):
    value = ["hayes", "valley"]
    data = {"custom.office": value}
    body = post("users/", data, sandbox_tenant.sk.key)
    fp_id = body["id"]

    data = dict(
        fields=["custom.office"],
        decrypt_reason="Hayes Valley",
        scopes=["decrypt_download"],
    )
    body = post(f"users/{fp_id}/client_token", data, sandbox_tenant.sk.key)
    token = body["token"]

    body = get(f"users/vault/decrypt/{token}")
    # Should be a JSON body, not a string-serialized JSON body
    assert body == value
