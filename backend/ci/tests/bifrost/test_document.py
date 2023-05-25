from tests.bifrost_client import BifrostClient


def test_upload_documents(doc_request_sandbox_ob_config, twilio):
    # TODO need to make this with non-sandbox in order to actually test workflow
    bifrost = BifrostClient(doc_request_sandbox_ob_config, twilio)
    bifrost.run()

    assert any(r["kind"] == "collect_document" for r in bifrost.handled_requirements)
