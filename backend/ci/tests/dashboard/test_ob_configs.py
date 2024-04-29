import pytest
from tests.utils import (
    get,
    post,
    patch,
    create_ob_config,
    _gen_random_sandbox_id,
)
from tests.headers import (
    PublishableOnboardingKey,
)
from tests.identify_client import IdentifyClient


@pytest.fixture(scope="session")
def ob_configuration(sandbox_tenant, must_collect_data, can_access_data):
    return create_ob_config(
        sandbox_tenant, "Test OB Config", must_collect_data, can_access_data
    )


@pytest.fixture(scope="session")
def inactive_ob_configuration(sandbox_tenant, must_collect_data, can_access_data):
    ob_config = create_ob_config(
        sandbox_tenant, "My inactive test OB Config", must_collect_data, can_access_data
    )
    data = dict(status="disabled")
    body = patch(
        f"org/onboarding_configs/{ob_config.id}",
        data,
        *sandbox_tenant.db_auths,
    )
    return body


def test_config_list(sandbox_tenant, ob_configuration, inactive_ob_configuration):
    body = get("org/onboarding_configs", None, *sandbox_tenant.db_auths)

    config = next(
        config for config in body["data"] if config["id"] == ob_configuration.id
    )
    assert config["key"] == ob_configuration.key.value
    assert config["name"] == ob_configuration.name
    assert config["must_collect_data"] == ob_configuration.must_collect_data
    assert config["can_access_data"] == ob_configuration.can_access_data
    assert config["status"] == ob_configuration.status
    assert config["kind"] == "kyc"
    assert config["created_at"]

    config = next(
        config
        for config in body["data"]
        if config["id"] == inactive_ob_configuration["id"]
    )
    assert config["status"] == "disabled"


@pytest.mark.parametrize(
    "params,expect_ob_config1,expect_ob_config2",
    [
        (dict(status="enabled"), True, False),
        (dict(status="disabled"), False, True),
        (dict(search="Test"), True, True),
        (dict(search="Inactive"), False, True),
    ],
)
def test_config_list_filters(
    sandbox_tenant,
    ob_configuration,
    inactive_ob_configuration,
    params,
    expect_ob_config1,
    expect_ob_config2,
):
    body = get("org/onboarding_configs", params, *sandbox_tenant.db_auths)
    assert (
        any(u["id"] == ob_configuration.id for u in body["data"]) == expect_ob_config1
    )
    assert (
        any(u["id"] == inactive_ob_configuration["id"] for u in body["data"])
        == expect_ob_config2
    )


def test_config_detail(sandbox_tenant, ob_configuration):
    config = get(
        f"org/onboarding_configs/{ob_configuration.id}", None, *sandbox_tenant.db_auths
    )
    assert config["key"] == ob_configuration.key.value
    assert config["name"] == ob_configuration.name
    assert config["must_collect_data"] == ob_configuration.must_collect_data
    assert config["can_access_data"] == ob_configuration.can_access_data
    assert config["status"] == ob_configuration.status
    assert config["created_at"]


def test_config_create(sandbox_tenant):
    data = dict(
        name="Acme Bank Loan",
        must_collect_data=["ssn4", "phone_number", "email", "name", "full_address"],
        can_access_data=["ssn4", "phone_number", "email", "name", "full_address"],
    )
    body = post("org/onboarding_configs", data, *sandbox_tenant.db_auths)
    ob_config = body
    ob_config_key = PublishableOnboardingKey(ob_config["key"])

    sandbox_id = _gen_random_sandbox_id()
    auth_token = IdentifyClient(ob_config_key, sandbox_id).create_user()
    post("hosted/onboarding", None, ob_config_key, auth_token)


@pytest.mark.parametrize(
    "config_data,expected_error",
    [
        (
            dict(
                must_collect_data=[
                    "ssn4",
                    "name",
                    "full_address",
                    "email",
                    "phone_number",
                ],
                optional_data=[],
                can_access_data=[],
                allow_international_residents=False,
                international_country_restrictions=None,
            ),
            None,
        ),
        (
            dict(
                must_collect_data=[
                    "ssn4",
                    "ssn9",
                    "name",
                    "full_address",
                    "email",
                    "phone_number",
                ],
                optional_data=[],
                can_access_data=[],
                allow_international_residents=False,
                international_country_restrictions=None,
            ),
            "Validation error: Cannot provide both ssn4 and ssn9",
        ),
        (
            dict(
                must_collect_data=["name", "email", "phone_number", "full_address"],
                optional_data=[],
                can_access_data=["ssn9"],
                allow_international_residents=False,
                international_country_restrictions=None,
            ),
            "Validation error: Decryptable Ssn fields must be a subset of collected fields",
        ),  # can_access must be < must_collect
        (
            dict(
                must_collect_data=["name", "full_address", "email", "phone_number"],
                optional_data=["ssn9"],
                can_access_data=["name", "ssn9"],
                allow_international_residents=False,
                international_country_restrictions=None,
            ),
            None,
        ),  # data in optional_data should be allowed in can_access
        (
            dict(
                must_collect_data=["name", "full_address", "email", "phone_number"],
                optional_data=["dob"],
                can_access_data=[],
                allow_international_residents=False,
                international_country_restrictions=None,
            ),
            "Validation error: [Dob] cannot be optional",
        ),  # for now only let ssn4/ssn9 be optional, not any arbitary CDO
        (
            dict(
                must_collect_data=[
                    "name",
                    "full_address",
                    "email",
                    "phone_number",
                    "dob",
                ],
                optional_data=[],
                can_access_data=[],
                allow_international_residents=False,
                international_country_restrictions=["MX"],
            ),
            "Validation error: Cannot specify international_country_restrictions without allow_international_residents",
        ),
        (
            dict(
                must_collect_data=[
                    "name",
                    "full_address",
                    "email",
                    "phone_number",
                    "dob",
                ],
                optional_data=[],
                can_access_data=[],
                allow_international_residents=True,
                international_country_restrictions=[],
            ),
            "Validation error: Must specify 1 or more countries in international_country_restrictions",
        ),
        (
            dict(
                must_collect_data=[
                    "name",
                    "full_address",
                    "email",
                    "phone_number",
                    "dob",
                ],
                optional_data=[],
                can_access_data=[],
                allow_international_residents=True,
                international_country_restrictions=["MX"],
            ),
            None,
        ),
        (
            dict(
                must_collect_data=[
                    "name",
                    "full_address",
                    "email",
                    "phone_number",
                    "dob",
                    "document.passport.none.none",
                ],
                optional_data=["ssn9"],
                can_access_data=[],
                doc_scan_for_optional_ssn="document.passport.none.none",
            ),
            "Validation error: Cannot specify doc_scan_for_optional_ssn if already collecting a document",
        ),
        (
            dict(
                must_collect_data=[
                    "name",
                    "full_address",
                    "email",
                    "phone_number",
                    "dob",
                ],
                optional_data=[],
                can_access_data=[],
                doc_scan_for_optional_ssn="document.passport.none.none",
            ),
            "Validation error: Cannot specify doc_scan_for_optional_ssn if Ssn4 or Ssn9 is not optional",
        ),
        (
            dict(
                must_collect_data=[
                    "name",
                    "full_address",
                    "email",
                    "phone_number",
                    "dob",
                ],
                optional_data=["ssn9"],
                can_access_data=[],
                doc_scan_for_optional_ssn="full_address",
            ),
            "Validation error: doc_scan_for_optional_ssn must be a Document collected data option",
        ),
        (
            dict(
                must_collect_data=[
                    "name",
                    "full_address",
                    "email",
                    "phone_number",
                    "dob",
                ],
                optional_data=[],
                can_access_data=[],
                allow_international_residents=False,
                allow_us_residents=False,
            ),
            "Validation error: Must set one of allow_us_residents or allow_international_residents to true",
        ),
        (
            dict(
                must_collect_data=[
                    "name",
                    "full_address",
                    "email",
                    "phone_number",
                    "dob",
                ],
                optional_data=[],
                can_access_data=[],
                allow_international_residents=True,
                allow_us_territories=True,
                allow_us_residents=True,
            ),
            "Validation error: Specifying allow_us_territories with allow_international_residents is redundant",
        ),
        (
            dict(
                must_collect_data=["name", "document.drivers_license.none.none"],
                optional_data=[],
                can_access_data=[],
                kind="document",
                skip_kyc=True,
                skip_confirm=True,
            ),
            "Validation error: Playbooks of kind document cannot collect name",
        ),
        (
            dict(
                must_collect_data=["document.drivers_license.none.none"],
                optional_data=[],
                can_access_data=[],
                kind="document",
                skip_kyc=True,
                skip_confirm=False,
            ),
            "Playbook of kind document must skip confirm",
        ),
        (
            dict(
                must_collect_data=["document.drivers_license.none.none"],
                optional_data=[],
                can_access_data=[],
                kind="document",
                skip_kyc=False,
                skip_confirm=True,
            ),
            "Playbook of kind document must skip KYC",
        ),
        # happy path alpaca
        (
            dict(
                must_collect_data=[
                    "name",
                    "dob",
                    "ssn9",
                    "full_address",
                    "email",
                    "phone_number",
                ],
                optional_data=[],
                can_access_data=[],
                kind="kyc",
                cip_kind="alpaca",
                skip_kyc=False,
                skip_confirm=True,
                enhanced_aml=dict(
                    enhanced_aml=True,
                    ofac=True,
                    pep=True,
                    adverse_media=True,
                ),
                allow_us_residents=True,
                allow_us_territories=True,
            ),
            None,
        ),
        (
            dict(
                must_collect_data=[
                    "name",
                    "dob",
                    "full_address",
                    "email",
                    "phone_number",
                ],
                optional_data=[],
                can_access_data=[],
                kind="kyc",
                cip_kind="alpaca",
                skip_kyc=False,
                skip_confirm=True,
                enhanced_aml=dict(
                    enhanced_aml=True,
                    ofac=True,
                    pep=True,
                    adverse_media=True,
                ),
                allow_us_residents=True,
                allow_us_territories=True,
            ),
            "Missing required data options: ssn9 for cip: alpaca",
        ),
        (
            dict(
                must_collect_data=[
                    "name",
                    "dob",
                    "ssn9",
                    "full_address",
                    "email",
                    "phone_number",
                    "document",
                ],
                optional_data=[],
                can_access_data=[],
                kind="kyc",
                cip_kind="alpaca",
                skip_kyc=False,
                skip_confirm=True,
                enhanced_aml=dict(
                    enhanced_aml=True,
                    ofac=True,
                    pep=True,
                    adverse_media=True,
                ),
                allow_us_residents=True,
                allow_us_territories=True,
            ),
            "Validation error: Cannot specify documents in Playbook and be using an Alpaca CIP",
        ),
        (
            dict(
                must_collect_data=[
                    "name",
                    "dob",
                    "ssn9",
                    "full_address",
                    "email",
                    "phone_number",
                ],
                optional_data=[],
                can_access_data=[],
                kind="kyc",
                cip_kind="alpaca",
                skip_kyc=False,
                skip_confirm=True,
                enhanced_aml=dict(
                    enhanced_aml=True,
                    ofac=True,
                    pep=True,
                    adverse_media=True,
                ),
                allow_us_residents=True,
                allow_us_territories=False,
            ),
            "Validation error: Cannot create Alpaca playbook without allow_us_residents=true && allow_us_territories=true",
        ),
        (
            dict(
                must_collect_data=[
                    "name",
                    "dob",
                    "ssn9",
                    "full_address",
                    "email",
                    "phone_number",
                ],
                optional_data=[],
                can_access_data=[],
                kind="kyc",
                cip_kind="alpaca",
                skip_kyc=False,
                skip_confirm=True,
                enhanced_aml=dict(
                    enhanced_aml=True,
                    ofac=True,
                    pep=False,
                    adverse_media=False,
                ),
                allow_us_residents=True,
                allow_us_territories=True,
            ),
            "Validation error: Must run OFAC/PEP/AdverseMedia for Alpaca playbook",
        ),
        (
            dict(
                must_collect_data=[
                    "name",
                    "dob",
                    "ssn9",
                    "full_address",
                    "email",
                    "phone_number",
                ],
                optional_data=[],
                can_access_data=[],
                kind="kyc",
                cip_kind="alpaca",
                skip_kyc=False,
                skip_confirm=True,
                enhanced_aml=dict(
                    enhanced_aml=False,
                    ofac=False,
                    pep=False,
                    adverse_media=False,
                ),
                allow_us_residents=True,
                allow_us_territories=True,
            ),
            "Validation error: Must choose EnhancedAmlOption Alpaca playbook",
        ),
        (
            dict(
                must_collect_data=["name", "full_address", "email", "phone_number"],
                optional_data=[],
                can_access_data=[],
                kind="kyc",
                cip_kind=None,
                skip_kyc=False,
                skip_confirm=False,
                enhanced_aml=dict(
                    enhanced_aml=False,
                    ofac=False,
                    pep=False,
                    adverse_media=False,
                ),
                allow_us_residents=False,
                allow_us_territories=False,
                documents_to_collect=[
                    dict(
                        kind="custom",
                        data=dict(
                            identifier="id.first_name",
                            name="Custom document",
                        ),
                    )
                ],
            ),
            "Must use identifier starting with document.custom. for custom documents",
        ),
    ],
)
def test_config_create_validation(sandbox_tenant, config_data, expected_error):
    data = {"name": "Acme Bank Loan"}
    data.update(config_data)

    # Test validation errors
    res = post(
        "org/onboarding_configs",
        data,
        *sandbox_tenant.db_auths,
        status_code=200 if expected_error is None else 400,
    )

    if expected_error:
        assert res["error"]["message"] == expected_error


def test_no_phone_obc(sandbox_tenant):
    collect_data = ["name", "full_address", "email"]
    data = dict(
        name="Let's skip the phone",
        must_collect_data=collect_data,
        optional_data=[],
        can_access_data=collect_data,
        is_no_phone_flow=True,
    )
    res = post(
        "org/onboarding_configs",
        data,
        *sandbox_tenant.db_auths,
        status_code=200,
    )

    assert res["is_no_phone_flow"] == True
    assert res["must_collect_data"] == collect_data
    assert res["optional_data"] == []
    assert res["can_access_data"] == collect_data


def test_doc_only(sandbox_tenant):
    # TODO: eventually migrate this in favor of documents_and_countries
    collect_data = ["document.drivers_license,id_card.none.none"]
    data = dict(
        name="Doc only",
        must_collect_data=collect_data,
        optional_data=[],
        can_access_data=collect_data,
        kind="document",
        skip_kyc=True,
        skip_confirm=True,
        document_types_and_countries={
            "global": ["passport"],
            "country_specific": {"US": ["drivers_license"]},
        },
    )
    res = post("org/onboarding_configs", data, *sandbox_tenant.db_auths)

    assert res["kind"] == "document"
    assert res["must_collect_data"] == collect_data
    assert res["can_access_data"] == collect_data
    assert res["document_types_and_countries"] == {
        "global": ["passport"],
        "country_specific": {"US": ["drivers_license"]},
    }


@pytest.mark.parametrize(
    "collect_data,allow_international_residents,expected_error",
    [
        (["name", "full_address", "phone_number", "email"], True, None),
        (
            [
                "name",
                "full_address",
                "phone_number",
                "email",
                "document.drivers_license.us_only.require_selfie",
            ],
            False,
            None,
        ),
        (
            ["name", "full_address", "phone_number", "email"],
            False,
            "Validation error: Cannot specify skip_kyc if allow_international_residents=false and no Document is collected in must_collect_data",
        ),
    ],  # don't allow skip_kyc=true if US only and doc isn't being collected
)
def test_skip_kyc(
    sandbox_tenant, collect_data, allow_international_residents, expected_error
):
    data = dict(
        name="skip kyc",
        must_collect_data=collect_data,
        can_access_data=collect_data,
        allow_international_residents=allow_international_residents,
        skip_kyc=True,
    )
    res = post(
        "org/onboarding_configs",
        data,
        *sandbox_tenant.db_auths,
        status_code=200 if expected_error is None else 400,
    )

    if expected_error:
        assert res["error"]["message"] == expected_error
    else:
        assert res["skip_kyc"] == True


@pytest.mark.parametrize(
    "enhanced_aml,expected_error",
    [
        (
            dict(
                enhanced_aml=False,
                ofac=False,
                pep=False,
                adverse_media=False,
            ),
            None,
        ),
        (
            dict(
                enhanced_aml=True,
                ofac=True,
                pep=True,
                adverse_media=False,
            ),
            None,
        ),
        (
            dict(
                enhanced_aml=False,
                ofac=True,
                pep=True,
                adverse_media=False,
            ),
            "Validation error: cannot set adverse_media, ofac, or pep if enhanced_aml = false",
        ),
        (
            dict(
                enhanced_aml=True,
                ofac=False,
                pep=False,
                adverse_media=False,
            ),
            "Validation error: at least one of adverse_media, ofac, or pep must be set if enhanced_aml = true",
        ),
    ],
)
def test_enhanced_aml(sandbox_tenant, must_collect_data, enhanced_aml, expected_error):
    data = dict(
        name="Yo",
        must_collect_data=must_collect_data,
        optional_data=[],
        can_access_data=must_collect_data,
        enhanced_aml=enhanced_aml,
    )
    res = post(
        "org/onboarding_configs",
        data,
        *sandbox_tenant.db_auths,
        status_code=200 if expected_error is None else 400,
    )

    if expected_error:
        assert res["error"]["message"] == expected_error
    else:
        assert res["enhanced_aml"] == enhanced_aml


def test_config_update(sandbox_tenant, ob_configuration):
    # Test failing to update
    new_name = "Updated ob config name"
    new_status = "disabled"
    data = dict(name=new_name, status=new_status)
    patch(
        f"org/onboarding_configs/flerpderp",
        data,
        *sandbox_tenant.db_auths,
        status_code=404,
    )

    # Update the name and status
    body = patch(
        f"org/onboarding_configs/{ob_configuration.id}",
        data,
        *sandbox_tenant.db_auths,
    )
    ob_config = body
    assert ob_config["name"] == new_name
    assert ob_config["status"] == new_status

    # Verify the update
    body = get(f"org/onboarding_configs?page_size=100", None, *sandbox_tenant.db_auths)
    configs = body["data"]
    ob_config = next(i for i in configs if i["id"] == ob_configuration.id)
    assert ob_config["name"] == new_name
    assert ob_config["status"] == new_status

    # Verify we can't use the disabled ob config for anything anymore
    get("org/onboarding_config", None, ob_configuration.key, status_code=401)


def test_business_only_obc(sandbox_tenant):
    collect_data = [
        "business_name",
        "business_tin",
        "business_address",
        "business_phone_number",
        "business_website",
        "business_beneficial_owners",
    ]
    data = dict(
        name="Let's skip the phone",
        must_collect_data=collect_data,
        can_access_data=collect_data,
    )
    res = post(
        "org/onboarding_configs",
        data,
        *sandbox_tenant.db_auths,
        status_code=200,
    )

    assert res["must_collect_data"] == collect_data
    assert res["can_access_data"] == collect_data


def test_default_rules(sandbox_tenant):
    collect_data = ["name", "full_address", "phone_number", "email", "ssn9"]
    obc = post(
        "org/onboarding_configs",
        dict(
            name="test_default_rules",
            must_collect_data=collect_data,
            can_access_data=collect_data,
        ),
        *sandbox_tenant.db_auths,
    )

    rules = [
        (r["rule_expression"], r["action"])
        for r in get(
            f"/org/onboarding_configs/{obc['id']}/rules",
            None,
            *sandbox_tenant.db_auths,
        )
    ]
    expected_rules = [
        ([{"field": "id_not_located", "op": "eq", "value": True}], "fail"),
        ([{"field": "id_flagged", "op": "eq", "value": True}], "fail"),
        ([{"field": "subject_deceased", "op": "eq", "value": True}], "fail"),
        ([{"field": "address_input_is_po_box", "op": "eq", "value": True}], "fail"),
        ([{"field": "dob_located_coppa_alert", "op": "eq", "value": True}], "fail"),
        ([{"field": "multiple_records_found", "op": "eq", "value": True}], "fail"),
        ([{"field": "ssn_does_not_match", "op": "eq", "value": True}], "fail"),
        ([{"field": "ssn_partially_matches", "op": "eq", "value": True}], "fail"),
        ([{"field": "ssn_input_is_invalid", "op": "eq", "value": True}], "fail"),
        ([{"field": "ssn_located_is_invalid", "op": "eq", "value": True}], "fail"),
        ([{"field": "ssn_issued_prior_to_dob", "op": "eq", "value": True}], "fail"),
        (
            [{"field": "watchlist_hit_ofac", "op": "eq", "value": True}],
            "manual_review",
        ),
        (
            [{"field": "watchlist_hit_non_sdn", "op": "eq", "value": True}],
            "manual_review",
        ),
    ]
    assert len(expected_rules) == len(rules) and all(
        expected_rules.count(x) == rules.count(x) for x in expected_rules
    )
