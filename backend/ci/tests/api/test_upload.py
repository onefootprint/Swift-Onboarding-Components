import pytest
from tests.utils import post, patch
import hmac
import hashlib


def test_large_objects(sandbox_tenant):
    body = post("users/", None, sandbox_tenant.sk.key)
    user = body
    fp_id = user["id"]
    assert fp_id

    data = {
        "id.first_name": "billy",
        "id.last_name": "bob",
    }
    body = patch(f"users/{fp_id}/vault", data, sandbox_tenant.sk.key)

    di = "custom.large_id"
    obj = {"some_key": "hello world!" * 25}

    post(f"users/{fp_id}/vault/{di}/upload", obj, sandbox_tenant.sk.key)

    resp = post(
        f"entities/{fp_id}/vault/decrypt",
        {
            "fields": [di, "id.first_name"],
            "reason": "i wanna2",
        },
        sandbox_tenant.sk.key,
    )

    import base64, json

    assert resp["id.first_name"] == "billy"
    assert resp[di]
    obj_out = base64.b64decode(resp[di])
    assert json.loads(obj_out)["some_key"] == obj["some_key"]

    # test the integrity hash
    # nosemgrep
    signing_key = "a1f928d87278290bf9dece075d0e46330a01d21b346073f4f193739078dca458"

    resp = post(
        f"entities/{fp_id}/vault/integrity",
        dict(fields=list([di]), signing_key=signing_key),
        sandbox_tenant.sk.key,
    )
    expected = hmac.new(
        bytes.fromhex(signing_key),
        msg=obj_out,
        digestmod=hashlib.sha256,
    ).hexdigest()
    assert resp[di] == expected


@pytest.mark.skip(reason="hangs indefinitely")
def test_too_large_object_upload(sandbox_tenant):
    body = post("users/", None, sandbox_tenant.sk.key)
    user = body
    fp_id = user["id"]
    assert fp_id

    di = "custom.large_id2"
    obj = {"some_key": "helloworld" * 1_200_000}  # over 10MB

    import aiohttp, asyncio

    # need to use a different http client because requests hangs! wow python
    # ridiculous issue they won't fix: https://github.com/psf/requests/issues/2165
    async def run():
        from tests.utils import url

        async with aiohttp.ClientSession() as session:
            async with session.post(
                url(
                    f"users/{fp_id}/vault/{di}/upload",
                ),
                json=obj,
                headers={"x-footprint-secret-key": sandbox_tenant.sk.key.value},
            ) as response:
                print("got response", response)
                return (response.status, await response.json())

    (status, body) = asyncio.run(run())
    assert status == 400
    assert (
        body["message"] == "The request is too large, max size accepted is 10485760 KB."
    )
