from tests.bifrost_client import BifrostClient
from tests.utils import get_requirement_from_requirements, create_ob_config, patch


def test_international_address_req(sandbox_tenant, must_collect_data):
    obc = create_ob_config(
        sandbox_tenant,
        "International config",
        must_collect_data,
        must_collect_data,
        allow_international_residents=True,
    )
    bifrost = BifrostClient.new_user(obc)

    # Add address line 1 and country, which is sufficient ONLY if the country is non-US
    data = {"id.address_line1": "730 Hayes St", "id.country": "US"}
    patch("/hosted/user/vault", data, bifrost.auth_token)

    # We should still be required to collect address and ssn9
    status = bifrost.get_status()
    req = get_requirement_from_requirements("collect_data", status["all_requirements"])
    assert "full_address" in req["missing_attributes"]
    assert "ssn9" in req["missing_attributes"]

    # Then add international address
    data = {"id.address_line1": "730 Hayes St", "id.country": "MX"}
    patch("/hosted/user/vault", data, bifrost.auth_token)

    # Address CDO shuold be met, as well as ssn9
    status = bifrost.get_status()
    req = get_requirement_from_requirements("collect_data", status["all_requirements"])
    assert "full_address" not in req["missing_attributes"]
    assert "ssn9" not in req["missing_attributes"]
    fields_to_authorize = get_requirement_from_requirements(
        "authorize", status["all_requirements"], is_met=True
    )["fields_to_authorize"]["collected_data"]
    assert "ssn9" not in fields_to_authorize


def test_user_without_documents_international(
    sandbox_tenant, must_collect_data, can_access_data
):
    obc = create_ob_config(
        sandbox_tenant,
        "International config",
        must_collect_data,
        can_access_data,
        allow_international_residents=True,
    )
    bifrost = BifrostClient.new_user(obc)
    status = bifrost.get_status()
    doc_requirement_before = get_requirement_from_requirements(
        "collect_document", status["all_requirements"]
    )
    assert doc_requirement_before is None

    # simulate collecting international address
    bifrost.data["id.country"] = "MX"
    bifrost.handle_requirements(kind="collect_data")
    bifrost.handle_requirements(kind="liveness")

    status = bifrost.get_status()
    doc_requirement_after = get_requirement_from_requirements(
        "collect_document", status["all_requirements"]
    )

    # now we have to collect a document since they are non-US
    country_doc_mapping = doc_requirement_after["config"][
        "supported_country_and_doc_types"
    ]
    n_countries = 0
    for country, doc_types in country_doc_mapping.items():
        # all non-US have only passport
        if country != "US":
            assert doc_types == ["passport"]

        n_countries += 1

    # we have all iso3166 countries allowed
    assert n_countries == 249


def test_with_documents_handles_international_address(
    sandbox_tenant, must_collect_data, can_access_data
):
    obc = create_ob_config(
        sandbox_tenant,
        "International config",
        must_collect_data + ["document_and_selfie"],
        can_access_data + ["document_and_selfie"],
        allow_international_residents=True,
    )
    bifrost = BifrostClient.new_user(obc)
    bifrost.data["id.country"] = "MX"
    bifrost.handle_requirements(kind="collect_data")
    bifrost.handle_requirements(kind="liveness")

    status = bifrost.get_status()

    doc_requirement = get_requirement_from_requirements(
        "collect_document", status["all_requirements"]
    )
    assert doc_requirement["config"]["should_collect_selfie"]
    # we'll accept any country

    country_doc_mapping = doc_requirement["config"]["supported_country_and_doc_types"]
    n_countries = 0
    for country, doc_types in country_doc_mapping.items():
        # all non-US have only passport
        if country != "US":
            assert doc_types == ["passport"]

        n_countries += 1

    # we have all iso3166 countries allowed
    assert n_countries == 249


def test_with_documents_handles_international_address_restricted_documents(
    sandbox_tenant, must_collect_data, can_access_data
):
    obc = create_ob_config(
        sandbox_tenant,
        "International config",
        must_collect_data + ["document_and_selfie"],
        can_access_data + ["document_and_selfie"],
        allow_international_residents=True,
        international_country_restrictions=["MX", "NO"],
    )
    bifrost = BifrostClient.new_user(obc)
    bifrost.data["id.country"] = "MX"
    bifrost.handle_requirements(kind="collect_data")
    bifrost.handle_requirements(kind="liveness")

    status = bifrost.get_status()

    doc_requirement = get_requirement_from_requirements(
        "collect_document", status["all_requirements"]
    )
    assert doc_requirement["config"]["should_collect_selfie"]

    country_doc_mapping = doc_requirement["config"]["supported_country_and_doc_types"]
    assert country_doc_mapping["MX"] == ["passport"]
    assert country_doc_mapping["NO"] == ["passport"]
    # we have all countries allowed for passport
    assert len(country_doc_mapping.keys()) == 249
    for doc in country_doc_mapping.values():
        assert doc == ["passport"]


def test_with_documents_handles_international_address_restricted_documents_with_dl(
    sandbox_tenant, must_collect_data, can_access_data
):
    # in this test we expect to see the following behavior:
    #
    # user can onboard from US, MX, or NO
    # user can supply DL or passport, but DL ONLY if they are residing in the US
    # if user is not in the US, they can only give passport
    obc = create_ob_config(
        sandbox_tenant,
        "International config weird case",
        must_collect_data + ["document.drivers_license,passport.none.require_selfie"],
        can_access_data,
        allow_international_residents=True,
        international_country_restrictions=["US", "MX", "NO"],
    )
    bifrost = BifrostClient.new_user(obc)
    status_before_address = bifrost.get_status()
    doc_requirement_before_address = get_requirement_from_requirements(
        "collect_document", status_before_address["all_requirements"]
    )
    country_doc_mapping_before_address = doc_requirement_before_address["config"][
        "supported_country_and_doc_types"
    ]
    assert set(country_doc_mapping_before_address["US"]) == set(
        ["drivers_license", "passport"]
    )

    # collect MX address
    bifrost.data["id.country"] = "MX"
    bifrost.handle_requirements(kind="collect_data")
    bifrost.handle_requirements(kind="liveness")

    status = bifrost.get_status()

    # Now we should only see passport available for us
    doc_requirement = get_requirement_from_requirements(
        "collect_document", status["all_requirements"]
    )
    assert doc_requirement["config"]["should_collect_selfie"]

    country_doc_mapping = doc_requirement["config"]["supported_country_and_doc_types"]
    assert country_doc_mapping["MX"] == ["passport"]
    assert country_doc_mapping["NO"] == ["passport"]
    assert country_doc_mapping["US"] == ["passport"]
    # we have all countries allowed for passport
    assert len(country_doc_mapping.keys()) == 249
    for doc in country_doc_mapping.values():
        assert doc == ["passport"]


def test_us_legal_status(sandbox_tenant):
    obc = create_ob_config(
        sandbox_tenant,
        "KYC with legal status",
        must_collect_data=[
            "full_address",
            "name",
            "phone_number",
            "email",
            "us_legal_status",
        ],
        can_access_data=[
            "full_address",
            "name",
            "phone_number",
            "email",
            "us_legal_status",
        ],
        optional_data=[],
        allow_international_residents=True,
    )
    bifrost = BifrostClient.new_user(obc)

    status_before_address = bifrost.get_status()
    collect_data_requirement_before_address = get_requirement_from_requirements(
        "collect_data", status_before_address["all_requirements"]
    )

    assert (
        "us_legal_status"
        in collect_data_requirement_before_address["missing_attributes"]
    )

    # collect MX address
    bifrost.data["id.country"] = "MX"
    # remove legal status
    bifrost.data.pop("id.us_legal_status")
    bifrost.handle_requirements(kind="collect_data")
    bifrost.handle_requirements(kind="liveness")

    status = bifrost.get_status()
    collect_data_requirement_after_address = get_requirement_from_requirements(
        "collect_data", status["all_requirements"]
    )

    assert collect_data_requirement_after_address is None

    fields_to_authorize = get_requirement_from_requirements(
        "authorize", status["all_requirements"], is_met=True
    )["fields_to_authorize"]["collected_data"]
    assert "us_legal_status" not in fields_to_authorize
