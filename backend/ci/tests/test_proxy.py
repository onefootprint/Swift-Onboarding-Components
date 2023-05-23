from tests.cert_fixtures import GOOGLE_CERT
from tests.utils import _make_request
from tests.auth import BaseAuth
from tests.utils import post, get, patch
from tests.constants import ID_DATA
import requests
import urllib.parse


class FwdTestHeader(BaseAuth):
    HEADER_NAME = "x-fp-proxy-fwd-test-header"


class ProxyDestinationHeader(BaseAuth):
    HEADER_NAME = "x-fp-proxy-target-url"


class ProxyDestinationMethod(BaseAuth):
    HEADER_NAME = "x-fp-proxy-method"


class ProxyAccessReason(BaseAuth):
    HEADER_NAME = "x-fp-proxy-access-reason"


class ProxyClientCertPem(BaseAuth):
    HEADER_NAME = "x-fp-proxy-client-cert"


class ProxyClientKeyPem(BaseAuth):
    HEADER_NAME = "x-fp-proxy-client-key"


class ProxyServerCertPem(BaseAuth):
    HEADER_NAME = "x-fp-proxy-pin-cert"


class ProxyIngressRule(BaseAuth):
    HEADER_NAME = "x-fp-proxy-ingress-rule"


class ProxyIngressContentType(BaseAuth):
    HEADER_NAME = "x-fp-proxy-ingress-content-type"


class ProxyTokenAssignment(BaseAuth):
    HEADER_NAME = "x-fp-proxy-footprint-token"


def read_file(name):
    import os

    absolute_path = os.path.dirname(__file__)
    path = absolute_path + "/../../../" + name
    with open(path, "r") as file:
        return file.read()


def read_pem_file_to_header_encoded(name):
    return urllib.parse.quote(read_file(name))


def configure_proxy(tenant, ingress_rules):
    data = {
        "access_reason": "test decrypt",
        "client_identity": {
            "certificate": read_file(
                "backend/external_tools/ditto/src/dummy_cert/client.crt"
            ),
            "key": read_file("backend/external_tools/ditto/src/dummy_cert/client.key"),
        },
        "headers": [{"name": "my-test-header", "value": "my-test-value"}],
        "ingress_settings": {"rules": ingress_rules, "content_type": "json"}
        if len(ingress_rules) > 0
        else None,
        "method": "POST",
        "name": "test config",
        "pinned_server_certificates": [
            read_file("backend/external_tools/ditto/src/dummy_cert/server.crt"),
        ],
        "secret_headers": [{"name": "my-secret-header", "value": "footprintrocks"}],
        "url": "https://ditto.footprint.dev:8443",
    }

    body = post(
        "org/proxy_configs/",
        data,
        tenant.sk.key,
    )
    assert body["id"]
    return body["id"]


class TestVaultProxy:
    def test_proxy_basic(self, sandbox_tenant):
        # create the vault
        body = post("users/", None, sandbox_tenant.sk.key)
        user = body
        fp_id = user["id"]
        assert fp_id

        # post data to it
        data = {
            "custom.ach_account_number": "123467890",
            "custom.cc4": "4242",
            **ID_DATA,
        }
        patch(f"entities/{fp_id}/vault", data, sandbox_tenant.sk.key)

        # specify the ditto server
        ditto_url = "https://ditto.footprint.dev"

        # send the proxy request
        data = {
            "full_name": f"{{{{ {fp_id}.id.first_name }}}} {{{{ {fp_id}.id.last_name }}}}",
            "last4_credit_card": f"{{{{ {fp_id}.custom.cc4 }}}}",
            "ach": f"{{{{ {fp_id}.custom.ach_account_number }}}}",
            "zip": f"{{{{ {fp_id}.id.zip }}}}",
        }

        response = _make_request(
            method=requests.post,
            path="vault_proxy/jit",
            data=data,
            params=None,
            status_code=200,
            auths=[
                sandbox_tenant.sk.key,
                FwdTestHeader("test1234"),
                ProxyDestinationHeader(ditto_url),
                ProxyAccessReason("test reason"),
            ],
            files=None,
        )

        # test the header came in
        assert response.headers["test-header"] == "test1234"

        # test the body came in
        result = response.json()

        assert result["ach"] == "123467890"
        assert result["last4_credit_card"] == "4242"

        first = ID_DATA["id.first_name"]
        last = ID_DATA["id.last_name"]
        assert result["full_name"] == f"{first} {last}"
        assert result["zip"] == ID_DATA["id.zip"]

    def test_proxy_tls(self, sandbox_tenant):
        # create the vault
        body = post("users/", None, sandbox_tenant.sk.key)
        user = body
        fp_id = user["id"]
        assert fp_id

        # post data to it
        data = {
            "custom.test_field": "hello world",
            **ID_DATA,
        }
        patch(f"entities/{fp_id}/vault", data, sandbox_tenant.sk.key)

        # specify the ditto server
        ditto_url = "https://ditto.footprint.dev:8443"

        # send the proxy request
        data = {
            "message": f"{{{{ {fp_id}.custom.test_field }}}}",
        }

        response = _make_request(
            method=requests.post,
            path="vault_proxy/jit",
            data=data,
            params=None,
            status_code=200,
            auths=[
                sandbox_tenant.sk.key,
                FwdTestHeader("test1234"),
                ProxyDestinationHeader(ditto_url),
                ProxyAccessReason("test reason"),
                ProxyClientCertPem(
                    read_pem_file_to_header_encoded(
                        "backend/external_tools/ditto/src/dummy_cert/client.crt"
                    )
                ),
                ProxyClientKeyPem(
                    read_pem_file_to_header_encoded(
                        "backend/external_tools/ditto/src/dummy_cert/client.key"
                    )
                ),
                ProxyServerCertPem(
                    read_pem_file_to_header_encoded(
                        "backend/external_tools/ditto/src/dummy_cert/server.crt"
                    )
                ),
            ],
            files=None,
        )

        # test the header came in
        assert response.headers["test-header"] == "test1234"
        assert (
            response.headers["x-ditto-client-cert-serial"]
            == "343209874978310929631036272380933492716043115756"
        )

        # test the body came in
        result = response.json()

        assert result["message"] == "hello world"

    def test_ingress(self, sandbox_tenant):
        # create the vault
        body = post("users/", None, sandbox_tenant.sk.key)
        user = body
        fp_id = user["id"]
        assert fp_id

        # post data to it
        data = {
            "custom.test_field": "hello world",
            **ID_DATA,
        }
        patch(f"entities/{fp_id}/vault", data, sandbox_tenant.sk.key)

        # specify the ditto server
        ditto_url = "https://ditto.footprint.dev"

        # send the proxy request
        # note the card number here is to simulate data coming back
        # for the proxy to ingress vault
        data = {"data": {"card_number": "12345678910"}}

        response = _make_request(
            method=requests.post,
            path="vault_proxy/jit",
            data=data,
            params=None,
            status_code=200,
            auths=[
                sandbox_tenant.sk.key,
                FwdTestHeader("test1234"),
                ProxyDestinationHeader(ditto_url),
                ProxyAccessReason("test reason"),
                ProxyIngressRule(f"{fp_id}.custom.card_number=$.data.card_number"),
                ProxyIngressContentType("json"),
            ],
            files=None,
        )

        result = response.json()
        assert result["data"]["card_number"] == f"{fp_id}.custom.card_number"

        data = dict(reason="test", fields=["custom.card_number"])
        response = post(f"entities/{fp_id}/vault/decrypt", data, sandbox_tenant.sk.key)
        assert response["custom.card_number"] == "12345678910"

    def test_proxy_config(self, sandbox_tenant):
        # create the proxy config
        proxy_id = configure_proxy(
            sandbox_tenant,
            [{"target": "$.data.card_number", "token": "custom.card_number"}],
        )

        # create the vault
        body = post("users/", None, sandbox_tenant.sk.key)
        user = body
        fp_id = user["id"]
        assert fp_id

        # post data to it
        data = {
            "custom.message": "hello world",
            **ID_DATA,
        }
        patch(f"entities/{fp_id}/vault", data, sandbox_tenant.sk.key)

        # fire the proxy request
        data = {
            "full_name": f"{{{{ {fp_id}.id.first_name }}}} {{{{ {fp_id}.id.last_name }}}}",
            # here we test the token assignment also works for egress
            "msg": "{{ custom.message }}",
            "data": {"card_number": "4242424242424242424"},
        }

        response = _make_request(
            method=requests.post,
            path=f"vault_proxy/{proxy_id}",
            data=data,
            params=None,
            status_code=200,
            auths=[
                sandbox_tenant.sk.key,
                ProxyTokenAssignment(fp_id),
            ],
            files=None,
        )

        # test the header came in
        assert response.headers["my-secret-header"] == "footprintrocks"
        assert response.headers["my-test-header"] == "my-test-value"

        # test the body came in
        result = response.json()
        # print(result)

        first = ID_DATA["id.first_name"]
        last = ID_DATA["id.last_name"]
        assert result["full_name"] == f"{first} {last}"
        assert result["msg"] == "hello world"

        data = dict(reason="test", fields=["custom.card_number"])
        response = post(f"entities/{fp_id}/vault/decrypt", data, sandbox_tenant.sk.key)
        assert response["custom.card_number"] == "4242424242424242424"

    def test_get_patch_deactivate_proxy_config(self, sandbox_tenant):
        proxy_id = configure_proxy(
            sandbox_tenant,
            [{"target": "$.data.card_number", "token": "custom.card_number"}],
        )

        proxy_config = get(f"org/proxy_configs/{proxy_id}", None, sandbox_tenant.sk.key)
        assert proxy_config["id"] == proxy_id
        assert len(proxy_config["headers"]) == 1
        assert len(proxy_config["secret_headers"]) == 1
        assert len(proxy_config["pinned_server_certificates"]) == 1

        data = {
            "access_reason": "test decrypt2",
            "name": "test config2",
            "status": "disabled",
            "pinned_server_certificates": [
                read_file("backend/external_tools/ditto/src/dummy_cert/server.crt"),
                GOOGLE_CERT,
            ],
            "headers": [],
            "add_secret_headers": [
                {"name": "my-secret-header2", "value": "twofootprintrocks"},
            ],
        }

        new_proxy_config = patch(
            f"org/proxy_configs/{proxy_id}",
            data,
            sandbox_tenant.sk.key,
        )

        assert new_proxy_config["access_reason"] == "test decrypt2"
        assert new_proxy_config["name"] == "test config2"
        assert new_proxy_config["status"] == "disabled"
        assert len(new_proxy_config["secret_headers"]) == 2
        assert len(new_proxy_config["pinned_server_certificates"]) == 2
        assert len(new_proxy_config["headers"]) == 0

        post(
            f"org/proxy_configs/{proxy_id}/deactivate",
            None,
            sandbox_tenant.sk.key,
        )

        get(
            f"org/proxy_configs/{proxy_id}",
            None,
            sandbox_tenant.sk.key,
            status_code=404,
        )

        response = _make_request(
            method=requests.post,
            path=f"vault_proxy/{proxy_id}",
            data={},
            params=None,
            status_code=404,
            auths=[
                sandbox_tenant.sk.key,
            ],
            files=None,
        )

    def test_ingress_non_custom(self, sandbox_tenant):
        # create the vault
        body = post("users/", None, sandbox_tenant.sk.key)
        user = body
        fp_id = user["id"]
        assert fp_id

        # post data to it
        data = {
            "id.first_name": "Bob",
            "id.last_name": "Boberto",
            "id.dob": "1990-12-12",
            "id.ssn9": "121-12-1212",
            "custom.test_field": "hello world",
            **ID_DATA,
        }
        patch(f"entities/{fp_id}/vault", data, sandbox_tenant.sk.key)

        # specify the ditto server
        ditto_url = "https://ditto.footprint.dev"

        # send the proxy request
        # ditto will simulate this data for the proxy to ingress vault
        data = {
            "data": {
                "date_of_birth": "1950-01-01",
                "card_number": "42424242424242",
                "card_cvc": 4242,
            }
        }

        response = _make_request(
            method=requests.post,
            path="vault_proxy/jit",
            data=data,
            params=None,
            status_code=200,
            auths=[
                sandbox_tenant.sk.key,
                ProxyDestinationHeader(ditto_url),
                ProxyAccessReason("test reason"),
                ProxyTokenAssignment(fp_id),
                ProxyIngressRule(
                    "card.primary.number=$.data.card_number,card.primary.cvc=$.data.card_cvc,id.dob=$.data.date_of_birth"
                ),
                ProxyIngressContentType("json"),
            ],
            files=None,
        )

        result = response.json()
        assert result["data"]["card_number"] == f"{fp_id}.card.primary.number"
        assert result["data"]["card_cvc"] == f"{fp_id}.card.primary.cvc"
        assert result["data"]["date_of_birth"] == f"{fp_id}.id.dob"

        data = dict(
            reason="test",
            fields=[
                "id.ssn9",
                "id.dob",
                "card.primary.number",
                "card.primary.cvc",
            ],
        )
        response = post(f"entities/{fp_id}/vault/decrypt", data, sandbox_tenant.sk.key)
        assert response["id.ssn9"] == "121121212"
        assert response["id.dob"] == "1950-01-01"
        assert response["card.primary.number"] == "42424242424242"
        assert response["card.primary.cvc"] == "4242"

    def test_ingress_document(self, sandbox_tenant):
        # create the vault
        body = post("users/", None, sandbox_tenant.sk.key)
        user = body
        fp_id = user["id"]
        assert fp_id

        # post data to it
        data = {
            **ID_DATA,
        }
        patch(f"entities/{fp_id}/vault", data, sandbox_tenant.sk.key)

        # specify the ditto server
        ditto_url = "https://ditto.footprint.dev"

        # send the proxy request
        # ditto will simulate this data for the proxy to ingress vault
        from .image_fixtures import test_image

        data = {
            "data": {
                "id_card": test_image,
            }
        }

        response = _make_request(
            method=requests.post,
            path="vault_proxy/jit",
            data=data,
            params=None,
            status_code=200,
            auths=[
                sandbox_tenant.sk.key,
                ProxyDestinationHeader(ditto_url),
                ProxyAccessReason("test reason"),
                ProxyTokenAssignment(fp_id),
                ProxyIngressRule("document.drivers_license.front=$.data.id_card"),
                ProxyIngressContentType("json"),
            ],
            files=None,
        )

        result = response.json()
        assert result["data"]["id_card"] == f"{fp_id}.document.drivers_license.front"

        data = dict(
            reason="test",
            fields=[
                "document.drivers_license.front",
            ],
        )
        response = post(f"entities/{fp_id}/vault/decrypt", data, sandbox_tenant.sk.key)
        assert response["document.drivers_license.front"] == test_image


### Tests to do ###
# - ingress biz data
