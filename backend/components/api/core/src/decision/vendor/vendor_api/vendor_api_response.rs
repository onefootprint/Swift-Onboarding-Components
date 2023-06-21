use std::sync::Arc;

use db::{
    models::{
        vault::Vault,
        verification_request::{RequestAndMaybeResult, VerificationRequest},
        verification_result::VerificationResult,
    },
    DbError, DbPool,
};
use newtypes::{
    EncryptedVaultPrivateKey, OnboardingId, ScopedVaultId, SealedVaultBytes, VendorAPI, VerificationResultId,
};

use crate::{enclave_client::EnclaveClient, errors::ApiResult};

use idv::socure::response::SocureIDPlusResponse;
use idv::{
    experian::cross_core::response::CrossCoreAPIResponse, idology::expectid::response::ExpectIDResponse,
};

use idv::idology::pa::response::PaResponse;
use idv::incode::doc::response::{
    AddConsentResponse, AddSelfieResponse, AddSideResponse, FetchOCRResponse, FetchScoresResponse,
    GetOnboardingStatusResponse, ProcessFaceResponse, ProcessIdResponse,
};
use idv::incode::response::OnboardingStartResponse;
use idv::incode::watchlist::response::WatchlistResultResponse;
use idv::middesk::response::business::BusinessResponse;
use idv::middesk::response::webhook::{
    MiddeskBusinessUpdateWebhookResponse, MiddeskTinRetriedWebhookResponse,
};
use serde::de::DeserializeOwned;

use twilio::response::lookup::LookupV2Response;
use typedmap::{TypedMap, TypedMapKey};

use idv::idology::scan_onboarding::response::ScanOnboardingAPIResponse;
use idv::idology::scan_verify::response::{ScanVerifyAPIResponse, ScanVerifySubmissionAPIResponse};

use crate::decision::vendor::{
    vendor_result::VendorResult, verification_result::decrypt_verification_result_response,
};
use crate::ApiError;

use super::vendor_api_struct::*;

// Marker to annotate TypedMaps
pub struct VendorAPIResponseMarker;

// Structure that represents a mapping from VendorAPIStruct -> ResponseStruct (defined in `idv` crate)
//
// The bounds are for the Keys and for the Values respectively. TODO: I haven't been able to get the entire VendorAPIResponseMap type to be `Clone`
// though. Hence why it's wrapped in Arc down below
pub type VendorAPIResponseMap =
    TypedMap<VendorAPIResponseMarker, typedmap::clone::SyncCloneBounds, typedmap::clone::SyncCloneBounds>;

pub fn parse_response<T>(value: serde_json::Value) -> Result<T::Value, serde_json::Error>
where
    // it would be nice to define a `Parsable` trait and then use that impl TypedMapKey, but Rust has
    // restrictions on impling foreign traits in a generic manner, so we hack it
    T: TypedMapKey<VendorAPIResponseMarker>,
    T::Value: DeserializeOwned,
{
    let parsed: T::Value = serde_json::from_value(value)?;

    Ok(parsed)
}

// given a map and a raw response, parse and insert into our map
fn insert_map_entry<T>(
    map: &mut VendorAPIResponseMap,
    vendor_api_struct: T,
    raw_response: serde_json::Value,
) -> Result<(), serde_json::Error>
where
    T: TypedMapKey<VendorAPIResponseMarker> + 'static + Sync + Send + typedmap::clone::CloneAny,
    T::Value: DeserializeOwned + Send + Sync + typedmap::clone::CloneAny,
{
    map.insert(vendor_api_struct, parse_response::<T>(raw_response)?);

    Ok(())
}

// this is the translation between VendorAPI and our WrappedVendorAPI
fn build_parsed_vendor_response_map_entry(
    map: &mut VendorAPIResponseMap,
    raw_response: serde_json::Value,
    vendor_api: VendorAPI,
) -> Result<(), serde_json::Error> {
    match vendor_api {
        VendorAPI::IdologyExpectID => insert_map_entry(map, IdologyExpectID, raw_response)?,
        VendorAPI::IdologyScanVerifySubmission => {
            insert_map_entry(map, IdologyScanVerifySubmission, raw_response)?
        }
        VendorAPI::IdologyScanVerifyResults => insert_map_entry(map, IdologyScanVerifyResults, raw_response)?,
        VendorAPI::IdologyScanOnboarding => insert_map_entry(map, IdologyScanOnboarding, raw_response)?,
        VendorAPI::IdologyPa => insert_map_entry(map, IdologyPa, raw_response)?,
        VendorAPI::TwilioLookupV2 => insert_map_entry(map, TwilioLookupV2, raw_response)?,
        VendorAPI::SocureIDPlus => insert_map_entry(map, SocureIDPlus, raw_response)?,
        VendorAPI::ExperianPreciseID => insert_map_entry(map, ExperianPreciseID, raw_response)?,
        VendorAPI::MiddeskCreateBusiness => insert_map_entry(map, MiddeskCreateBusiness, raw_response)?,
        VendorAPI::MiddeskGetBusiness => insert_map_entry(map, MiddeskGetBusiness, raw_response)?,
        VendorAPI::MiddeskBusinessUpdateWebhook => {
            insert_map_entry(map, MiddeskBusinessUpdateWebhook, raw_response)?
        }
        VendorAPI::MiddeskTinRetriedWebhook => insert_map_entry(map, MiddeskTinRetriedWebhook, raw_response)?,
        VendorAPI::IncodeStartOnboarding => insert_map_entry(map, IncodeStartOnboarding, raw_response)?,
        VendorAPI::IncodeAddFront => insert_map_entry(map, IncodeAddFront, raw_response)?,
        VendorAPI::IncodeAddBack => insert_map_entry(map, IncodeAddBack, raw_response)?,
        VendorAPI::IncodeProcessId => insert_map_entry(map, IncodeProcessId, raw_response)?,
        VendorAPI::IncodeFetchScores => insert_map_entry(map, IncodeFetchScores, raw_response)?,
        VendorAPI::IncodeAddPrivacyConsent => insert_map_entry(map, IncodeAddPrivacyConsent, raw_response)?,
        VendorAPI::IncodeAddMLConsent => insert_map_entry(map, IncodeAddMLConsent, raw_response)?,
        VendorAPI::IncodeFetchOCR => insert_map_entry(map, IncodeFetchOCR, raw_response)?,
        VendorAPI::IncodeAddSelfie => insert_map_entry(map, IncodeAddSelfie, raw_response)?,
        VendorAPI::IncodeWatchlistCheck => insert_map_entry(map, IncodeWatchlistCheck, raw_response)?,
        VendorAPI::IncodeGetOnboardingStatus => {
            insert_map_entry(map, IncodeGetOnboardingStatus, raw_response)?
        }
        VendorAPI::IncodeProcessFace => insert_map_entry(map, IncodeProcessFace, raw_response)?,
    };

    Ok(())
}

// In many cases at the moment, we still have functions that return VendorResults.
// We also still need some things that VendorResults has that this map doesn't (like VerificationResultId). Eventually
// will get rid of this, but it's non-trivial
pub fn build_vendor_response_map_from_vendor_results(
    vendor_results: &[VendorResult],
) -> ApiResult<VendorAPIResponseMap> {
    let mut out_map: VendorAPIResponseMap = TypedMap::new_with_bounds();

    vendor_results.iter().try_for_each(|vr| -> Result<(), ApiError> {
        build_parsed_vendor_response_map_entry(
            &mut out_map,
            vr.response.raw_response.clone().into_leak(),
            VendorAPI::from(&vr.response.response),
        )?;

        Ok(())
    })?;

    Ok(out_map)
}

// Build a vendor response map from completed verification requests
pub async fn build_parsed_vendor_response_map(
    requests_and_results: Vec<(VerificationRequest, Option<VerificationResult>)>,
    enclave_client: &EnclaveClient,
    user_vault_private_key: &EncryptedVaultPrivateKey,
) -> Result<VendorAPIResponseMap, ApiError> {
    let requests_with_responses: Vec<(VerificationRequest, VerificationResult, SealedVaultBytes)> =
        requests_and_results
            .into_iter()
            .filter_map(|(request, result)| result.map(|r| (request, r)))
            .flat_map(|(req, res)| {
                res.e_response
                    .as_ref()
                    .map(|e| (req.clone(), res.clone(), e.clone()))
            })
            .collect();

    let encrypted_responses: Vec<SealedVaultBytes> =
        requests_with_responses.iter().map(|t| t.2.clone()).collect();

    let decrypted_responses =
        decrypt_verification_result_response(enclave_client, encrypted_responses, user_vault_private_key)
            .await?;

    let mut out_map: VendorAPIResponseMap = TypedMap::new_with_bounds();
    requests_with_responses
        .into_iter()
        .zip(decrypted_responses.into_iter())
        .try_for_each(
            |((request, _result, _e), decrypted_response)| -> Result<(), ApiError> {
                build_parsed_vendor_response_map_entry(
                    &mut out_map,
                    decrypted_response.into_leak(),
                    request.vendor_api,
                )?;

                Ok(())
            },
        )?;

    Ok(out_map)
}

#[derive(Clone)]
pub struct VendorRequests {
    // parsed requests that have completed
    pub completed_requests: Arc<VendorAPIResponseMap>,
    pub completed_verification_result_ids: Vec<VerificationResultId>,
    // requests that we do not yet have results for
    pub outstanding_requests: Vec<VerificationRequest>,
}

// TODO: Eventually used, but included for POC. Pull verification requests/results and produce a structure that is used
// to drive more vendor requests or proceed to decisioning
#[allow(unused)]
pub async fn get_latest_verification_requests_and_results(
    onboarding_id: &OnboardingId,
    scoped_user_id: &ScopedVaultId,
    db_pool: &DbPool,
    enclave_client: &EnclaveClient,
) -> ApiResult<VendorRequests> {
    let suid = scoped_user_id.clone();
    let requests_and_results = db_pool
        .db_query(move |conn| -> Result<Vec<RequestAndMaybeResult>, DbError> {
            // Load our requests and results
            // Importantly, this allows us to save VerificationRequests elsewhere in code and execute them here
            VerificationRequest::get_latest_requests_and_successful_results_for_scoped_user(conn, suid)
        })
        .await??;

    let obid = onboarding_id.clone();
    let uv = db_pool.db_query(move |conn| Vault::get(conn, &obid)).await??;
    let completed_verification_result_ids = requests_and_results
        .iter()
        .filter_map(|(_, vres)| vres.as_ref().map(|v| v.id.clone()))
        .collect();

    let previous_results =
        build_parsed_vendor_response_map(requests_and_results.clone(), enclave_client, &uv.e_private_key)
            .await?;

    let requests: Vec<VerificationRequest> = requests_and_results
        .into_iter()
        .filter_map(|(request, result)| {
            // Only send requests for which we don't already have a result
            if result.is_none() {
                Some(request)
            } else {
                None
            }
        })
        .collect();

    Ok(VendorRequests {
        completed_requests: Arc::new(previous_results),
        outstanding_requests: requests,
        completed_verification_result_ids,
    })
}

/// Typed Map impls
impl TypedMapKey<VendorAPIResponseMarker> for IdologyExpectID {
    type Value = ExpectIDResponse;
}
impl TypedMapKey<VendorAPIResponseMarker> for IdologyScanVerifySubmission {
    type Value = ScanVerifyAPIResponse;
}
impl TypedMapKey<VendorAPIResponseMarker> for IdologyScanVerifyResults {
    type Value = ScanVerifySubmissionAPIResponse;
}
impl TypedMapKey<VendorAPIResponseMarker> for IdologyScanOnboarding {
    type Value = ScanOnboardingAPIResponse;
}
impl TypedMapKey<VendorAPIResponseMarker> for IdologyPa {
    type Value = PaResponse;
}
impl TypedMapKey<VendorAPIResponseMarker> for TwilioLookupV2 {
    type Value = LookupV2Response;
}
impl TypedMapKey<VendorAPIResponseMarker> for SocureIDPlus {
    type Value = SocureIDPlusResponse;
}
impl TypedMapKey<VendorAPIResponseMarker> for ExperianPreciseID {
    type Value = CrossCoreAPIResponse;
}
impl TypedMapKey<VendorAPIResponseMarker> for MiddeskCreateBusiness {
    type Value = BusinessResponse;
}
impl TypedMapKey<VendorAPIResponseMarker> for MiddeskGetBusiness {
    type Value = BusinessResponse;
}
impl TypedMapKey<VendorAPIResponseMarker> for MiddeskBusinessUpdateWebhook {
    type Value = MiddeskBusinessUpdateWebhookResponse;
}
impl TypedMapKey<VendorAPIResponseMarker> for MiddeskTinRetriedWebhook {
    type Value = MiddeskTinRetriedWebhookResponse;
}
impl TypedMapKey<VendorAPIResponseMarker> for IncodeStartOnboarding {
    type Value = OnboardingStartResponse;
}
impl TypedMapKey<VendorAPIResponseMarker> for IncodeAddFront {
    type Value = AddSideResponse;
}
impl TypedMapKey<VendorAPIResponseMarker> for IncodeAddBack {
    type Value = AddSideResponse;
}
impl TypedMapKey<VendorAPIResponseMarker> for IncodeProcessId {
    type Value = ProcessIdResponse;
}
impl TypedMapKey<VendorAPIResponseMarker> for IncodeFetchScores {
    type Value = FetchScoresResponse;
}
impl TypedMapKey<VendorAPIResponseMarker> for IncodeAddPrivacyConsent {
    type Value = AddConsentResponse;
}
impl TypedMapKey<VendorAPIResponseMarker> for IncodeAddMLConsent {
    type Value = AddConsentResponse;
}
impl TypedMapKey<VendorAPIResponseMarker> for IncodeFetchOCR {
    type Value = FetchOCRResponse;
}
impl TypedMapKey<VendorAPIResponseMarker> for IncodeAddSelfie {
    type Value = AddSelfieResponse;
}
impl TypedMapKey<VendorAPIResponseMarker> for IncodeWatchlistCheck {
    type Value = WatchlistResultResponse;
}
impl TypedMapKey<VendorAPIResponseMarker> for IncodeGetOnboardingStatus {
    type Value = GetOnboardingStatusResponse;
}
impl TypedMapKey<VendorAPIResponseMarker> for IncodeProcessFace {
    type Value = ProcessFaceResponse;
}

#[cfg(test)]
mod tests {
    use super::VendorAPIResponseMap;
    use newtypes::VendorAPI;
    use typedmap::TypedMap;

    use crate::decision::vendor::vendor_api::vendor_api_struct::{
        ExperianPreciseID, IdologyExpectID, IdologyScanOnboarding,
    };

    #[test]
    fn test_build_parsed_vendor_response_map() {
        let responses = vec![
            (
                VendorAPI::IdologyExpectID,
                idv::test_fixtures::test_idology_expectid_response(),
            ),
            (
                VendorAPI::ExperianPreciseID,
                idv::test_fixtures::experian_cross_core_response(),
            ),
        ];

        let mut map: VendorAPIResponseMap = TypedMap::new_with_bounds();

        responses.into_iter().for_each(|(vendor_api, raw_response)| {
            super::build_parsed_vendor_response_map_entry(&mut map, raw_response, vendor_api).unwrap();
        });

        assert_eq!(2, map.len());
        assert!(map.get(&IdologyExpectID).is_some());
        assert!(map.get(&ExperianPreciseID).is_some());
        assert!(map.get(&IdologyScanOnboarding).is_none())
    }
}
