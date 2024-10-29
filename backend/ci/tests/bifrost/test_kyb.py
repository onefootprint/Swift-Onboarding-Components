import pytest
from tests.bifrost.test_triggers import send_trigger
from tests.identify_client import IdentifyClient
from tests.utils import (
    HttpError,
    get,
    patch,
    post,
    get_requirement_from_requirements,
    create_ob_config,
)
from tests.bifrost_client import BifrostClient
from tests.constants import (
    BUSINESS_SECONDARY_BOS,
    FIXTURE_PHONE_NUMBER,
)


@pytest.fixture(scope="session")
def incomplete_bifrost(kyb_sandbox_ob_config, kyb_cdos):
    bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    business_requirement = bifrost.get_requirement("collect_business_data")
    assert set(business_requirement["missing_attributes"]) == set(kyb_cdos)
    return bifrost


@pytest.fixture(scope="session")
def allow_reonboard_kyb_playbook(sandbox_tenant, must_collect_data, kyb_cdos):
    cdos = must_collect_data + kyb_cdos
    return create_ob_config(
        sandbox_tenant, "Allow-reonboard KYB", cdos, kind="kyb", allow_reonboard=True
    )


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
    # Can't hit PATCH /hosted/business/vault without a business vault
    body = patch("hosted/business/vault", {}, bifrost.auth_token, status_code=403)
    assert (
        body["message"]
        == "Error loading session for header X-Fp-Authorization: Not allowed without business"
    )


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


def test_kyb_ownership_stake_explanation(sandbox_tenant, kyb_sandbox_ob_config):
    # If we make a BO with ownership stakes adding to <= 75%, we should be able to add an explanation
    bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    bifrost.data["business.primary_owner_stake"] = 50
    bifrost.data["business.beneficial_owner_explanation_message"] = "I am the boss"
    user = bifrost.run()

    body = get(f"entities/{user.fp_bid}", None, *sandbox_tenant.db_auths)
    d = next(
        i
        for i in body["data"]
        if i["identifier"] == "business.beneficial_owner_explanation_message"
    )
    assert d["value"] == "I am the boss"

    # But if the ownership stakes add up to > 75%, we should not be able to add an explanation
    bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    bifrost.data["business.primary_owner_stake"] = 76
    bifrost.data["business.beneficial_owner_explanation_message"] = "I am the boss"
    user = bifrost.run()
    body = get(f"entities/{user.fp_bid}", None, *sandbox_tenant.db_auths)
    assert not any(
        i["identifier"] == "business.beneficial_owner_explanation_message"
        for i in body["data"]
    )


def test_kyb_select_existing_business(sandbox_tenant, kyb_sandbox_ob_config):
    """
    Test selecting an existing business in onboarding
    """
    # Make a user with biz1
    bifrost1 = BifrostClient.new_user(kyb_sandbox_ob_config)
    bifrost1.data["business.name"] = "Biz 1"
    user1 = bifrost1.run()
    user1_info = get("hosted/user/private/token", None, bifrost1.auth_token)

    # Log into the same user and make biz2
    bifrost2 = BifrostClient.login_user(kyb_sandbox_ob_config, bifrost1.sandbox_id)
    bifrost2.data["business.name"] = "Biz 2"
    bifrost2.handle_one_requirement("collect_business_data")
    user2_info = get("hosted/user/private/token", None, bifrost2.auth_token)
    fp_bid2 = user2_info["fp_bid"]
    body = get(f"businesses/{fp_bid2}/onboardings", None, sandbox_tenant.s_sk)
    assert not body["data"]

    assert (
        user1_info["wf_id"] == user2_info["wf_id"]
    ), "Feature (maybe bug) - we reuse the user workflow"

    # Inspect the list of businesses to select from
    body = get(f"hosted/businesses", None, bifrost1.auth_token)
    assert len(body) == 2
    biz_id2 = body[0]["id"]
    assert body[0]["name"] == "Biz 2"
    assert body[0]["is_incomplete"]
    biz_id1 = body[1]["id"]
    assert body[1]["name"] == "Biz 1"
    assert not body[1]["is_incomplete"]

    def onboard_and_select(biz_id, fp_bid, token_info):
        bifrost = BifrostClient.login_user(
            kyb_sandbox_ob_config, bifrost1.sandbox_id, inherit_business_id=biz_id
        )
        user_second_run = bifrost.run()
        req = next(
            i
            for i in bifrost.handled_requirements
            if i["kind"] == "create_business_onboarding"
        )
        assert req["requires_business_selection"]

        assert user_second_run.fp_id == user1.fp_id
        assert user_second_run.fp_bid == fp_bid
        assert bifrost.validate_response["user"]["status"] == "pass"
        assert bifrost.validate_response["business"]["status"] == "pass"
        assert not any(
            i["kind"] == "collect_business_data" for i in bifrost.handled_requirements
        )
        # Should have inherited the same user and business workflows
        info = get("hosted/user/private/token", None, bifrost1.auth_token)
        assert info["wf_id"] == token_info["wf_id"]
        assert info["biz_wf_id"] == token_info["biz_wf_id"]

        body = get(f"businesses/{user1.fp_bid}/onboardings", None, sandbox_tenant.s_sk)
        assert len(body["data"]) == 1
        return bifrost

    # Go through the flow again, select Biz 1 which is already complete. This should no-op
    bifrost = onboard_and_select(biz_id1, user1.fp_bid, user1_info)
    assert not any(
        i["kind"] == "collect_business_data" for i in bifrost.handled_requirements
    ), "No biz data requirement since the workflow is complete"

    # Go through the flow again, select Biz 2 which is incomplete. This should inherit the old workflow
    bifrost = onboard_and_select(biz_id2, fp_bid2, user1_info)
    assert any(
        i["kind"] == "collect_business_data" for i in bifrost.already_met_requirements
    ), "Completed biz data requirement for the incomplete workflow"

    # After all of this, there should only be one user workflow
    body = get(f"users/{user1.fp_id}/onboardings", None, sandbox_tenant.s_sk)
    assert len(body["data"]) == 1


def test_kyb_must_own_existing_business(kyb_sandbox_ob_config):
    bifrost1 = BifrostClient.new_user(kyb_sandbox_ob_config)
    bifrost1.data["business.name"] = "Biz 1"
    bifrost1.run()
    biz_id1 = get("hosted/businesses", None, bifrost1.auth_token)[0]["id"]

    with pytest.raises(HttpError) as e:
        BifrostClient.new_user(kyb_sandbox_ob_config, inherit_business_id=biz_id1)
    assert (
        e.value.json()["message"]
        == "Could not find the requested business owned by the user."
    )


def test_cannot_select_business_for_redo(kyb_sandbox_ob_config, sandbox_tenant):
    bifrost = BifrostClient.new_user(kyb_sandbox_ob_config)
    bifrost.data["business.name"] = "Biz 1"
    user = bifrost.run()
    biz_id1 = get("hosted/businesses", None, bifrost.auth_token)[0]["id"]

    trigger = dict(
        kind="onboard",
        data=dict(playbook_id=bifrost.ob_config.id, reuse_existing_bo_kyc=True),
    )
    auth_token = send_trigger(user.fp_id, sandbox_tenant, trigger, user.fp_bid)
    auth_token = IdentifyClient.from_token(auth_token).step_up(
        assert_had_no_scopes=True
    )

    # Should not be able to provide a business ID, since the session already has a business attached
    with pytest.raises(HttpError) as e:
        BifrostClient.raw_auth(
            kyb_sandbox_ob_config,
            auth_token,
            bifrost.sandbox_id,
            inherit_business_id=biz_id1,
        )
    assert (
        e.value.json()["message"]
        == "Cannot provide business ID when a scoped business is already attached"
    )

    # But should be able to call POST /hosted/onboarding without a business ID
    bifrost = BifrostClient.raw_auth(
        kyb_sandbox_ob_config, auth_token, bifrost.sandbox_id
    )
    fp_bid = get("hosted/user/private/token", None, bifrost.auth_token)["fp_bid"]
    assert fp_bid == user.fp_bid
