from tests.headers import ClientTokenAuth
from tests.test_proxy import ProxyTokenAssignment, ProxyPathAndQuery
from tests.utils import post, patch

from checkout_sdk.checkout_sdk import CheckoutSdk
from checkout_sdk.environment import Environment
from checkout_sdk.instruments.instruments import CreateTokenInstrumentRequest


CHECKOUT_PK_SBOX_KEY = "pk_sbox_ozqhnx75zh6ka7iusgimcg4tuud"
CHECKOUT_SK_SBOX_KEY = "sk_sbox_psenaoe3kero5ut673xrbd4thmb"


def configure_proxy(tenant, base_url):
    data = {
        "access_reason": "test tokenize to checkout",
        "headers": [{"name": "my-test-header", "value": "my-test-value"}],
        "method": "POST",
        "name": "test config",
        "headers": [{"name": "Content-Type", "value": "application/json"}],
        "secret_headers": [{"name": "Authorization", "value": CHECKOUT_PK_SBOX_KEY}],
        "url": base_url,
    }

    body = post(
        "org/proxy_configs/",
        data,
        *tenant.db_auths,
    )
    assert body["id"]
    return body["id"]


def test_checkout_flow(sandbox_tenant):
    # create a vault
    body = post("users/", None, sandbox_tenant.sk.key)
    fp_id = body["id"]

    # generate a client token (server side)
    data = dict(
        fields=[
            "card.test.number",
            "card.test.cvc",
            "card.test.name",
            "card.test.expiration",
            "card.test.billing_address.zip",
        ],
        scopes=["vault"],
    )
    body = post(f"users/{fp_id}/client_token", data, sandbox_tenant.sk.key)
    auth_token = ClientTokenAuth(body["token"])

    # vault card data with the client token (this is client side)
    data = {
        "card.test.number": "4543474002249996",
        "card.test.cvc": "956",
        "card.test.name": "Carl Cassinova",
        "card.test.expiration": "06/2025",
        "card.test.billing_address.zip": "W1T 4TJ",
    }
    patch(f"users/vault", data, auth_token)

    # proxy the card data to checkout.com (server side)
    proxy_id = configure_proxy(sandbox_tenant, "https://api.sandbox.checkout.com")

    data = {
        "type": "card",
        "number": "{{ card.test.number }}",
        "expiry_month": "{{ card.test.expiration_month }}",
        "expiry_year": "{{ card.test.expiration_year }}",
        "name": "{{ card.test.name }}",
        "cvv": "{{ card.test.cvc }}",
        "billing_address": {"zip": "{{ card.test.billing_address.zip }}"},
    }

    response = post(
        f"vault_proxy/{proxy_id}",
        data,
        sandbox_tenant.sk.key,
        ProxyTokenAssignment(fp_id),
        ProxyPathAndQuery("/tokens"),
        status_code=201,
    )

    assert response["token"]
    assert response["last4"] == "9996"
    assert response["expiry_month"] == 6
    assert response["expiry_year"] == 2025
    assert response["card_type"] == "CREDIT"
    assert response["scheme"] == "VISA"

    # use the token to create a payment instrument
    api = (
        CheckoutSdk.builder()
        .secret_key(CHECKOUT_SK_SBOX_KEY)
        .environment(Environment.sandbox())
        .build()
    )
    request = CreateTokenInstrumentRequest()
    request.token = response["token"]

    response = api.instruments.create(request)
    assert response.fingerprint
