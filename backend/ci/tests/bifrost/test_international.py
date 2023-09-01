from tests.bifrost_client import BifrostClient
from tests.utils import get_requirement_from_requirements, create_ob_config, patch


def test_international_address_req(sandbox_tenant, must_collect_data, twilio):
    obc = create_ob_config(
        sandbox_tenant,
        "International config",
        must_collect_data,
        must_collect_data,
        allow_international_residents=True,
    )
    bifrost = BifrostClient.new(obc, twilio)

    # Add address line 1 and country, which is sufficient ONLY if the country is non-US
    data = {"id.address_line1": "730 Hayes St", "id.country": "US"}
    patch("/hosted/user/vault", data, bifrost.auth_token)

    # We should still be required to collect address and ssn9
    status = bifrost.get_status()
    req = get_requirement_from_requirements("collect_data", status["requirements"])
    assert "full_address" in req["missing_attributes"]
    assert "ssn9" in req["missing_attributes"]

    # Then add international address
    data = {"id.address_line1": "730 Hayes St", "id.country": "MX"}
    patch("/hosted/user/vault", data, bifrost.auth_token)

    # Address CDO shuold be met, as well as ssn9
    status = bifrost.get_status()
    req = get_requirement_from_requirements("collect_data", status["requirements"])
    assert "full_address" not in req["missing_attributes"]
    assert "ssn9" not in req["missing_attributes"]


def test_user_without_documents_international(
    sandbox_tenant, must_collect_data, can_access_data, twilio
):
    obc = create_ob_config(
        sandbox_tenant,
        "International config",
        must_collect_data,
        can_access_data,
        allow_international_residents=True,
    )
    bifrost = BifrostClient.new(obc, twilio)
    status = bifrost.get_status()
    doc_requirement_before = get_requirement_from_requirements(
        "collect_document", status["requirements"]
    )
    assert doc_requirement_before is None

    # simulate collecting international address
    bifrost.data["id.country"] = "MX"
    bifrost.handle_requirements(kind="collect_data")
    bifrost.handle_requirements(kind="liveness")

    status = bifrost.get_status()
    doc_requirement_after = get_requirement_from_requirements(
        "collect_document", status["requirements"]
    )

    # now we have to collect a document since they are non-US
    assert doc_requirement_after["supported_document_types"] == ["passport"]
    # we'll allow any country
    assert len(doc_requirement_after["supported_countries"]) > 1


def test_with_documents_handles_international_address(
    sandbox_tenant, must_collect_data, can_access_data, twilio
):
    obc = create_ob_config(
        sandbox_tenant,
        "International config",
        must_collect_data + ["document_and_selfie"],
        can_access_data + ["document_and_selfie"],
        allow_international_residents=True,
    )
    bifrost = BifrostClient.new(obc, twilio)
    bifrost.data["id.country"] = "MX"
    bifrost.handle_requirements(kind="collect_data")
    bifrost.handle_requirements(kind="liveness")

    status = bifrost.get_status()

    doc_requirement = get_requirement_from_requirements(
        "collect_document", status["requirements"]
    )
    assert doc_requirement["should_collect_selfie"]
    assert doc_requirement["supported_document_types"] == ["passport"]
    # we'll accept any country
    assert len(doc_requirement["supported_countries"]) > 1

def test_with_documents_handles_international_address_restricted_documents(
    sandbox_tenant, must_collect_data, can_access_data, twilio
):
    obc = create_ob_config(
        sandbox_tenant,
        "International config",
        must_collect_data + ["document_and_selfie"],
        can_access_data + ["document_and_selfie"],
        allow_international_residents=True,
        international_country_restrictions=["MX", "NO"],
    )
    bifrost = BifrostClient.new(obc, twilio)
    bifrost.data["id.country"] = "MX"
    bifrost.handle_requirements(kind="collect_data")
    bifrost.handle_requirements(kind="liveness")

    status = bifrost.get_status()

    doc_requirement = get_requirement_from_requirements(
        "collect_document", status["requirements"]
    )
    assert doc_requirement["should_collect_selfie"]
    assert doc_requirement["supported_document_types"] == ["passport"]
    # we'll only accept countries from the restriction list
    assert doc_requirement['supported_countries'] == ['MX', 'NO']
