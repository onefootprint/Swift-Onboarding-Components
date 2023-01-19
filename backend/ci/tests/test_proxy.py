from tests.utils import _make_request
from tests.auth import BaseAuth
import pytest
from tests.utils import url
from tests.utils import post, get, put, build_user_data
import requests
import urllib.parse


class FwdTestHeader(BaseAuth):
    HEADER_NAME = "x-fpp-test-header"


class ProxyDestinationHeader(BaseAuth):
    HEADER_NAME = "x-fp-proxy-target"


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


class ProxyId(BaseAuth):
    HEADER_NAME = "x-fp-proxy-id"


class ProxyIngressRuleTokenAssignment(BaseAuth):
    HEADER_NAME = "x-fp-proxy-ingress-rule-token"


def read_pem_file_to_header(name):
    import os

    absolute_path = os.path.dirname(__file__)
    path = absolute_path + "/../../../" + name
    with open(path, "r") as file:
        return file.read()


def read_pem_file_to_header_encoded(name):
    return urllib.parse.quote(read_pem_file_to_header(name))


def configure_proxy(tenant, ingress_rules):
    data = {
        "access_reason": "test decrypt",
        "client_identity": {
            "certificate": read_pem_file_to_header(
                "backend/components/ditto/src/dummy_cert/client.crt"
            ),
            "key": read_pem_file_to_header(
                "backend/components/ditto/src/dummy_cert/client.key"
            ),
        },
        "headers": [{"name": "my-test-header", "value": "my-test-value"}],
        "ingress_settings": {"rules": ingress_rules, "content_type": "json"}
        if len(ingress_rules) > 0
        else None,
        "method": "POST",
        "name": "test config",
        "pinned_server_certificates": [
            read_pem_file_to_header(
                "backend/components/ditto/src/dummy_cert/server.crt"
            ),
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
        user_data = build_user_data()
        data = {
            "identity": user_data,
            "custom": {"ach_account_number": "123467890", "cc4": "4242"},
        }
        put(f"users/{fp_id}/vault", data, sandbox_tenant.sk.key)

        # specify the ditto server
        ditto_url = "https://ditto.footprint.dev"

        # send the proxy request
        data = {
            "full_name": f"::${fp_id}.id.first_name:: ::${fp_id}.id.last_name::",
            "last4_credit_card": f"::${fp_id}.custom.cc4::",
            "ach": f"::${fp_id}.custom.ach_account_number::",
            "ssn": f"::${fp_id}.id.ssn9::",
        }
        response = _make_request(
            method=requests.post,
            path="proxy",
            data=data,
            params=None,
            status_code=200,
            auths=[
                sandbox_tenant.sk.key,
                FwdTestHeader("test1234"),
                ProxyDestinationHeader(ditto_url),
                ProxyAccessReason("test reason"),
            ],
        )

        # test the header came in
        assert response.headers["test-header"] == "test1234"

        # test the body came in
        result = response.json()

        assert result["ach"] == "123467890"
        assert result["last4_credit_card"] == "4242"

        first = user_data["name"]["first_name"]
        last = user_data["name"]["last_name"]
        assert result["full_name"] == f"{first} {last}"
        assert result["ssn"] == user_data["ssn9"]

    def test_proxy_tls(self, sandbox_tenant):
        # create the vault
        body = post("users/", None, sandbox_tenant.sk.key)
        user = body
        fp_id = user["id"]
        assert fp_id

        # post data to it
        user_data = build_user_data()
        data = {
            "identity": user_data,
            "custom": {"test_field": "hello world"},
        }
        put(f"users/{fp_id}/vault", data, sandbox_tenant.sk.key)

        # specify the ditto server
        ditto_url = "https://ditto.footprint.dev:8443"

        # send the proxy request
        data = {
            "message": f"::${fp_id}.custom.test_field::",
        }

        response = _make_request(
            method=requests.post,
            path="proxy",
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
                        "backend/components/ditto/src/dummy_cert/client.crt"
                    )
                ),
                ProxyClientKeyPem(
                    read_pem_file_to_header_encoded(
                        "backend/components/ditto/src/dummy_cert/client.key"
                    )
                ),
                ProxyServerCertPem(
                    read_pem_file_to_header_encoded(
                        "backend/components/ditto/src/dummy_cert/server.crt"
                    )
                ),
            ],
        )

        # test the header came in
        assert response.headers["test-header"] == "test1234"
        assert response.headers["x-ditto-client-cert-serial"] == "12431179266346922388"

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
        user_data = build_user_data()
        data = {
            "identity": user_data,
            "custom": {"test_field": "hello world"},
        }
        put(f"users/{fp_id}/vault", data, sandbox_tenant.sk.key)

        # specify the ditto server
        ditto_url = "https://ditto.footprint.dev"

        # send the proxy request
        # note the card number here is to simulate data coming back
        # for the proxy to ingress vault
        data = {"data": {"card_number": "12345678910"}}

        response = _make_request(
            method=requests.post,
            path="proxy",
            data=data,
            params=None,
            status_code=200,
            auths=[
                sandbox_tenant.sk.key,
                FwdTestHeader("test1234"),
                ProxyDestinationHeader(ditto_url),
                ProxyAccessReason("test reason"),
                ProxyIngressRule(f"${fp_id}.custom.card_number=$.data.card_number"),
                ProxyIngressContentType("json"),
            ],
        )

        result = response.json()
        assert result["data"]["card_number"] == f"${fp_id}.custom.card_number"

        data = dict(reason="test", fields=["custom.card_number"])
        response = post(f"users/{fp_id}/vault/decrypt", data, sandbox_tenant.sk.key)
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
        user_data = build_user_data()
        data = {
            "identity": user_data,
            "custom": {"message": "hello world"},
        }
        put(f"users/{fp_id}/vault", data, sandbox_tenant.sk.key)

        # fire the proxy request
        data = {
            "full_name": f"::${fp_id}.id.first_name:: ::${fp_id}.id.last_name::",
            "msg": f"::${fp_id}.custom.message::",
            "data": {"card_number": "4242424242424242424"},
        }

        response = _make_request(
            method=requests.post,
            path="proxy",
            data=data,
            params=None,
            status_code=200,
            auths=[
                sandbox_tenant.sk.key,
                ProxyId(proxy_id),
                ProxyIngressRuleTokenAssignment(fp_id),
            ],
        )

        # test the header came in
        assert response.headers["my-secret-header"] == "footprintrocks"
        assert response.headers["my-test-header"] == "my-test-value"

        # test the body came in
        result = response.json()
        # print(result)

        first = user_data["name"]["first_name"]
        last = user_data["name"]["last_name"]
        assert result["full_name"] == f"{first} {last}"
        assert result["msg"] == "hello world"

        data = dict(reason="test", fields=["custom.card_number"])
        response = post(f"users/{fp_id}/vault/decrypt", data, sandbox_tenant.sk.key)
        assert response["custom.card_number"] == "4242424242424242424"
