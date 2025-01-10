from tests.bifrost_client import BifrostClient
from tests.utils import get, post, create_ob_config, _gen_random_sandbox_id
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
            assert (
                audit_event["detail"]["data"]["reason"] == "Reviewing AML information"
            )
            assert audit_event["detail"]["data"]["decrypted_fields"] == [
                "id.first_name",
                "id.last_name",
                "id.dob",
            ]

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


def test_synthetic(sandbox_tenant, must_collect_data):
    obc = create_ob_config(
        sandbox_tenant,
        "sentilink",
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
            {"kind": "sentilink", "data": {}},
        ],
    )

    bifrost = BifrostClient.new_user(obc, fixture_result="fail")
    user = bifrost.run()

    risk_signals = get(
        f"entities/{user.fp_id}/risk_signals", None, sandbox_tenant.sk.key
    )
    test_ran = False
    for risk_signal in risk_signals:
        rs = get(
            f"entities/{user.fp_id}/risk_signals/{risk_signal['id']}",
            None,
            *sandbox_tenant.db_auths,
        )

        if rs["reason_code"].startswith("sentilink"):
            assert rs["has_sentilink_detail"]

            sentilink_detail = post(
                f"entities/{user.fp_id}/sentilink/{risk_signal['id']}",
                None,
                *sandbox_tenant.db_auths,
            )

            assert sentilink_detail["synthetic"]["score"] > 800
            assert sentilink_detail["synthetic"]["score_band"] == "high"
            synthetic_rs = sentilink_detail["synthetic"]["reason_codes"]
            assert len(synthetic_rs) == 3
            # check that we are displaying in human readable form
            assert any([rs["code"] == "name_or_ssn_is_nonsense" for rs in synthetic_rs])

            assert sentilink_detail["id_theft"]["score"] is not None
            assert len(sentilink_detail["id_theft"]["reason_codes"]) == 3
            assert sentilink_detail["id_theft"]["score_band"] == "low"
            test_ran = True
        else:
            assert not rs["has_sentilink_detail"]
            post(
                f"entities/{user.fp_id}/sentilink/{risk_signal['id']}",
                None,
                *sandbox_tenant.db_auths,
                status_code=400,
            )

    assert test_ran


def test_onboarding(sandbox_tenant, must_collect_data):
    obc = alpaca_kyc_ob_config(sandbox_tenant, must_collect_data + ["investor_profile"])
    bifrost = BifrostClient.new_user(obc, fixture_result="manual_review")
    user = bifrost.run()

    onboardings = get(
        f"entities/{user.fp_id}/onboardings", None, *sandbox_tenant.db_auths
    )
    assert len(onboardings["data"]) == 1
    onboarding_id = onboardings["data"][0]["id"]

    risk_signals = get(
        f"entities/{user.fp_id}/onboardings/{onboarding_id}/risk_signals",
        None,
        *sandbox_tenant.db_auths,
    )

    assert set(["watchlist_hit_ofac", "adverse_media_hit"]) <= set(
        [rs["reason_code"] for rs in risk_signals]
    )

    bifrost = BifrostClient.new_user(obc, fixture_result="pass")
    user = bifrost.run()

    onboardings = get(
        f"entities/{user.fp_id}/onboardings", None, *sandbox_tenant.db_auths
    )
    assert len(onboardings["data"]) == 1
    onboarding_id = onboardings["data"][0]["id"]

    risk_signals = get(
        f"entities/{user.fp_id}/onboardings/{onboarding_id}/risk_signals",
        None,
        *sandbox_tenant.db_auths,
    )

    assert not set(["watchlist_hit_ofac", "adverse_media_hit"]) <= set(
        [rs["reason_code"] for rs in risk_signals]
    )


def test_user_risk_signals(sandbox_tenant, must_collect_data):
    # Run a user through the onboarding flow
    bifrost = BifrostClient.new_user(
        sandbox_tenant.default_ob_config,
        fixture_result="pass",
    )

    user = bifrost.run()

    onboardings = get(
        f"entities/{user.fp_id}/onboardings", None, *sandbox_tenant.db_auths
    )
    assert len(onboardings["data"]) == 1
    onboarding_id = onboardings["data"][0]["id"]

    # Get the risk signals, none of them should be user_is_labeled_fraud
    risk_signals = get(
        f"entities/{user.fp_id}/onboardings/{onboarding_id}/risk_signals",
        None,
        *sandbox_tenant.db_auths,
    )

    assert not any(
        [rs["reason_code"] == "user_is_labeled_fraud" for rs in risk_signals]
    )
    body = get(f"/entities/{user.fp_id}/label", None, *sandbox_tenant.db_auths)
    assert body["kind"] is None

    # Now label user
    data = {"kind": "offboard_fraud"}
    post(f"/entities/{user.fp_id}/label", data, *sandbox_tenant.db_auths)
    body = get(f"/entities/{user.fp_id}/label", None, *sandbox_tenant.db_auths)
    assert body["kind"] == "offboard_fraud"

    other_obc = create_ob_config(
        sandbox_tenant,
        "other labeled fraud",
        [
            "name",
            "ssn9",
            "full_address",
            "email",
            "phone_number",
            "nationality",
            "dob",
            "document_and_selfie",
        ],
        kind="kyc",
    )
    # Run a user through another pb
    bifrost = BifrostClient.login_user(
        other_obc,
        bifrost.sandbox_id,
    )
    bifrost.run()
    onboardings = get(
        f"entities/{user.fp_id}/onboardings", None, *sandbox_tenant.db_auths
    )
    assert len(onboardings["data"]) == 2
    sorted_onboardings = sorted(
        onboardings["data"], key=lambda x: x["seqno"], reverse=True
    )
    onboarding_id = sorted_onboardings[0]["id"]

    risk_signals = get(
        f"entities/{user.fp_id}/onboardings/{onboarding_id}/risk_signals",
        None,
        *sandbox_tenant.db_auths,
    )
    # now we get the risk signal in the latest onboarding
    assert any([rs["reason_code"] == "user_is_labeled_fraud" for rs in risk_signals])

def test_risk_signals_spec(sandbox_tenant):
    body = get(f"/org/risk_signals_spec", None, *sandbox_tenant.db_auths)
    assert body["kyc"]
    assert body["doc"]
    assert body["behavior"]
    