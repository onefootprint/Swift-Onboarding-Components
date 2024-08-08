from tests.constants import FIXTURE_PHONE_NUMBER
from tests.utils import _gen_random_n_digit_number
from tests.bifrost_client import BifrostClient
from tests.utils import get, post
from tests.integrations.test_alpaca import alpaca_kyc_ob_config


def test_aml(sandbox_tenant, must_collect_data):
    obc = alpaca_kyc_ob_config(sandbox_tenant, must_collect_data + ["investor_profile"])
    bifrost = BifrostClient.new_user(obc, fixture_result="manual_review")
    user = bifrost.run()

    risk_signals = get(
        f"entities/{user.fp_id}/risk_signals", None, sandbox_tenant.sk.key
    )
    assert set(["watchlist_hit_ofac", "adverse_media_hit"]) <= set(
        [rs["reason_code"] for rs in risk_signals]
    )
    for risk_signal in risk_signals:
        rs = get(
            f"entities/{user.fp_id}/risk_signals/{risk_signal['id']}",
            None,
            *sandbox_tenant.db_auths,
        )

        if rs["reason_code"] in ["watchlist_hit_ofac", "adverse_media_hit"]:
            assert rs["has_aml_hits"] == True

            aml = post(
                f"entities/{user.fp_id}/decrypt_aml_hits/{risk_signal['id']}",
                None,
                *sandbox_tenant.db_auths,
            )

            audit_events = get(
                "org/audit_events",
                dict(search=user.fp_id),
                *sandbox_tenant.db_auths,
            )
            audit_event = audit_events["data"][0]
            assert audit_event["name"] == "decrypt_user_data"
            assert audit_event["detail"]["data"]["reason"] == "Reviewing AML information"
            assert audit_event["detail"]["data"]["decrypted_fields"] == ["id.first_name", "id.last_name", "id.dob"]

            assert (
                aml["share_url"]
                == "https://app.eu.complyadvantage.com/public/search/abc/123"
            )
            assert len(aml["hits"]) == 1
            assert aml["hits"][0]["name"] == "Piip Penguin"
            assert aml["hits"][0]["match_types"] == ["name_exact"]
            assert sorted(aml["hits"][0]["fields"].items()) == sorted(
                {
                    "Original Country Text": "Kenya, South Sudan, Sudan, Tanzania, United States",
                    "Country": "United States",
                    "Amended On": "2016-02-05",
                    "Place of Birth": "South Sudan",
                    "Date of Birth": "1943",
                    "Passport": "Passport: R123456789, South Sudan",
                    "Original Place of Birth Text": "South Sudan",
                    "Designation Date": "2014-03-01",
                    "Designation Act": "2014/302 (OJ L123)",
                    "Nationality": "South Sudan",
                }.items()
            )
            assert len(aml["hits"][0]["media"]) == 2
            assert sorted(aml["hits"][0]["media"][0].items()) == sorted(
                {
                    "date": "2002-10-01T00:00:00Z",
                    "pdf_url": None,
                    "snippet": '"Person of interest in fraud case',
                    "title": None,
                    "url": "http://www.cnn.com/",
                }.items()
            )
            assert sorted(aml["hits"][0]["media"][1].items()) == sorted(
                {
                    "date": "2015-06-06T00:00:00Z",
                    "pdf_url": None,
                    "snippet": "A CEO by the name of Piip Penguin has been found guilty of fraud",
                    "title": "Fraudulent CEO arrested",
                    "url": "http://www.bbc.com/",
                }.items()
            )
        else:
            assert rs["has_aml_hits"] == False
