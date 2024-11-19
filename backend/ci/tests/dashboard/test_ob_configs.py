import pytest
import json
from tests.bifrost_client import BifrostClient
from tests.types import ObConfiguration
from tests.utils import (
    get,
    post,
    patch,
    put,
    create_ob_config,
    _gen_random_sandbox_id,
)
from tests.dashboard.utils import update_rules
from tests.headers import (
    DryRun,
    IsLive,
    PlaybookKey,
    SecondaryDashboardAuth,
)
from tests.identify_client import IdentifyClient


@pytest.fixture(scope="session")
def ob_configuration(sandbox_tenant, must_collect_data):
    return create_ob_config(sandbox_tenant, "Test OB Config", must_collect_data)


@pytest.fixture(scope="session")
def inactive_ob_configuration(sandbox_tenant, must_collect_data):
    ob_config = create_ob_config(
        sandbox_tenant, "My inactive test OB Config", must_collect_data
    )
    data = dict(status="disabled")
    body = patch(
        f"org/onboarding_configs/{ob_config.id}",
        data,
        *sandbox_tenant.db_auths,
    )
    return body


def test_config_list(sandbox_tenant, ob_configuration, inactive_ob_configuration):
    body = get("org/onboarding_configs", dict(page_size=100), *sandbox_tenant.db_auths)

    config = next(
        config for config in body["data"] if config["id"] == ob_configuration.id
    )
    assert config["key"] == ob_configuration.key.value
    assert config["name"] == ob_configuration.name
    assert config["must_collect_data"] == ob_configuration.must_collect_data
    assert config["status"] == ob_configuration.status
    assert config["kind"] == "kyc"
    assert config["created_at"]

    config = next(
        config
        for config in body["data"]
        if config["id"] == inactive_ob_configuration["id"]
    )
    assert config["status"] == "disabled"


def test_list_playbook_versions(sandbox_tenant, ob_configuration):
    playbook_id = ob_configuration.playbook_id
    body = get(f"org/playbooks/{playbook_id}/versions", None, *sandbox_tenant.db_auths)

    assert len(body["data"]) == 1, "Only one version for a playbook without edits"
    assert len([
        obc_version
        for obc_version in body["data"]
        if obc_version["id"] == ob_configuration.id
    ]) == 1


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
    assert config["status"] == ob_configuration.status
    assert config["created_at"]


def test_config_create(sandbox_tenant):
    data = dict(
        name="Acme Bank Loan",
        must_collect_data=["ssn4", "phone_number", "email", "name", "full_address"],
        kind="kyc",
        verification_checks=[{"data": {}, "kind": "kyc"}],
    )
    body = post("org/onboarding_configs", data, *sandbox_tenant.db_auths)
    obc = ObConfiguration.from_response(body, sandbox_tenant)

    sandbox_id = _gen_random_sandbox_id()
    auth_token = IdentifyClient(obc, sandbox_id).create_user()
    post("hosted/onboarding", None, obc.key, auth_token)


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
                allow_international_residents=False,
                international_country_restrictions=None,
                verification_checks=[{"kind": "kyc", "data": {}}],
            ),
            None,
        ),
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
                allow_international_residents=False,
                international_country_restrictions=None,
                verification_checks=[
                    {"kind": "kyc", "data": {}},
                    {"kind": "phone", "data": {"attributes": []}},
                ],
            ),
            "Validation error: Must provide `attributes` if enabling a phone verification check",
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
                allow_international_residents=False,
                international_country_restrictions=None,
                verification_checks=[{"kind": "kyc", "data": {}}],
            ),
            "Validation error: Cannot provide both ssn4 and ssn9",
        ),
        (
            dict(
                must_collect_data=["name", "email", "phone_number", "full_address"],
                optional_data=[],
                deprecated_can_access_data=["ssn9"],
                allow_international_residents=False,
                international_country_restrictions=None,
                verification_checks=[{"kind": "kyc", "data": {}}],
            ),
            "Validation error: Decryptable Ssn fields must be a subset of collected fields",
        ),  # can_access must be < must_collect
        (
            dict(
                must_collect_data=["name", "full_address", "email", "phone_number"],
                optional_data=["ssn9"],
                deprecated_can_access_data=["name", "ssn9"],
                allow_international_residents=False,
                international_country_restrictions=None,
                verification_checks=[{"kind": "kyc", "data": {}}],
            ),
            None,
        ),  # data in optional_data should be allowed in can_access
        (
            dict(
                must_collect_data=["name", "full_address", "email", "phone_number"],
                optional_data=["dob"],
                allow_international_residents=False,
                international_country_restrictions=None,
                verification_checks=[{"kind": "kyc", "data": {}}],
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
                allow_international_residents=False,
                international_country_restrictions=["MX"],
                verification_checks=[{"kind": "kyc", "data": {}}],
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
                allow_international_residents=True,
                international_country_restrictions=[],
                verification_checks=[{"kind": "kyc", "data": {}}],
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
                allow_international_residents=True,
                international_country_restrictions=["MX"],
                verification_checks=[],
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
                ],
                optional_data=[],
                allow_international_residents=False,
                allow_us_residents=False,
                verification_checks=[{"kind": "kyc", "data": {}}],
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
                allow_international_residents=True,
                allow_us_territories=True,
                allow_us_residents=True,
                verification_checks=[{"kind": "kyc", "data": {}}],
            ),
            "Validation error: Specifying allow_us_territories with allow_international_residents is redundant",
        ),
        (
            dict(
                must_collect_data=["name", "document.drivers_license.none.none"],
                optional_data=[],
                kind="document",
                skip_kyc=True,
            ),
            "Validation error: Playbooks of kind document cannot collect name",
        ),
        (
            dict(
                must_collect_data=["document.drivers_license.none.none"],
                optional_data=[],
                kind="document",
                skip_kyc=False,
            ),
            "Playbook of kind document must skip KYC",
        ),
        # VERIFICATION_CHECK_MIGRATION: same as above test, but with VC
        (
            dict(
                must_collect_data=["document.drivers_license.none.none"],
                optional_data=[],
                kind="document",
                verification_checks=[{"kind": "kyc", "data": {}}],
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
                kind="kyc",
                cip_kind="alpaca",
                skip_kyc=False,
                enhanced_aml=dict(
                    enhanced_aml=True,
                    ofac=True,
                    pep=True,
                    adverse_media=True,
                    match_kind="exact_name",
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
                kind="kyc",
                cip_kind="alpaca",
                skip_kyc=False,
                enhanced_aml=dict(
                    enhanced_aml=True,
                    ofac=True,
                    pep=True,
                    adverse_media=True,
                    match_kind="exact_name",
                ),
                allow_us_residents=True,
                allow_us_territories=True,
            ),
            "Missing required data options: ssn9 for cip: alpaca",
        ),
        # VERIFICATION_CHECK_MIGRATION: same as above test, but with VC
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
                kind="kyc",
                cip_kind="alpaca",
                allow_us_residents=True,
                allow_us_territories=True,
                verification_checks=[
                    dict(kind="kyc", data=dict()),
                    dict(
                        kind="aml",
                        data=dict(
                            ofac=True,
                            pep=True,
                            adverse_media=True,
                            continuous_monitoring=True,
                            match_kind="exact_name",
                        ),
                    ),
                ],
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
                kind="kyc",
                cip_kind="alpaca",
                skip_kyc=False,
                enhanced_aml=dict(
                    enhanced_aml=True,
                    ofac=True,
                    pep=True,
                    adverse_media=True,
                    match_kind="exact_name",
                ),
                allow_us_residents=True,
                allow_us_territories=True,
            ),
            "Validation error: Cannot specify documents in Playbook and be using an Alpaca CIP",
        ),
        # VERIFICATION_CHECK_MIGRATION: same as above test, but with VC
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
                kind="kyc",
                cip_kind="alpaca",
                allow_us_residents=True,
                allow_us_territories=False,
                verification_checks=[
                    dict(kind="kyc", data=dict()),
                    dict(
                        kind="aml",
                        data=dict(
                            ofac=True,
                            pep=True,
                            adverse_media=True,
                            continuous_monitoring=True,
                            match_kind="exact_name",
                        ),
                    ),
                ],
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
                kind="kyc",
                cip_kind="alpaca",
                skip_kyc=False,
                enhanced_aml=dict(
                    enhanced_aml=True,
                    ofac=True,
                    pep=False,
                    adverse_media=False,
                    match_kind="exact_name",
                ),
                allow_us_residents=True,
                allow_us_territories=True,
            ),
            "Validation error: Must run OFAC/PEP/AdverseMedia for Alpaca playbook",
        ),
        # VERIFICATION_CHECK_MIGRATION: same as above test, but with VC
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
                kind="kyc",
                cip_kind="alpaca",
                enhanced_aml=dict(
                    enhanced_aml=True,
                    ofac=True,
                    pep=False,
                    adverse_media=False,
                ),
                allow_us_residents=True,
                allow_us_territories=True,
                verification_checks=[
                    dict(kind="kyc", data=dict()),
                    dict(
                        kind="aml",
                        data=dict(
                            ofac=True,
                            pep=False,
                            adverse_media=False,
                            continuous_monitoring=False,
                            match_kind="exact_name",
                        ),
                    ),
                ],
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
                kind="kyc",
                cip_kind="alpaca",
                skip_kyc=False,
                enhanced_aml=dict(
                    enhanced_aml=False,
                    ofac=False,
                    pep=False,
                    adverse_media=False,
                    match_kind="exact_name",
                ),
                allow_us_residents=True,
                allow_us_territories=True,
            ),
            "Validation error: Must choose EnhancedAmlOption Alpaca playbook",
        ),
        # VERIFICATION_CHECK_MIGRATION: same as above test, but with VC
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
                kind="kyc",
                cip_kind="alpaca",
                allow_us_residents=True,
                allow_us_territories=True,
                verification_checks=[{"kind": "kyc", "data": {}}],  # no AML check
            ),
            "Validation error: Must choose EnhancedAmlOption Alpaca playbook",
        ),
        (
            dict(
                must_collect_data=["name", "full_address", "email", "phone_number"],
                optional_data=[],
                kind="kyc",
                cip_kind=None,
                skip_kyc=False,
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
        # VERIFICATION_CHECK_MIGRATION: same as above test, but with VC
        (
            dict(
                must_collect_data=["name", "full_address", "email", "phone_number"],
                optional_data=[],
                kind="kyc",
                cip_kind=None,
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
                verification_checks=[{"kind": "kyc", "data": {}}],
            ),
            "Must use identifier starting with document.custom. for custom documents",
        ),
        (
            dict(
                must_collect_data=["name", "full_address", "email", "phone_number"],
                optional_data=[],
                kind="kyc",
                cip_kind=None,
                skip_kyc=False,
                enhanced_aml=dict(
                    enhanced_aml=False,
                    ofac=False,
                    pep=False,
                    adverse_media=False,
                ),
                allow_us_residents=True,
                allow_us_territories=False,
                business_documents_to_collect=[
                    dict(
                        kind="custom",
                        data=dict(
                            identifier="id.first_name",
                            name="Custom document",
                        ),
                    )
                ],
            ),
            "Cannot collect business documents in non-KYB playbook",
        ),
        # VERIFICATION_CHECK_MIGRATION: same as above test, but with VC
        (
            dict(
                must_collect_data=["name", "full_address", "email", "phone_number"],
                optional_data=[],
                kind="kyc",
                cip_kind=None,
                allow_us_residents=True,
                allow_us_territories=False,
                business_documents_to_collect=[
                    dict(
                        kind="custom",
                        data=dict(
                            identifier="id.first_name",
                            name="Custom document",
                        ),
                    )
                ],
                verification_checks=[{"kind": "kyc", "data": {}}],
            ),
            "Cannot collect business documents in non-KYB playbook",
        ),
        (
            dict(
                must_collect_data=[
                    "name",
                    "email",
                    "phone_number",
                    "full_address",
                ],
                kind="kyc",
                optional_data=[],
                verification_checks=[
                    {"kind": "kyc", "data": {}},
                    {"kind": "sentilink", "data": {}},
                ],
            ),
            "Validation error: Must collect id.dob, id.ssn9 to use Sentilink",
        ),
        (
            dict(
                must_collect_data=[
                    "name",
                    "email",
                    "dob",
                    "ssn9",
                    "phone_number",
                    "full_address",
                ],
                kind="kyc",
                optional_data=[],
                verification_checks=[
                    {"kind": "kyc", "data": {}},
                    {"kind": "sentilink", "data": {}},
                ],
            ),
            None,
        ),
        (
            dict(
                must_collect_data=[
                    "name",
                    "email",
                    "dob",
                    "ssn9",
                    "phone_number",
                    "full_address",
                ],
                kind="kyc",
                optional_data=[],
                is_doc_first_flow=True,
            ),
            "Validation error: Must collect document if is_doc_first is true",
        ),
        (
            dict(
                must_collect_data=[
                    "name",
                    "email",
                    "dob",
                    "ssn9",
                    "phone_number",
                    "full_address",
                    "document",
                ],
                kind="kyc",
                optional_data=[],
                is_doc_first_flow=True,
            ),
            None,
        ),
    ],
)
def test_config_create_validation(sandbox_tenant, config_data, expected_error):
    data = {"name": "Acme Bank Loan", "kind": "kyc"}
    data.update(config_data)

    # Test validation errors
    res = post(
        "org/onboarding_configs",
        data,
        *sandbox_tenant.db_auths,
        status_code=200 if expected_error is None else 400,
    )

    if expected_error:
        assert res["message"] == expected_error


def test_no_phone_obc(sandbox_tenant):
    collect_data = ["name", "full_address", "email"]
    data = dict(
        name="Let's skip the phone",
        must_collect_data=collect_data,
        optional_data=[],
        is_no_phone_flow=True,
        kind="kyc",
        verification_checks=[{"kind": "kyc", "data": {}}],
    )
    res = post("org/onboarding_configs", data, *sandbox_tenant.db_auths)

    assert res["is_no_phone_flow"] == True
    assert res["must_collect_data"] == collect_data
    assert res["optional_data"] == []


def test_doc_only(sandbox_tenant):
    # TODO: eventually migrate this in favor of documents_and_countries
    collect_data = ["document.drivers_license,id_card.none.none"]
    data = dict(
        name="Doc only",
        must_collect_data=collect_data,
        optional_data=[],
        kind="document",
        skip_kyc=True,
        document_types_and_countries={
            "global": ["passport"],
            "country_specific": {"US": ["drivers_license"]},
        },
    )
    res = post("org/onboarding_configs", data, *sandbox_tenant.db_auths)

    assert res["kind"] == "document"
    assert res["must_collect_data"] == collect_data
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
            "Validation error: Can only skip_kyc if allow_international_residents or Document is collected or kind is Kyb",
        ),
    ],  # don't allow skip_kyc=true if US only and doc isn't being collected
)
def test_skip_kyc(
    sandbox_tenant, collect_data, allow_international_residents, expected_error
):
    data = dict(
        name="skip kyc",
        must_collect_data=collect_data,
        allow_international_residents=allow_international_residents,
        skip_kyc=True,
        kind="kyc",
    )
    res = post(
        "org/onboarding_configs",
        data,
        *sandbox_tenant.db_auths,
        status_code=200 if expected_error is None else 400,
    )

    if expected_error:
        assert res["message"] == expected_error
    else:
        assert res["skip_kyc"] == True


@pytest.mark.parametrize(
    "collected_data,kind,checks,expected_error",
    [
        (
            [
                "business_name",
                "business_tin",
                "business_address",
                "business_phone_number",
                "business_website",
                "business_kyced_beneficial_owners",
                "name",
            ],
            "kyb",
            [{"kind": "kyb", "data": {"ein_only": False}}],
            None,
        ),
        (
            [
                "business_name",
                "business_tin",
                "business_address",
                "business_phone_number",
                "business_website",
                "name",
            ],
            "kyb",
            [{"kind": "kyb", "data": {"ein_only": False}}, {"kind": "kyc", "data": {}}],
            "Must skip KYC if not collecting BOs",
        ),
        (
            [
                "business_name",
                "business_tin",
                "business_address",
                "business_phone_number",
                "business_website",
                "business_kyced_beneficial_owners",
            ],
            "kyb",
            [{"kind": "kyb", "data": {"ein_only": False}}, {"kind": "kyc", "data": {}}],
            "Must skip KYC if not collecting KYC data",
        ),
        (
            [
                "business_name",
                "business_tin",
                "business_address",
                "business_phone_number",
                "business_website",
                "business_kyced_beneficial_owners",
                "name",
            ],
            "kyb",
            [
                {"kind": "kyb", "data": {"ein_only": False}},
                {"kind": "kyb", "data": {"ein_only": True}},
            ],
            "Validation error: Duplicate verification_checks defined: kyb",
        ),
        (
            [
                "business_name",
                "business_phone_number",
                "business_website",
                "business_kyced_beneficial_owners",
                "name",
            ],
            "kyb",
            [{"kind": "kyb", "data": {"ein_only": True}}],
            "Validation error: Playbook performing `kyb` verification_check with ein_only=true must collect: business_tin",
        ),
        (
            [
                "business_name",
                "business_tin",
                "business_phone_number",
                "business_website",
                "business_kyced_beneficial_owners",
                "name",
            ],
            "kyb",
            [{"kind": "kyb", "data": {"ein_only": False}}],
            "Validation error: Playbook performing `kyb` verification_check with ein_only=false must collect: business_address",
        ),
        (
            [
                "name",
                "full_address",
                "phone_number",
                "email",
                "document.drivers_license.us_only.require_selfie",
            ],
            "kyc",
            [{"kind": "kyb", "data": {"ein_only": False}}],
            "Validation error: Cannot run KYB for non-KYB Playbooks",
        ),
        (
            [
                "name",
                "full_address",
                "phone_number",
                "email",
                "document.drivers_license.us_only.require_selfie",
            ],
            "kyc",
            [{"kind": "kyb", "data": {"ein_only": True}}],
            "Validation error: Cannot run KYB for non-KYB Playbooks",
        ),
    ],
)
def test_verification_checks(
    sandbox_tenant, collected_data, kind, checks, expected_error
):
    data = dict(
        name="skip kyc",
        must_collect_data=collected_data,
        kind=kind,
        verification_checks=checks,
    )
    res = post(
        "org/onboarding_configs",
        data,
        *sandbox_tenant.db_auths,
        status_code=200 if expected_error is None else 400,
    )

    if expected_error:
        assert res["message"] == expected_error
    else:
        for c in checks:
            assert c in res["verification_checks"]


@pytest.mark.parametrize(
    "enhanced_aml,expected_error",
    [
        (
            dict(
                enhanced_aml=False,
                ofac=False,
                pep=False,
                adverse_media=False,
                match_kind="exact_name",
            ),
            None,
        ),
        (
            dict(
                enhanced_aml=True,
                ofac=True,
                pep=True,
                adverse_media=False,
                match_kind="exact_name",
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
                match_kind="exact_name",
            ),
            "Validation error: cannot set adverse_media, ofac, or pep if enhanced_aml = false",
        ),
        (
            dict(
                enhanced_aml=True,
                ofac=False,
                pep=False,
                adverse_media=False,
                match_kind="exact_name",
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
        enhanced_aml=enhanced_aml,
        kind="kyc",
        verification_checks=[{"kind": "kyc", "data": {}}],
    )
    res = post(
        "org/onboarding_configs",
        data,
        *sandbox_tenant.db_auths,
        status_code=200 if expected_error is None else 400,
    )

    # Add the default match kind to enhanced AML after creating the ob_config to ensure it's set in assertions
    if "match_kind" not in enhanced_aml:
        enhanced_aml["match_kind"] = "exact_name"

    if expected_error:
        assert res["message"] == expected_error
    else:
        assert res["enhanced_aml"] == enhanced_aml


@pytest.mark.parametrize(
    "enhanced_aml,expected_error",
    [
        (
            dict(
                ofac=True,
                pep=True,
                adverse_media=False,
                match_kind="exact_name",
            ),
            None,
        ),
        (
            dict(
                ofac=False,
                pep=False,
                adverse_media=False,
                match_kind="exact_name",
            ),
            "Validation error: at least one of adverse_media, ofac, or pep must be set for AML verification check",
        ),
    ],
)
def test_enhanced_aml_with_verification_checks(
    sandbox_tenant, must_collect_data, enhanced_aml, expected_error
):

    # with verification checks
    aml_check = dict(
        kind="aml",
        data=dict(
            ofac=enhanced_aml["ofac"],
            pep=enhanced_aml["pep"],
            adverse_media=enhanced_aml["adverse_media"],
            continuous_monitoring=True,
            adverse_media_lists=None,
            match_kind="exact_name",
        ),
    )
    verification_checks = [dict(kind="kyc", data=dict()), aml_check]

    data = dict(
        name="Yo",
        must_collect_data=must_collect_data,
        optional_data=[],
        kind="kyc",
        verification_checks=verification_checks,
    )
    res = post(
        "org/onboarding_configs",
        data,
        *sandbox_tenant.db_auths,
        status_code=200 if expected_error is None else 400,
    )

    if expected_error:
        assert res["message"] == expected_error
    else:
        assert aml_check in res["verification_checks"]


@pytest.mark.parametrize(
    "playbook_kind,addl_check_kind,expected_error",
    [
        (
            "kyb",
            "kyb",
            None,
        ),
        (
            "kyb",
            "kyc",
            "Validation error: Cannot run Business AML without KYB",
        ),
        (
            "kyc",
            "kyb",
            "Validation error: Cannot run Business AML for non-KYB Playbooks",
        ),
    ],
)
def test_business_aml_with_verification_checks(
    sandbox_tenant,
    must_collect_data,
    playbook_kind,
    addl_check_kind,
    expected_error,
):
    # with verification checks
    business_aml_check = dict(
        kind="business_aml",
        data=dict(),
    )

    verification_checks = [dict(kind="kyc", data=dict()), business_aml_check]
    if addl_check_kind == "kyb":
        verification_checks = verification_checks + [
            dict(kind=addl_check_kind, data=dict(ein_only=False)),
        ]

    if playbook_kind == "kyb":
        must_collect_data = must_collect_data + [
            "business_name",
            "business_tin",
            "business_address",
            "business_phone_number",
            "business_website",
            "business_kyced_beneficial_owners",
        ]

    data = dict(
        name="Yo",
        must_collect_data=must_collect_data,
        optional_data=[],
        kind=playbook_kind,
        verification_checks=verification_checks,
    )

    res = post(
        "org/onboarding_configs",
        data,
        *sandbox_tenant.db_auths,
        status_code=200 if expected_error is None else 400,
    )

    if expected_error:
        assert res["message"] == expected_error
    else:
        assert business_aml_check in res["verification_checks"]


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
    get("hosted/onboarding/config", None, ob_configuration.key, status_code=401)


def test_business_only_obc(sandbox_tenant):
    collect_data = [
        "business_name",
        "business_tin",
        "business_address",
        "business_phone_number",
        "business_website",
        "business_kyced_beneficial_owners",
        "name",
    ]
    data = dict(
        name="Let's skip the phone",
        must_collect_data=collect_data,
        kind="kyb",
        verification_checks=[{"kind": "kyb", "data": {"ein_only": False}}],
    )
    res = post(
        "org/onboarding_configs",
        data,
        *sandbox_tenant.db_auths,
        status_code=200,
    )

    assert res["must_collect_data"] == collect_data


def test_default_rules(sandbox_tenant):
    collect_data = ["name", "full_address", "phone_number", "email", "ssn9"]
    obc = post(
        "org/onboarding_configs",
        dict(
            name="test_default_rules",
            must_collect_data=collect_data,
            kind="kyc",
            verification_checks=[{"kind": "kyc", "data": {}}],
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


@pytest.mark.parametrize(
    "copy_to_different_target_tenant, target_is_live",
    [(False, False), (False, True), (True, False), (True, True)],
)
def test_copy_playbook(
    sandbox_tenant, foo_sandbox_tenant, copy_to_different_target_tenant, target_is_live
):
    copy_auths = sandbox_tenant.db_auths
    if copy_to_different_target_tenant:
        target_tenant_token = foo_sandbox_tenant.auth_token
        # When copying to a different tenant, we provide the target tenant's auth token
        copy_auths.append(SecondaryDashboardAuth(foo_sandbox_tenant.auth_token.value))
    else:
        target_tenant_token = sandbox_tenant.auth_token
    target_tenant_read_auths = [
        target_tenant_token,
        IsLive("true" if target_is_live else "false"),
    ]

    obc = create_ob_config(
        sandbox_tenant,
        "Test OB Config to copy",
        ["name", "full_address", "email", "phone_number", "nationality"],
        optional_data=["ssn9"],
        is_doc_first_flow=True,
        documents_to_collect=[dict(kind="proof_of_address", data=dict())],
    )
    # Add a rule to this obc
    new_rule_exp = {"field": "address_city_matches", "op": "eq", "value": True}
    new_rule = dict(rule_action="manual_review", rule_expression=[new_rule_exp])
    original_rules = update_rules(obc.id, 1, add=[new_rule], *sandbox_tenant.db_auths)

    original = get(f"org/onboarding_configs/{obc.id}", None, *sandbox_tenant.db_auths)
    assert not original["is_live"]

    data = dict(
        name="My copied playbook",
        is_live=target_is_live,
    )
    copied = post(f"org/onboarding_configs/{obc.id}/copy", data, *copy_auths)
    assert copied["is_live"] == target_is_live
    assert copied["name"] == "My copied playbook"

    # And test fetching using the target tenant's auth
    copied_id = copied["id"]
    copied = get(f"org/onboarding_configs/{copied_id}", None, *target_tenant_read_auths)
    assert copied["is_live"] == target_is_live
    assert copied["name"] == "My copied playbook"
    copied_rules = get(
        f"org/onboarding_configs/{copied_id}/rules", None, *target_tenant_read_auths
    )

    # Ensure that the fields were copied
    copied_fields = [
        "must_collect_data",
        "can_access_data",
        "cip_kind",
        "optional_data",
        "is_no_phone_flow",
        "is_doc_first_flow",
        "allow_international_residents",
        "international_country_restrictions",
        "skip_kyc",
        "skip_kyb",
        "skip_confirm",
        "enhanced_aml",
        "allow_us_residents",
        "allow_us_territory_residents",
        "kind",
        "document_types_and_countries",
        "documents_to_collect",
        "curp_validation_enabled",
    ]
    for field in copied_fields:
        assert copied[field] == original[field]

    # Ensure that the rules were copied too.
    # Compare a hashable representation of the rules
    serialized_rule = lambda r: (
        r["action"],
        json.dumps(r["rule_expression"]),
        r["is_shadow"],
        r["name"],
    )
    assert set(serialized_rule(r) for r in copied_rules) == set(
        serialized_rule(r) for r in original_rules
    )
    overlapping_rule_ids = set(r["rule_id"] for r in copied_rules) & set(
        r["rule_id"] for r in original_rules
    )
    assert len(overlapping_rule_ids) == 0


def test_cannot_copy_with_read_perms(sandbox_tenant, foo_sandbox_tenant):
    obc = sandbox_tenant.default_ob_config
    # Try copying to same tenant
    data = dict(name="My copied playbook", is_live=True)
    body = post(
        f"org/onboarding_configs/{obc.id}/copy",
        data,
        *sandbox_tenant.ro_db_auths,
        status_code=403,
    )
    assert (
        body["message"]
        == "Not allowed: required permission is missing: OnboardingConfiguration. Please review the permissions configured for your role in the Footprint dashboard."
    )

    # Try copying to another tenant with insufficient write permissions at that tenant
    body = post(
        f"org/onboarding_configs/{obc.id}/copy",
        data,
        *sandbox_tenant.db_auths,
        SecondaryDashboardAuth(foo_sandbox_tenant.ro_auth_token.value),
        status_code=403,
    )
    assert (
        body["message"]
        == "Not allowed: required permission is missing: OnboardingConfiguration. Please review the permissions configured for your role in the Footprint dashboard."
    )


def test_playbook_versions(sandbox_tenant, tenant):
    obc_v1_req = {
        "name": "Test Playbook Initial Version",
        "must_collect_data": [
            "name",
            "ssn9",
            "full_address",
            "email",
            "phone_number",
            "nationality",
            "dob",
        ],
        "kind": "kyc",
        "skip_kyc": False,
    }
    obc_v1_resp = post(
        "org/onboarding_configs",
        obc_v1_req,
        *sandbox_tenant.db_auths,
    )
    obc_v1_id = obc_v1_resp["id"]
    playbook_id = obc_v1_resp["playbook_id"]

    assert obc_v1_resp["rule_set"] == {"version": 1}
    assert obc_v1_resp["documents_to_collect"] == []

    obc_v1 = ObConfiguration.from_response(obc_v1_resp, sandbox_tenant)
    bifrost_v1 = BifrostClient.new_user(obc_v1)
    assert bifrost_v1.get_requirement("collect_document") == None

    # Modify rules for the initial playbook
    patch(f"/org/onboarding_configs/{obc_v1_id}/rules", {
        "expected_rule_set_version": 1,
        "add": [
            {
                "name": "My awesome rule",
                "rule_expression": [{"field": "dob_does_not_match", "op": "eq", "value": True}],
                "rule_action": "manual_review",
            }
        ],
    }, *sandbox_tenant.db_auths)

    obc_v1_with_rules_edit = get(f"/org/onboarding_configs/{obc_v1_id}", None, *sandbox_tenant.db_auths)
    assert obc_v1_with_rules_edit["rule_set"] == {"version": 2}

    # Modify the playbook
    update_playbook_req ={
        "expected_latest_obc_id": obc_v1_id,
        "new_onboarding_config": obc_v1_req | {
            "name": "Test Playbook Version 2",
            "must_collect": obc_v1_req["must_collect_data"],
            "documents_to_collect": [{"kind": "proof_of_address", "data": {}}],
        }
    }

    # Permissions for updates are properly checked.
    put(f"org/playbooks/{playbook_id}", update_playbook_req, *tenant.db_auths, status_code=404)
    put(f"org/playbooks/{playbook_id}", update_playbook_req, *sandbox_tenant.ro_db_auths, status_code=403)

    dry_run_obc_v2_resp = put(
        f"org/playbooks/{playbook_id}",
        update_playbook_req,
        DryRun("true"),
        *sandbox_tenant.db_auths,
    )

    obc_v2_resp = put(
        f"org/playbooks/{playbook_id}",
        update_playbook_req,
        *sandbox_tenant.db_auths,
    )
    obc_v2_id = obc_v2_resp["id"]
    assert obc_v2_resp == dry_run_obc_v2_resp | {
        "id": obc_v2_id,
        "created_at": obc_v2_resp["created_at"],
        # Rule set version restarts at 1
        "rule_set": {"version": 1},
    }

    want_obc_v2_resp = obc_v1_resp | {
        "id": obc_v2_id,
        "created_at": obc_v2_resp["created_at"],
        "name": "Test Playbook Version 2",
        # Rule set version restarts at 1
        "rule_set": {"version": 1},
        "documents_to_collect": [{"kind": "proof_of_address", "data": {"requires_human_review": True}}],
    }
    assert obc_v2_resp == want_obc_v2_resp

    # In-progress onboardings should be allowed to finish without fulfilling new requiremnents.
    v1_user = bifrost_v1.run()
    v1_user_vault = get(f"/users/{v1_user.fp_id}/vault", None, sandbox_tenant.s_sk)
    assert all(not di.startswith("document.") for di in v1_user_vault)

    # New onboardings should require the new configuration.
    obc_v2 = ObConfiguration.from_response(obc_v2_resp, sandbox_tenant)
    bifrost_v2 = BifrostClient.new_user(obc_v2)
    assert bifrost_v2.get_requirement("collect_document")["config"]["kind"] == "proof_of_address"

    user_v2 = bifrost_v2.run()
    user_v2_vault = get(f"/users/{user_v2.fp_id}/vault", None, sandbox_tenant.s_sk)
    assert set(di for di in user_v2_vault if di.startswith("document.")) == {"document.proof_of_address.image", "document.drivers_license.back.barcodes"}

    # GET endpoints return the proper versions
    get_obc_v1 = get(f"/org/onboarding_configs/{obc_v1_id}", None, *sandbox_tenant.db_auths)
    assert get_obc_v1["deactivated_at"]
    assert get_obc_v1 == obc_v1_with_rules_edit | {
        "deactivated_at": get_obc_v1["deactivated_at"],
    }

    get_obc_v2 = get(f"/org/onboarding_configs/{obc_v2_id}", None, *sandbox_tenant.db_auths)
    assert get_obc_v2 == obc_v2_resp

    versions = get(f"/org/playbooks/{playbook_id}/versions", None, *sandbox_tenant.db_auths)
    assert versions == {
        "data": [
            get_obc_v2,
            get_obc_v1,
        ],
        "meta": {
            "count": 2,
            "next_page": None,
        }
    }

    # Revert to the original playbook
    revert_req = {
        "expected_latest_obc_id": obc_v2_id,
        "restore_obc_id": obc_v1_id,
    }
    restore_resp = post(f"/org/playbooks/{playbook_id}/restore", revert_req, *sandbox_tenant.db_auths)
    obc_v3_id = restore_resp["id"]

    versions = get(f"/org/playbooks/{playbook_id}/versions", None, *sandbox_tenant.db_auths)
    obcs_active = {
        obc["id"]: obc["deactivated_at"] is None
        for obc in versions["data"]
    }
    assert obcs_active == {
        obc_v1_id: False,
        obc_v2_id: False,
        obc_v3_id: True,
    }

    # Incorrect latest OBC ID fails
    incorrect_update_playbook_req = {
        "expected_latest_obc_id": obc_v1_id,
        "new_onboarding_config": obc_v1_req,
    }
    put(f"org/playbooks/{playbook_id}", incorrect_update_playbook_req, *sandbox_tenant.db_auths, status_code=400)

    # Rules are correctly reverted.
    rules_v2 = get(f"/org/onboarding_configs/{obc_v2_id}/rules", None, *sandbox_tenant.db_auths)
    rules_v3 = get(f"/org/onboarding_configs/{obc_v3_id}/rules", None, *sandbox_tenant.db_auths)
    # Rule IDs and timestamps are not maintained.
    rules_v2_repr = set(json.dumps({
        "name": r["name"],
        "rule_expression": r["rule_expression"],
        "action": r["action"],
    }) for r in rules_v2)
    rules_v3_repr = set(json.dumps({
        "name": r["name"],
        "rule_expression": r["rule_expression"],
        "action": r["action"],
    }) for r in rules_v3)
    assert rules_v2_repr == rules_v3_repr
