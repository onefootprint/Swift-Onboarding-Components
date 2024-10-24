use super::vendor_parsable::AsParsedResponse;
use super::vendor_parsable::VendorParsable;
use crate::decision::vendor::vendor_result::VendorResult;
use crate::decision::vendor::verification_result::decrypt_verification_result_response;
use crate::FpError;
use crate::FpResult;
use crate::State;
use db::models::verification_request::VReqIdentifier;
use db::models::verification_request::VerificationRequest;
use db::models::verification_result::VerificationResult;
use db::DbResult;
use idv::VendorResponse;
use newtypes::EncryptedVaultPrivateKey;
use newtypes::VerificationResultId;

// Represents an attempt to load and deserialize a vendor API response
pub enum LoadVendorResponseResult<T> {
    NotFound,
    NoResponse,
    Success((T, VerificationRequest, VerificationResult)),
    Error(FpError),
}

impl<T> LoadVendorResponseResult<T> {
    pub fn ok(self) -> Option<(T, VerificationResultId)> {
        match self {
            LoadVendorResponseResult::NotFound => None,
            LoadVendorResponseResult::NoResponse => None,
            LoadVendorResponseResult::Success((r, _, vres)) => Some((r, vres.id)),
            LoadVendorResponseResult::Error(_) => None,
        }
    }
}

impl<T: AsParsedResponse> LoadVendorResponseResult<T> {
    pub fn into_vendor_result(self) -> Option<VendorResult> {
        match self {
            LoadVendorResponseResult::NotFound
            | LoadVendorResponseResult::NoResponse
            | LoadVendorResponseResult::Error(_) => None,

            LoadVendorResponseResult::Success((r, vreq, vres)) => {
                Some(VendorResult {
                    response: VendorResponse {
                        response: r.into_parsed_response(),
                        // TODO: get rid of this, and just use parsed response for vendor map
                        // https://linear.app/footprint/issue/FP-5624/just-use-parsed-resonse-and-stop-using-raw-response-on-vendor-result
                        raw_response: serde_json::json!({}).into(),
                    },
                    verification_request_id: vreq.id,
                    verification_result_id: vres.id,
                })
            }
        }
    }
}

// This method loads and deserializes the latest successful vendor response for a given VendorAPI
// for the given workflow.
//
// TODO: It won't load the _actual_ latest response if the latest response was an error, so maybe we
// need to revisit this at some point, but I think it's prob fine
#[tracing::instrument(skip(state, user_vault_private_key))]
pub async fn load_response_for_vendor_api<T>(
    state: &State,
    id: VReqIdentifier,
    user_vault_private_key: &EncryptedVaultPrivateKey,
    vendor_api_struct: T,
) -> FpResult<LoadVendorResponseResult<T::ParsedType>>
where
    T: VendorParsable + std::fmt::Debug,
{
    let vendor_api = vendor_api_struct.vendor_api();
    let requests_and_result = state
        .db_query(move |conn| -> DbResult<_> {
            VerificationRequest::get_latest_request_and_successful_result_for_vendor_api(conn, id, vendor_api)
        })
        .await?;

    let message = "load_response_for_vendor_api failed";

    let Some((vreq, vres)) = requests_and_result else {
        tracing::warn!(reason = "not found", ?vendor_api, message);
        return Ok(LoadVendorResponseResult::NotFound);
    };

    let Some(e_resp) = vres.e_response.as_ref() else {
        tracing::warn!(reason = "no response", ?vendor_api, message);
        return Ok(LoadVendorResponseResult::NoResponse);
    };

    let decrypted = decrypt_verification_result_response(
        &state.enclave_client,
        vec![e_resp.clone()],
        user_vault_private_key,
    )
    .await?;

    let Some(pii_json) = decrypted.first().cloned() else {
        tracing::warn!(reason = "no response after decrypt", ?vendor_api, message);
        return Ok(LoadVendorResponseResult::NoResponse);
    };

    match vendor_api_struct.parse(pii_json.into_leak()) {
        Ok(s) => Ok(LoadVendorResponseResult::Success((s, vreq, vres))),
        Err(e) => {
            tracing::warn!(reason = "deser error", ?vendor_api, message);
            Ok(LoadVendorResponseResult::Error(e.into()))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::decision::tests::test_helpers::create_kyc_user_and_wf;
    use crate::decision::tests::test_helpers::FixtureData;
    use crate::decision::vendor::vendor_api::loaders::load_response_for_vendor_api;
    use crate::decision::vendor::verification_result::encrypt_verification_result_response;
    use crate::State;
    use chrono::Utc;
    use db::models::decision_intent::DecisionIntent;
    use db::models::document::Document;
    use db::models::document::NewDocumentArgs;
    use db::models::document_request::DocumentRequest;
    use db::models::document_request::NewDocumentRequestArgs;
    use db::models::insight_event::CreateInsightEvent;
    use db::models::verification_request::NewVerificationRequestArgs;
    use db::models::verification_result::NewVerificationResult;
    use db::models::verification_result::VerificationResult;
    use db::tests::fixtures::ob_configuration::ObConfigurationOpts;
    use idv::test_incode_fixtures::DocTestOpts;
    use macros::test_state_case;
    use newtypes::vendor_api_struct::*;
    use newtypes::DecisionIntentId;
    use newtypes::DecisionIntentKind;
    use newtypes::DocumentAndCountryConfiguration;
    use newtypes::DocumentId;
    use newtypes::DocumentKind;
    use newtypes::DocumentRequestConfig;
    use newtypes::ScopedVaultId;
    use newtypes::VendorAPI;
    use newtypes::WorkflowId;

    #[test_state_case(VendorAPI::ExperianPreciseId)]
    #[test_state_case(VendorAPI::IncodeApproveSession)]
    #[test_state_case(VendorAPI::IdologyExpectId)]
    #[test_state_case(VendorAPI::IncodeFetchScores)]
    #[test_state_case(VendorAPI::IncodeFetchOcr)]
    #[test_state_case(VendorAPI::IncodeUpdatedWatchlistResult)]
    #[test_state_case(VendorAPI::IncodeWatchlistCheck)]
    #[test_state_case(VendorAPI::IdologyPa)]
    #[test_state_case(VendorAPI::LexisFlexId)]
    #[test_state_case(VendorAPI::MiddeskGetBusiness)]
    #[test_state_case(VendorAPI::MiddeskBusinessUpdateWebhook)]
    #[test_state_case(VendorAPI::SambaLicenseValidationCreate)]
    #[tokio::test(flavor = "multi_thread")]
    async fn test_load_response_for_vendor_api_for_multiple_apis(state: &mut State, vendor_api: VendorAPI) {
        let FixtureData {
            wf, v: uv, sv: su, ..
        } = create_kyc_user_and_wf(
            state,
            ObConfigurationOpts {
                is_live: true,
                ..Default::default()
            },
            None,
            None,
        )
        .await;
        let sv_id = su.id.clone();
        let wf_id = wf.id.clone();
        let v_pub_key = uv.public_key.clone();

        let (vres_id_to_check, di_id, doc_id) = state
            .db_transaction(move |conn| -> FpResult<_> {
                let di = DecisionIntent::get_or_create_for_workflow(
                    conn,
                    &sv_id,
                    &wf_id,
                    DecisionIntentKind::OnboardingKyc,
                )
                .unwrap();

                // test retrieving by document_id as well
                let id_doc_id = if vendor_api.is_incode_doc_flow_api() {
                    let dr_args = NewDocumentRequestArgs {
                        scoped_vault_id: sv_id.clone(),
                        workflow_id: wf_id.clone(),
                        rule_set_result_id: None,
                        config: DocumentRequestConfig::Identity {
                            collect_selfie: false,
                            document_types_and_countries: Some(DocumentAndCountryConfiguration::default()),
                        },
                    };

                    let dr = DocumentRequest::get_or_create(conn, dr_args).unwrap();
                    let doc_args = NewDocumentArgs {
                        request_id: dr.id,
                        document_type: DocumentKind::DriversLicense,
                        country_code: Some(newtypes::Iso3166TwoDigitCountryCode::US),
                        fixture_result: None,
                        skip_selfie: None,
                        device_type: None,
                        insight: CreateInsightEvent::default(),
                    };
                    let doc_id = Document::get_or_create(conn, doc_args).unwrap();

                    Some(doc_id.id)
                } else {
                    None
                };

                // Save a requests and stash the vres_id of the one we should find via the query
                let mut vres_id_to_check = None;
                for val in [(true, true), (false, false), (false, true)] {
                    let (is_error, should_save_vres) = val;


                    let args = NewVerificationRequestArgs {
                        scoped_vault_id: &sv_id,
                        decision_intent_id: &di.id,
                        identity_document_id: id_doc_id.as_ref(),
                        vendor_api,
                    };
                    let vreq = VerificationRequest::create(conn, args).unwrap();

                    let raw = vendor_api_fixture(vendor_api);
                    let pii_json = raw.clone().into();
                    let e_response = encrypt_verification_result_response(&pii_json, &v_pub_key).ok();
                    let new_vres = NewVerificationResult {
                        request_id: vreq.id.clone(),
                        response: raw.into(),
                        timestamp: Utc::now(),
                        e_response,
                        is_error,
                    };

                    if should_save_vres {
                        let mut vres_id = VerificationResult::bulk_create(conn, vec![new_vres]).unwrap();

                        if !is_error {
                            vres_id_to_check = vres_id.pop().map(|v| v.id);
                        }
                    }
                }

                Ok((vres_id_to_check, di.id, id_doc_id))
            })
            .await
            .unwrap();

        let sv_id2 = su.id.clone();
        let test_ran = match vendor_api {
            VendorAPI::IdologyExpectId => {
                assert_results(
                    state,
                    wf.id,
                    di_id,
                    sv_id2,
                    doc_id,
                    &uv.e_private_key,
                    vres_id_to_check,
                    IdologyExpectId,
                )
                .await
            }
            VendorAPI::IdologyPa => {
                assert_results(
                    state,
                    wf.id,
                    di_id,
                    sv_id2,
                    doc_id,
                    &uv.e_private_key,
                    vres_id_to_check,
                    IdologyPa,
                )
                .await
            }
            VendorAPI::TwilioLookupV2 => todo!(),
            VendorAPI::SocureIdPlus => todo!(),
            VendorAPI::ExperianPreciseId => {
                assert_results(
                    state,
                    wf.id,
                    di_id,
                    sv_id2,
                    doc_id,
                    &uv.e_private_key,
                    vres_id_to_check,
                    ExperianPreciseId,
                )
                .await
            }
            VendorAPI::MiddeskCreateBusiness => todo!(),
            VendorAPI::MiddeskGetBusiness => {
                assert_results(
                    state,
                    wf.id,
                    di_id,
                    sv_id2,
                    doc_id,
                    &uv.e_private_key,
                    vres_id_to_check,
                    MiddeskGetBusiness,
                )
                .await
            }
            VendorAPI::MiddeskBusinessUpdateWebhook => {
                assert_results(
                    state,
                    wf.id,
                    di_id,
                    sv_id2,
                    doc_id,
                    &uv.e_private_key,
                    vres_id_to_check,
                    MiddeskBusinessUpdateWebhook,
                )
                .await
            }
            VendorAPI::MiddeskTinRetriedWebhook => todo!(),
            VendorAPI::IncodeStartOnboarding => todo!(),
            VendorAPI::IncodeAddFront => todo!(),
            VendorAPI::IncodeAddBack => todo!(),
            VendorAPI::IncodeProcessId => todo!(),
            VendorAPI::IncodeFetchScores => {
                assert_results(
                    state,
                    wf.id,
                    di_id,
                    sv_id2,
                    doc_id,
                    &uv.e_private_key,
                    vres_id_to_check,
                    IncodeFetchScores,
                )
                .await
            }
            VendorAPI::IncodeAddPrivacyConsent => todo!(),
            VendorAPI::IncodeAddMlConsent => todo!(),
            VendorAPI::IncodeFetchOcr => {
                assert_results(
                    state,
                    wf.id,
                    di_id,
                    sv_id2,
                    doc_id,
                    &uv.e_private_key,
                    vres_id_to_check,
                    IncodeFetchOcr,
                )
                .await
            }
            VendorAPI::IncodeAddSelfie => todo!(),
            VendorAPI::IncodeWatchlistCheck => {
                assert_results(
                    state,
                    wf.id,
                    di_id,
                    sv_id2,
                    doc_id,
                    &uv.e_private_key,
                    vres_id_to_check,
                    IncodeWatchlistCheck,
                )
                .await
            }
            VendorAPI::IncodeUpdatedWatchlistResult => {
                assert_results(
                    state,
                    wf.id,
                    di_id,
                    sv_id2,
                    doc_id,
                    &uv.e_private_key,
                    vres_id_to_check,
                    IncodeUpdatedWatchlistResult,
                )
                .await
            }
            VendorAPI::IncodeGetOnboardingStatus => todo!(),
            VendorAPI::IncodeProcessFace => todo!(),
            VendorAPI::IncodeCurpValidation => todo!(),
            VendorAPI::IncodeGovernmentValidation => todo!(),
            VendorAPI::IncodeApproveSession => {
                assert_results(
                    state,
                    wf.id,
                    di_id,
                    sv_id2,
                    doc_id,
                    &uv.e_private_key,
                    vres_id_to_check,
                    IncodeApproveSession,
                )
                .await
            }
            VendorAPI::StytchLookup => todo!(),
            VendorAPI::FootprintDeviceAttestation => todo!(),
            VendorAPI::AwsRekognition => todo!(),
            VendorAPI::AwsTextract => todo!(),
            VendorAPI::LexisFlexId => {
                assert_results(
                    state,
                    wf.id,
                    di_id,
                    sv_id2,
                    doc_id,
                    &uv.e_private_key,
                    vres_id_to_check,
                    LexisFlexId,
                )
                .await
            }
            VendorAPI::NeuroIdAnalytics => todo!(),
            VendorAPI::SambaLicenseValidationCreate => {
                assert_results(
                    state,
                    wf.id,
                    di_id,
                    sv_id2,
                    doc_id,
                    &uv.e_private_key,
                    vres_id_to_check,
                    SambaLicenseValidationCreate,
                )
                .await
            }
            VendorAPI::SambaLicenseValidationGetStatus => todo!(),
            VendorAPI::SambaLicenseValidationGetReport => todo!(),
            VendorAPI::SentilinkApplicationRisk => todo!(),
        };

        assert!(test_ran)
    }

    #[allow(clippy::too_many_arguments)]
    async fn assert_results<T>(
        state: &State,
        wf_id: WorkflowId,
        di_id: DecisionIntentId,
        sv_id: ScopedVaultId,
        doc_id: Option<DocumentId>,
        e_key: &EncryptedVaultPrivateKey,
        vres_id_to_check: Option<VerificationResultId>,
        vendor_api_struct: T,
    ) -> bool
    where
        T: VendorParsable + std::fmt::Debug,
    {
        let vres_to_check = vres_id_to_check.unwrap();
        let (_, vres_id) = load_response_for_vendor_api(
            state,
            VReqIdentifier::WfId(wf_id),
            e_key,
            vendor_api_struct.clone(),
        )
        .await
        .unwrap()
        .ok()
        .unwrap();

        assert_eq!(vres_id, vres_to_check);

        // try fetching via DI too
        let (_, vres_id) = load_response_for_vendor_api(
            state,
            VReqIdentifier::DiId(di_id.clone()),
            e_key,
            vendor_api_struct.clone(),
        )
        .await
        .unwrap()
        .ok()
        .unwrap();

        assert_eq!(vres_id, vres_to_check);

        // try fetching via SV too
        let (_, vres_id_sv) = load_response_for_vendor_api(
            state,
            VReqIdentifier::LatestForSv(sv_id),
            e_key,
            vendor_api_struct.clone(),
        )
        .await
        .unwrap()
        .ok()
        .unwrap();

        assert_eq!(vres_id_sv, vres_to_check);

        // try fetching via doc_id too
        if let Some(id) = doc_id {
            let (_, vres_id_doc) =
                load_response_for_vendor_api(state, VReqIdentifier::DocumentId(id), e_key, vendor_api_struct)
                    .await
                    .unwrap()
                    .ok()
                    .unwrap();

            assert_eq!(vres_id_doc, vres_to_check);
        }

        state
            .db_query(move |conn| -> FpResult<_> {
                let res = VerificationRequest::list(conn, &di_id).unwrap();
                let res_responses: Vec<_> = res
                    .clone()
                    .into_iter()
                    .filter(|(_, vres)| vres.is_some())
                    .collect();
                let res_error: Vec<_> = res
                    .clone()
                    .into_iter()
                    .filter(|(_, vres)| !vres.as_ref().map(|v| v.is_error).unwrap_or(true))
                    .collect();
                assert_eq!(res.len(), 3);
                assert_eq!(res_responses.len(), 2);
                assert_eq!(res_error.len(), 1);

                Ok(())
            })
            .await
            .unwrap();

        true
    }
    fn vendor_api_fixture(vendor_api: VendorAPI) -> serde_json::Value {
        match vendor_api {
            VendorAPI::IdologyExpectId => idv::test_fixtures::test_idology_expectid_response(),
            VendorAPI::IdologyPa => idv::test_fixtures::idology_pa_response(),
            VendorAPI::TwilioLookupV2 => todo!(),
            VendorAPI::SocureIdPlus => todo!(),
            VendorAPI::ExperianPreciseId => idv::test_fixtures::experian_cross_core_response(None, None),
            VendorAPI::MiddeskCreateBusiness => todo!(),
            VendorAPI::MiddeskGetBusiness => idv::test_fixtures::middesk_business_response(),
            VendorAPI::MiddeskBusinessUpdateWebhook => {
                idv::test_fixtures::middesk_business_update_webhook_response()
            }
            VendorAPI::MiddeskTinRetriedWebhook => todo!(),
            VendorAPI::IncodeStartOnboarding => todo!(),
            VendorAPI::IncodeAddFront => todo!(),
            VendorAPI::IncodeAddBack => todo!(),
            VendorAPI::IncodeProcessId => todo!(),
            VendorAPI::IncodeFetchScores => {
                let opts = DocTestOpts::default();
                idv::test_incode_fixtures::incode_fetch_scores_response(opts)
            }
            VendorAPI::IncodeAddPrivacyConsent => todo!(),
            VendorAPI::IncodeAddMlConsent => todo!(),
            VendorAPI::IncodeFetchOcr => idv::test_incode_fixtures::incode_fetch_ocr_response(None),
            VendorAPI::IncodeAddSelfie => todo!(),
            VendorAPI::IncodeWatchlistCheck => {
                idv::test_incode_fixtures::incode_watchlist_result_response_yes_hits()
            }
            VendorAPI::IncodeUpdatedWatchlistResult => {
                // same response struct
                idv::test_incode_fixtures::incode_watchlist_result_response_yes_hits()
            }
            VendorAPI::IncodeGetOnboardingStatus => todo!(),
            VendorAPI::IncodeProcessFace => todo!(),
            VendorAPI::IncodeCurpValidation => idv::test_incode_fixtures::incode_curp_validation_good_curp(),
            VendorAPI::IncodeGovernmentValidation => todo!(),
            VendorAPI::IncodeApproveSession => {
                serde_json::json!({
                    "success": true,
                    "uuid": "6633fd78db92f2f14debb563",
                    "token": "eyJhbGciOiJIUzI1NiJ9.eyJleHRlcm5hbFVzZXJJZCI326IjY2MzNmZDc4ZGI5MmYyZjE0ZGViYjU2MyIsInJvbGUiOiJBQ0NFU1MiLCJUIjoiQyIsImtleVJlZiI6IjY0OWRjNzRkNGQzOTQxOWUzYmRiNmZlOSIsImV4cCI6MTcyMjYzMjA1NywiaWF0IjoxNzE0NjgzMjU3fQ.V7hpZs4jpUZrCh2IjKblhbYr5-dL1MTqtQRukY74-3o44",
                    "totalScore": "OK",
                    "existingCustomer": false
                })
            }
            VendorAPI::StytchLookup => todo!(),
            VendorAPI::FootprintDeviceAttestation => todo!(),
            VendorAPI::AwsRekognition => todo!(),
            VendorAPI::AwsTextract => todo!(),
            VendorAPI::LexisFlexId => idv::test_fixtures::passing_lexis_flex_id_response(),
            VendorAPI::NeuroIdAnalytics => todo!(),
            VendorAPI::SambaLicenseValidationCreate => {
                serde_json::json!({
                    "orderId": "f6113a2c-61e3-4ede-b8ad-aeaf67a80477"
                })
            }
            VendorAPI::SambaLicenseValidationGetStatus => todo!(),
            VendorAPI::SambaLicenseValidationGetReport => todo!(),
            VendorAPI::SentilinkApplicationRisk => todo!(),
        }
    }
}
