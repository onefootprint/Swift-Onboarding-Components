import json
import pytest
from tests.utils import (
    patch,
    post,
    get_requirement_from_requirements,
    file_contents,
    open_multipart_file,
    get,
)
from tests.constants import IP_DATA
from tests.bifrost_client import BifrostClient
import base64


@pytest.fixture(scope="function")
def incomplete_client(investor_profile_ob_config):
    """
    Sandbox user partially onboarded onto an ob config requiring investor profile
    """
    bifrost = BifrostClient.new_user(investor_profile_ob_config)
    requirements = bifrost.get_status()["all_requirements"]
    ip_requirements = get_requirement_from_requirements(
        "collect_investor_profile", requirements
    )
    assert "investor_profile" in ip_requirements["missing_attributes"]
    return bifrost


@pytest.mark.parametrize(
    "key,value,expected_error",
    [
        ("investor_profile.occupation", "", "Invalid length"),
        ("investor_profile.brokerage_firm_employer", "", "Invalid length"),
        ("investor_profile.annual_income", "10000000000", "Matching variant not found"),
        ("investor_profile.net_worth", "0", "Matching variant not found"),
        (
            "investor_profile.investment_goals",
            ["hi", "grow_long_term_wealth"],
            "Matching variant not found",
        ),
        ("investor_profile.investment_goals", [], "Invalid length"),
        (
            "investor_profile.risk_tolerance",
            "really high",
            "Matching variant not found",
        ),
        (
            "investor_profile.declarations",
            ["hi", "grow_long_term_wealth"],
            "Matching variant not found",
        ),
    ],
)
def test_put_ip_info_invalid(incomplete_client, key, value, expected_error):
    auth_token = incomplete_client.auth_token
    data = {
        **IP_DATA,
        key: value,
    }
    body = post("hosted/user/vault/validate", data, auth_token, status_code=400)
    assert body["code"] == "T120"
    assert expected_error in body["context"][key]

    body = patch("hosted/user/vault", data, auth_token, status_code=400)
    assert body["code"] == "T120"
    assert expected_error in body["context"][key]


def test_put_ip_info_incomplete_data(incomplete_client):
    auth_token = incomplete_client.auth_token
    data = {"investor_profile.occupation": "Penguin veterinarian"}
    # Should not be able to provide single pieces of data without addl_headers
    post("hosted/user/vault/validate", data, auth_token, status_code=400)

    # But, when we provide this special header, should silence that error
    addl_headers = {"x-fp-allow-extra-fields": "true"}
    post("hosted/user/vault/validate", data, auth_token, addl_headers=addl_headers)

    # The non-speculative endpoint should never accept this header
    patch(
        "hosted/user/vault",
        data,
        auth_token,
        status_code=400,
        addl_headers=addl_headers,
    )


def test_document_requirement(incomplete_client):
    auth_token = incomplete_client.auth_token

    requirements = incomplete_client.get_status()["all_requirements"]
    req = next(r for r in requirements if r["kind"] == "collect_investor_profile")
    assert not req["missing_document"]

    # When we add a specific declaration, we should now have a missing requirement
    data = {**IP_DATA, "investor_profile.declarations": ["affiliated_with_us_broker"]}
    patch("hosted/user/vault", data, auth_token)
    requirements = incomplete_client.get_status()["all_requirements"]
    req = next(r for r in requirements if r["kind"] == "collect_investor_profile")
    assert req["missing_document"]


def test_invalid_doc_upload(incomplete_client):
    res = post(
        "/hosted/user/upload/document.finra_compliance_letter",
        None,
        incomplete_client.auth_token,
        files=open_multipart_file("example_txt.txt", "text/plain")(),
        status_code=400,
    )
    assert res["message"] == "Invalid file type"


def test_valid_doc_upload(incomplete_client, sandbox_tenant):
    user = incomplete_client.run()

    data = dict(
        reason="test decrypt finra",
        fields=["document.finra_compliance_letter"],
    )
    response = post(f"/users/{user.fp_id}/vault/decrypt", data, sandbox_tenant.sk.key)
    assert file_contents("example_pdf.pdf") == base64.b64decode(
        response["document.finra_compliance_letter"]
    )


# Case where user re-uploads the same doc (ie uploaded the wrong doc and uploads a new corrected version)
def test_doc_reupload(sandbox_tenant, investor_profile_ob_config):
    bifrost = BifrostClient.new_user(investor_profile_ob_config)
    # First upload one document
    bifrost.handle_ip_doc()
    # Then change the document and run again
    bifrost.data["document.finra_compliance_letter"] = open_multipart_file(
        "example_pdf2.pdf", "application/pdf"
    )
    user = bifrost.run()

    data = dict(
        reason="show me",
        fields=["document.finra_compliance_letter"],
    )
    response = post(f"/users/{user.fp_id}/vault/decrypt", data, sandbox_tenant.sk.key)
    res_content = base64.b64decode(response["document.finra_compliance_letter"])

    assert file_contents("example_pdf2.pdf") == res_content
    assert file_contents("example_pdf.pdf") != res_content
