import pytest
from tests.utils import (
    get,
    patch,
    post,
    get_requirement_from_requirements,
    create_ob_config,
)
from tests.bifrost_client import BifrostClient
from tests.constants import BUSINESS_SECONDARY_BOS, FIXTURE_PHONE_NUMBER


@pytest.fixture(scope="session")
def incomplete_bifrost(kyb_sandbox_ob_config, kyb_cdos):
    bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    requirements = bifrost.get_status()["all_requirements"]
    business_requirement = get_requirement_from_requirements(
        "collect_business_data", requirements
    )
    assert set(business_requirement["missing_attributes"]) == set(kyb_cdos)
    return bifrost


@pytest.mark.parametrize(
    "business_data,expected_status_code",
    [
        ({"business.name": "Flerp"}, 200),
        ({"business.tin": "12-0987654"}, 200),
        (
            {
                "business.name": "Flerp",
                "business.website": "flerp.com",
                "business.phone_number": FIXTURE_PHONE_NUMBER,
                "business.tin": "123-45-1234",
                "business.address_line1": "One Footprint Way",
                "business.city": "Hayes Valley",
                "business.state": "CA",
                "business.zip": "12345",
                "business.country": "US",
            },
            200,
        ),
        (
            {"business.phone_number": "i am not a phone number"},
            400,
        ),
        (
            {
                "business.address_line1": "One Footprint Way",
                "business.city": "Hayes Valley",
                "business.state": "CA",
                "business.zip": "blerp i am not a zip code!",
                "business.country": "US",
            },
            400,
        ),
        (
            {
                "business.address_line1": "One Footprint Way",
                "business.city": "Hayes Valley",
                "business.state": "CA",
                "business.zip": "94117",
                "business.country": "Blerp I am not a country",
            },
            400,
        ),
        ({"id.ssn4": "1234"}, 400),
    ],
)
def test_put_business_vault(incomplete_bifrost, business_data, expected_status_code):
    post(
        "hosted/business/vault/validate",
        business_data,
        incomplete_bifrost.auth_token,
        status_code=expected_status_code,
    )
    patch(
        "hosted/business/vault",
        business_data,
        incomplete_bifrost.auth_token,
        status_code=expected_status_code,
    )


def test_put_business_vault_not_authorized(sandbox_tenant):
    bifrost = BifrostClient.new_user(sandbox_tenant.default_ob_config)
    auth_token = bifrost.auth_token
    # Can't hit PATCH /hosted/business/vault without a business vault
    patch("hosted/business/vault", {}, auth_token, status_code=403)


def test_one_click_kyb(kyb_sandbox_ob_config):
    bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    user = bifrost.run()

    sandbox_id = bifrost.sandbox_id
    bifrost2 = BifrostClient.inherit_user(kyb_sandbox_ob_config, sandbox_id)
    user2 = bifrost2.run()
    assert user.fp_id == user2.fp_id
    assert user.fp_bid
    assert user.fp_bid == user2.fp_bid


@pytest.mark.parametrize(
    "beneficial_owners",
    [
        "dont_collect",
        "collect_without_kyc",
        "collect_and_kyc",
    ],
)
def test_business_owners(sandbox_tenant, beneficial_owners):
    must_collect_data = []
    user_cdos = ["name", "ssn9", "full_address", "email", "phone_number", "nationality"]
    business_cdos = [
        "business_name",
        "business_tin",
        "business_address",
        "business_phone_number",
        "business_website",
    ]
    if beneficial_owners == "dont_collect":
        must_collect_data = business_cdos
        skip_kyc = True
    elif beneficial_owners == "collect_without_kyc":
        must_collect_data = business_cdos + user_cdos
        skip_kyc = True
    elif beneficial_owners == "collect_and_kyc":
        must_collect_data = (
            business_cdos + user_cdos + ["business_kyced_beneficial_owners"]
        )
        skip_kyc = False

    obc = create_ob_config(
        sandbox_tenant,
        f"KYB config BOs: {beneficial_owners}",
        must_collect_data,
        must_collect_data,
        skip_kyc=skip_kyc,
        kind="kyb",
    )
    fixture_result = "use_rules_outcome" if skip_kyc else "pass"
    bifrost = BifrostClient.new_user(
        obc, fixture_result=fixture_result, kyb_fixture_result="pass"
    )

    bifrost.data.update(BUSINESS_SECONDARY_BOS)
    user = bifrost.run()

    # Just because we're not running it in this test
    expected_status = "none" if skip_kyc else "pass"
    assert bifrost.validate_response["user"]["status"] == expected_status
    expected_business_status = (
        "incomplete" if beneficial_owners == "collect_and_kyc" else "pass"
    )
    assert bifrost.validate_response["business"]["status"] == expected_business_status

    # check biz insights, we only expect to see it if the business has completed onboarding and we
    # got a middesk response
    should_see_biz_insights = expected_business_status == "pass"
    insights_response = get(
        f"/entities/{user.fp_bid}/business_insights",
        None,
        *sandbox_tenant.db_auths,
        status_code=200 if should_see_biz_insights else 400,
    )

    if should_see_biz_insights:
        assert insights_response["details"]["entity_type"]


def test_skip_kyb(sandbox_tenant, must_collect_data):
    data = must_collect_data + [
        "business_name",
        "business_kyced_beneficial_owners",
        "business_address",
    ]
    obc = create_ob_config(
        sandbox_tenant, "skip_kyb", data, kind="kyb", verification_checks=[]
    )
    bifrost = BifrostClient.new_user(obc, fixture_result="use_rules_outcome")
    user = bifrost.run()
    # Business should have none status since no KYB rules ran
    assert bifrost.validate_response["business"]["status"] == "none"
    assert bifrost.validate_response["user"]["status"] == "pass"

    body = get(f"entities/{user.fp_id}", None, *sandbox_tenant.db_auths)
    assert body["status"] == "pass"
    body = get(f"entities/{user.fp_bid}", None, *sandbox_tenant.db_auths)
    assert body["status"] == "none"


def test_business_docs(sandbox_tenant, must_collect_data):
    data = must_collect_data + [
        "business_name",
        "business_kyced_beneficial_owners",
        "business_address",
    ]
    obc = create_ob_config(
        sandbox_tenant,
        "Biz documents",
        data,
        kind="kyb",
        business_documents_to_collect=[
            dict(
                kind="custom",
                data=dict(
                    name="Trust document",
                    identifier="document.custom.trust_document",
                    description="Please upload your trust document.",
                ),
            ),
        ],
    )
    bifrost = BifrostClient.new_user(obc, fixture_result="use_rules_outcome")
    user = bifrost.run()

    body = get(f"entities/{user.fp_bid}/documents", None, *sandbox_tenant.db_auths)
    assert body[0]["kind"] == "custom"
    assert body[0]["status"] == "complete"
    assert body[0]["review_status"] == "pending_human_review"
    assert body[0]["uploads"][0]["identifier"] == "document.custom.trust_document"
