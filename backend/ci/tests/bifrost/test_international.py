import pytest
from tests.bifrost_client import BifrostClient
from tests.utils import get_requirement_from_requirements, create_ob_config


def test_user_without_documents_international(sandbox_tenant, must_collect_data, can_access_data, twilio):
    obc = create_ob_config(
        sandbox_tenant,
        "International config",
        must_collect_data,
        can_access_data,
        allow_international_residents=True,
    )
    bifrost = BifrostClient.new(obc, twilio)
    status = bifrost.get_status()
    doc_requirement_before = get_requirement_from_requirements("collect_document", status['requirements'])
    assert doc_requirement_before is None

    # simulate collecting international address
    bifrost.data['id.country'] = 'MX'
    bifrost.handle_requirements(kind="collect_data")
    bifrost.handle_requirements(kind="liveness")

    status = bifrost.get_status()
    doc_requirement_after = get_requirement_from_requirements("collect_document", status['requirements'])

    # now we have to collect a document since they are non-US
    assert doc_requirement_after['supported_document_types'] == ['passport']
    # we'll allow any country
    assert len(doc_requirement_after['supported_countries']) > 1


def test_with_documents_handles_international_address(sandbox_tenant, must_collect_data, can_access_data, twilio):
    obc = create_ob_config(
        sandbox_tenant,
        "International config",
        must_collect_data + ["document_and_selfie"],
        can_access_data + ["document_and_selfie"],
        allow_international_residents=True
    )
    bifrost = BifrostClient.new(obc, twilio)
    bifrost.data['id.country'] = 'MX'
    bifrost.handle_requirements(kind="collect_data")
    bifrost.handle_requirements(kind="liveness")

    status = bifrost.get_status()
  
    doc_requirement = get_requirement_from_requirements("collect_document", status['requirements'])
    assert doc_requirement["should_collect_selfie"]
    assert doc_requirement["supported_document_types"] == ['passport']
    # we'll accept any country
    assert len(doc_requirement['supported_countries']) > 1


def test_with_documents_handles_international_address_restricted_documents(sandbox_tenant, must_collect_data, can_access_data, twilio):
    obc = create_ob_config(
        sandbox_tenant,
        "International config",
        must_collect_data + ["document_and_selfie"],
        can_access_data + ["document_and_selfie"],
        allow_international_residents=True,
        international_country_restrictions=['MX', 'NO']
    )
    bifrost = BifrostClient.new(obc, twilio)
    bifrost.data['id.country'] = 'MX'
    bifrost.handle_requirements(kind="collect_data")
    bifrost.handle_requirements(kind="liveness")

    status = bifrost.get_status()
  
    doc_requirement = get_requirement_from_requirements("collect_document", status['requirements'])
    assert doc_requirement["should_collect_selfie"]
    assert doc_requirement["supported_document_types"] == ['passport']
    # we'll accept any country
    assert doc_requirement['supported_countries'] == ['MX', 'NO', 'US']