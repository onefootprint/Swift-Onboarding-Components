from tests.utils import _make_request
from tests.auth import BaseAuth
import pytest
from tests.utils import url
from tests.utils import post, get, put, build_user_data
import requests
from aiohttp import web
import asyncio
import threading
import os

class FwdTestHeader(BaseAuth):
    HEADER_NAME = "x-fpp-test-header"


class ProxyDestinationHeader(BaseAuth):
    HEADER_NAME = "x-fp-proxy-target"


class ProxyDestinationMethod(BaseAuth):
    HEADER_NAME = "x-fp-proxy-method"


class ProxyAccessReason(BaseAuth):
    HEADER_NAME = "x-fp-proxy-access-reason"


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

        # start the ditto server
        ditto_url = start_ditto_server_or_use_remote_server()

        # send the proxy request
        data = {
            "full_name": f"::${fp_id}.identity.first_name:: ::${fp_id}.identity.last_name::",
            "last4_credit_card": f"::${fp_id}.custom.cc4::",
            "ach": f"::${fp_id}.custom.ach_account_number::",
            "ssn": f"::${fp_id}.identity.ssn9::",
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
                ProxyAccessReason("test reason")
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


# either start a local ditto server or use a remote one
def start_ditto_server_or_use_remote_server():
    remote_ditto_url = os.getenv("DITTO_URL")
    if remote_ditto_url is None:
        port = 8787
        t = start_ditto_server(port)
        return f"http://localhost:{port}/"

    return remote_ditto_url

# This starts up a simple "ditto" server that
# simply echos headers + body from the request
# to simplify testing
def start_ditto_server(port):
    def server():
        async def ditto_handler(request):
            body = await request.text()
            response = web.Response(headers=request.headers, body=body)
            await response.prepare(request)
            return response

        app = web.Application()
        app.router.add_post("/", ditto_handler)
        runner = web.AppRunner(app)
        return runner

    def run_server(runner, port):
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(runner.setup())
        site = web.TCPSite(runner, 'localhost', port)
        loop.run_until_complete(site.start())
        loop.run_forever()

    app = server()
    t = threading.Thread(target=run_server, args=(app, port,), daemon=True)
    t.start()

    return t
