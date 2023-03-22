import pytest
from tests.utils import (
    put,
    post,
    get_requirement_from_requirements,
    file_contents,
    multipart_file,
)
from tests.bifrost_client import BifrostClient
from tests.dashboard.test_investor_profile import sb_user_with_investor_profile


@pytest.fixture(scope="session")
def sandbox_user(investor_profile_ob_config, twilio):
    bifrost_client = BifrostClient(investor_profile_ob_config)
    auth_token = bifrost_client.init_user_for_onboarding(twilio)
    bifrost_client.initialize_onboarding()
    requirements = bifrost_client.get_requirements()
    ip_requirement = get_requirement_from_requirements(
        "collect_investor_profile", requirements
    )
    assert "investor_profile" in ip_requirement["missing_attributes"]
    return bifrost_client


def test_put_ip_info_valid(sandbox_user, ip_data):
    post("hosted/user/vault/validate", ip_data, sandbox_user.auth_token)
    put("hosted/user/vault", ip_data, sandbox_user.auth_token)


@pytest.mark.parametrize(
    "key,value,expected_error",
    [
        ("investor_profile.occupation", "", "Invalid length"),
        ("investor_profile.brokerage_firm_employer", "", "Invalid length"),
        ("investor_profile.annual_income", "10000000000", "Matching variant not found"),
        ("investor_profile.net_worth", "0", "Matching variant not found"),
        (
            "investor_profile.investment_goals",
            '["hi", "grow_long_term_wealth"]',
            "Matching variant not found",
        ),
        ("investor_profile.investment_goals", "[]", "Invalid length"),
        (
            "investor_profile.risk_tolerance",
            "really high",
            "Matching variant not found",
        ),
        (
            "investor_profile.declarations",
            '["hi", "grow_long_term_wealth"]',
            "Matching variant not found",
        ),
    ],
)
def test_put_ip_info_invalid(sandbox_user, ip_data, key, value, expected_error):
    ip_data = {
        **ip_data,
        key: value,
    }
    body = post(
        "hosted/user/vault/validate", ip_data, sandbox_user.auth_token, status_code=400
    )
    assert expected_error in body["error"]["message"][key]

    body = put("hosted/user/vault", ip_data, sandbox_user.auth_token, status_code=400)
    assert expected_error in body["error"]["message"][key]


def test_put_ip_info_incomplete_data(sandbox_user):
    data = {"investor_profile.occupation": "Penguin veterinarian"}
    # Should not be able to provide single pieces of data without addl_headers
    post(
        "hosted/user/vault/validate",
        data,
        sandbox_user.auth_token,
        status_code=400,
    )

    # But, when we provide this special header, should silence that error
    addl_headers = {
        "x-fp-allow-extra-fields": "true",
    }
    post(
        "hosted/user/vault/validate",
        data,
        sandbox_user.auth_token,
        addl_headers=addl_headers,
    )

    # The non-speculative endpoint should never accept this header
    put(
        "hosted/user/vault",
        data,
        sandbox_user.auth_token,
        status_code=400,
        addl_headers=addl_headers,
    )


class TestDocuments:
    def test_invalid_upload(self, sandbox_user):
        res = post(
            "/hosted/user/upload/document.finra_compliance_letter",
            None,
            sandbox_user.auth_token,
            files=multipart_file("example_txt.txt", "text/plain"),
            status_code=400,
        )
        assert "image upload error: invalid file type" == res["error"]["message"]

    def test_valid_upload(self, sandbox_user, ip_data, sandbox_tenant):
        user = sandbox_user.onboard_user_onto_tenant(
            sandbox_tenant,
            investor_profile=ip_data,
            document_file=multipart_file("example_pdf.pdf", "application/pdf"),
        )

        res = post(
            f"/users/{user.fp_user_id}/vault/document/decrypt",
            {
                "kind": "finra_compliance_letter",
                "reason": "show me",
            },
            sandbox_tenant.sk.key,
            raw_response=True,
        )
        assert "application/pdf" == res.headers["content-type"]
        assert (file_contents("example_pdf.pdf"), res.content)
