use db::{models::verification_request::VerificationRequest, DbResult};
use newtypes::{EncryptedVaultPrivateKey, VerificationResultId, WorkflowId};

use crate::{
    decision::vendor::verification_result::decrypt_verification_result_response, errors::ApiResult, ApiError,
    State,
};

use super::vendor_parsable::VendorParsable;


// Represents an attempt to load and deserialize a vendor API response
pub enum LoadVendorResponseResult<T> {
    NotFound,
    NoResponse,
    Success((T, VerificationResultId)),
    Error(ApiError),
}

impl<T> LoadVendorResponseResult<T> {
    pub fn ok(self) -> Option<(T, VerificationResultId)> {
        match self {
            LoadVendorResponseResult::NotFound => None,
            LoadVendorResponseResult::NoResponse => None,
            LoadVendorResponseResult::Success(r) => Some(r),
            LoadVendorResponseResult::Error(_) => None,
        }
    }
}


// This method loads and deserializes the latest successful vendor response for a given VendorAPI
// for the given workflow.
//
// TODO: It won't load the _actual_ latest response if the latest response was an error, so maybe we need to revisit this at some point, but I think it's prob fine
pub async fn load_response_for_vendor_api<T>(
    state: &State,
    wf_id: &WorkflowId,
    user_vault_private_key: &EncryptedVaultPrivateKey,
    vendor_api_struct: T,
) -> ApiResult<LoadVendorResponseResult<T::ParsedType>>
where
    T: VendorParsable,
{
    let wfid = wf_id.clone();
    let vendor_api = vendor_api_struct.vendor_api();
    let requests_and_result = state
        .db_pool
        .db_query(move |conn| -> DbResult<_> {
            VerificationRequest::get_latest_request_and_successful_result_for_vendor_api(
                conn, &wfid, vendor_api,
            )
        })
        .await?;

    let Some((_, vres)) = requests_and_result else {
        return Ok(LoadVendorResponseResult::NotFound);
    };

    let Some(e_resp) = vres.e_response.as_ref() else {
        return Ok(LoadVendorResponseResult::NoResponse);
    };

    let decrypted = decrypt_verification_result_response(
        &state.enclave_client,
        vec![e_resp.clone()],
        user_vault_private_key,
    )
    .await?;


    let Some(pii_json) = decrypted.first().cloned() else {
        return Ok(LoadVendorResponseResult::NoResponse);
    };

    match vendor_api_struct.parse(pii_json.into_leak()) {
        Ok(s) => Ok(LoadVendorResponseResult::Success((s, vres.id.clone()))),
        Err(e) => Ok(LoadVendorResponseResult::Error(e.into())),
    }
}


#[cfg(test)]
mod tests {
    use super::*;
    use crate::{
        decision::{
            tests::test_helpers::{create_kyc_user_and_wf, FixtureData},
            vendor::{
                vendor_api::{loaders::load_response_for_vendor_api, vendor_api_struct::*},
                verification_result::encrypt_verification_result_response,
            },
        },
        State,
    };
    use chrono::Utc;
    use db::{
        models::{
            decision_intent::DecisionIntent,
            verification_request::NewVerificationRequestArgs,
            verification_result::{NewVerificationResult, VerificationResult},
        },
        tests::fixtures::ob_configuration::ObConfigurationOpts,
    };
    use idv::test_fixtures::DocTestOpts;
    use macros::test_state_case;
    use newtypes::{DecisionIntentKind, VendorAPI};


    #[test_state_case(VendorAPI::IncodeApproveSession)]
    #[test_state_case(VendorAPI::ExperianPreciseId)]
    #[test_state_case(VendorAPI::IncodeFetchScores)]
    #[test_state_case(VendorAPI::IncodeFetchOcr)]
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

        state
            .db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let di = DecisionIntent::get_or_create_for_workflow(
                    conn,
                    &sv_id,
                    &wf_id,
                    DecisionIntentKind::OnboardingKyc,
                )
                .unwrap();
                let args = NewVerificationRequestArgs {
                    scoped_vault_id: &sv_id,
                    decision_intent_id: &di.id,
                    identity_document_id: None,
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
                    is_error: false,
                };

                VerificationResult::bulk_create(conn, vec![new_vres]).unwrap();
                Ok(())
            })
            .await
            .unwrap();

        let test_ran = match vendor_api {
            VendorAPI::IdologyExpectId => {
                load_response_for_vendor_api(state, &wf.id, &uv.e_private_key, IdologyExpectID)
                    .await
                    .unwrap()
                    .ok()
                    .unwrap();
                true
            }
            VendorAPI::IdologyPa => todo!(),
            VendorAPI::TwilioLookupV2 => todo!(),
            VendorAPI::SocureIdPlus => todo!(),
            VendorAPI::ExperianPreciseId => {
                load_response_for_vendor_api(state, &wf.id, &uv.e_private_key, ExperianPreciseID)
                    .await
                    .unwrap()
                    .ok()
                    .unwrap();
                true
            }
            VendorAPI::MiddeskCreateBusiness => todo!(),
            VendorAPI::MiddeskGetBusiness => todo!(),
            VendorAPI::MiddeskBusinessUpdateWebhook => todo!(),
            VendorAPI::MiddeskTinRetriedWebhook => todo!(),
            VendorAPI::IncodeStartOnboarding => todo!(),
            VendorAPI::IncodeAddFront => todo!(),
            VendorAPI::IncodeAddBack => todo!(),
            VendorAPI::IncodeProcessId => todo!(),
            VendorAPI::IncodeFetchScores => {
                load_response_for_vendor_api(state, &wf.id, &uv.e_private_key, IncodeFetchScores)
                    .await
                    .unwrap()
                    .ok()
                    .unwrap();
                true
            }
            VendorAPI::IncodeAddPrivacyConsent => todo!(),
            VendorAPI::IncodeAddMlConsent => todo!(),
            VendorAPI::IncodeFetchOcr => {
                load_response_for_vendor_api(state, &wf.id, &uv.e_private_key, IncodeFetchOCR)
                    .await
                    .unwrap()
                    .ok()
                    .unwrap();
                true
            }
            VendorAPI::IncodeAddSelfie => todo!(),
            VendorAPI::IncodeWatchlistCheck => {
                load_response_for_vendor_api(state, &wf.id, &uv.e_private_key, IncodeWatchlistCheck)
                    .await
                    .unwrap()
                    .ok()
                    .unwrap();
                true
            }
            VendorAPI::IncodeUpdatedWatchlistResult => todo!(),
            VendorAPI::IncodeGetOnboardingStatus => todo!(),
            VendorAPI::IncodeProcessFace => todo!(),
            VendorAPI::IncodeCurpValidation => todo!(),
            VendorAPI::IncodeGovernmentValidation => todo!(),
            VendorAPI::IncodeApproveSession => {
                load_response_for_vendor_api(state, &wf.id, &uv.e_private_key, IncodeApproveSession)
                    .await
                    .unwrap()
                    .ok()
                    .unwrap();
                true
            }
            VendorAPI::StytchLookup => todo!(),
            VendorAPI::FootprintDeviceAttestation => todo!(),
            VendorAPI::AwsRekognition => todo!(),
            VendorAPI::AwsTextract => todo!(),
            VendorAPI::LexisFlexId => todo!(),
            VendorAPI::NeuroIdAnalytics => todo!(),
        };

        assert!(test_ran)
    }

    fn vendor_api_fixture(vendor_api: VendorAPI) -> serde_json::Value {
        match vendor_api {
            VendorAPI::IdologyExpectId => idv::test_fixtures::test_idology_expectid_response(),
            VendorAPI::IdologyPa => todo!(),
            VendorAPI::TwilioLookupV2 => todo!(),
            VendorAPI::SocureIdPlus => todo!(),
            VendorAPI::ExperianPreciseId => idv::test_fixtures::experian_cross_core_response(None),
            VendorAPI::MiddeskCreateBusiness => todo!(),
            VendorAPI::MiddeskGetBusiness => todo!(),
            VendorAPI::MiddeskBusinessUpdateWebhook => todo!(),
            VendorAPI::MiddeskTinRetriedWebhook => todo!(),
            VendorAPI::IncodeStartOnboarding => todo!(),
            VendorAPI::IncodeAddFront => todo!(),
            VendorAPI::IncodeAddBack => todo!(),
            VendorAPI::IncodeProcessId => todo!(),
            VendorAPI::IncodeFetchScores => {
                let opts = DocTestOpts::default();
                idv::test_fixtures::incode_fetch_scores_response(opts)
            }
            VendorAPI::IncodeAddPrivacyConsent => todo!(),
            VendorAPI::IncodeAddMlConsent => todo!(),
            VendorAPI::IncodeFetchOcr => idv::test_fixtures::incode_fetch_ocr_response(None),
            VendorAPI::IncodeAddSelfie => todo!(),
            VendorAPI::IncodeWatchlistCheck => {
                idv::test_fixtures::incode_watchlist_result_response_yes_hits()
            }
            VendorAPI::IncodeUpdatedWatchlistResult => todo!(),
            VendorAPI::IncodeGetOnboardingStatus => todo!(),
            VendorAPI::IncodeProcessFace => todo!(),
            VendorAPI::IncodeCurpValidation => idv::test_fixtures::incode_curp_validation_good_curp(),
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
            VendorAPI::LexisFlexId => todo!(),
            VendorAPI::NeuroIdAnalytics => todo!(),
        }
    }
}
