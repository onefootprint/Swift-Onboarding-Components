use db::models::{verification_request::VerificationRequest, verification_result::VerificationResult};
use idv::{
    incode::curp_validation::response::CurpValidationResponse, lexis::response::FlexIdResponse, stytch,
};
use newtypes::{
    EncryptedVaultPrivateKey, PiiJsonValue, ScrubbedPiiJsonValue, SealedVaultBytes, VendorAPI,
    VerificationRequestId, VerificationResultId,
};
use serde::Serialize;

use crate::{enclave_client::EnclaveClient, errors::ApiResult};

use idv::{
    experian::cross_core::response::CrossCoreAPIResponse, idology::expectid::response::ExpectIDResponse,
    socure::response::SocureIDPlusResponse,
};

use idv::{
    idology::pa::response::PaResponse,
    incode::{
        doc::response::{
            AddConsentResponse, AddSelfieResponse, AddSideResponse, FetchOCRResponse, FetchScoresResponse,
            GetOnboardingStatusResponse, ProcessFaceResponse, ProcessIdResponse,
        },
        response::OnboardingStartResponse,
        watchlist::response::{UpdatedWatchlistResultResponse, WatchlistResultResponse},
    },
    middesk::response::{
        business::BusinessResponse,
        webhook::{MiddeskBusinessUpdateWebhookResponse, MiddeskTinRetriedWebhookResponse},
    },
};
use serde::de::DeserializeOwned;

use twilio::response::lookup::LookupV2Response;
use typedmap::{TypedMap, TypedMapKey};

use crate::{
    decision::vendor::{
        vendor_result::VendorResult, verification_result::decrypt_verification_result_response,
    },
    ApiError,
};

use super::vendor_api_struct::*;

// Marker to annotate TypedMaps
pub struct VendorAPIResponseMarker;
pub struct VendorAPIResponseIdsMarker;

#[derive(Clone)]
pub struct VerificationRequestAndResult {
    pub verification_request_id: VerificationRequestId,
    pub verification_result_id: VerificationResultId,
}

// Structure that represents a mapping from VendorAPIStruct -> ResponseStruct (defined in `idv` crate)
//
// The bounds are for the Keys and for the Values respectively. TODO: I haven't been able to get the entire VendorAPIResponseMap type to be `Clone`
// though. Hence why it's wrapped in Arc down below
pub type VendorAPIResponseMap =
    TypedMap<VendorAPIResponseMarker, typedmap::clone::SyncCloneBounds, typedmap::clone::SyncCloneBounds>;

pub type VendorAPIResponseIdentifiersMap =
    TypedMap<VendorAPIResponseIdsMarker, typedmap::clone::SyncCloneBounds, typedmap::clone::SyncCloneBounds>;

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

fn scrub_response<T>(value: &PiiJsonValue) -> Result<ScrubbedPiiJsonValue, serde_json::Error>
where
    T: TypedMapKey<VendorAPIResponseMarker>,
    T::Value: DeserializeOwned + Serialize,
{
    let parsed: T::Value = serde_json::from_value(value.clone().into_leak())?;
    let scrubbed = ScrubbedPiiJsonValue::scrub(parsed)?;

    Ok(scrubbed)
}

pub fn scrub_raw_error_vendor_response(
    vendor_api: &VendorAPI,
    raw_response: &PiiJsonValue,
) -> Result<ScrubbedPiiJsonValue, serde_json::Error> {
    match vendor_api {
        VendorAPI::IdologyExpectId => scrub_response::<IdologyExpectID>(raw_response),
        VendorAPI::IdologyPa => scrub_response::<IdologyPa>(raw_response),
        VendorAPI::TwilioLookupV2 => scrub_response::<TwilioLookupV2>(raw_response),
        VendorAPI::SocureIdPlus => scrub_response::<SocureIDPlus>(raw_response),
        VendorAPI::ExperianPreciseId => scrub_response::<ExperianPreciseID>(raw_response),
        VendorAPI::MiddeskCreateBusiness => scrub_response::<MiddeskCreateBusiness>(raw_response),
        VendorAPI::MiddeskGetBusiness => scrub_response::<MiddeskGetBusiness>(raw_response),
        VendorAPI::MiddeskBusinessUpdateWebhook => {
            scrub_response::<MiddeskBusinessUpdateWebhook>(raw_response)
        }
        VendorAPI::MiddeskTinRetriedWebhook => scrub_response::<MiddeskTinRetriedWebhook>(raw_response),
        VendorAPI::IncodeStartOnboarding => scrub_response::<IncodeStartOnboarding>(raw_response),
        VendorAPI::IncodeAddFront => scrub_response::<IncodeAddFront>(raw_response),
        VendorAPI::IncodeAddBack => scrub_response::<IncodeAddBack>(raw_response),
        VendorAPI::IncodeProcessId => scrub_response::<IncodeProcessId>(raw_response),
        VendorAPI::IncodeFetchScores => scrub_response::<IncodeFetchScores>(raw_response),
        VendorAPI::IncodeAddPrivacyConsent => scrub_response::<IncodeAddPrivacyConsent>(raw_response),
        VendorAPI::IncodeAddMlConsent => scrub_response::<IncodeAddMLConsent>(raw_response),
        VendorAPI::IncodeFetchOcr => scrub_response::<IncodeFetchOCR>(raw_response),
        VendorAPI::IncodeAddSelfie => scrub_response::<IncodeAddSelfie>(raw_response),
        VendorAPI::IncodeWatchlistCheck => scrub_response::<IncodeWatchlistCheck>(raw_response),
        VendorAPI::IncodeUpdatedWatchlistResult => {
            scrub_response::<IncodeUpdatedWatchlistResult>(raw_response)
        }
        VendorAPI::IncodeGetOnboardingStatus => scrub_response::<IncodeGetOnboardingStatus>(raw_response),
        VendorAPI::IncodeProcessFace => scrub_response::<IncodeProcessFace>(raw_response),
        VendorAPI::StytchLookup => scrub_response::<StytchLookup>(raw_response),
        VendorAPI::FootprintDeviceAttestation => scrub_response::<FootprintDeviceAttestation>(raw_response),
        VendorAPI::AwsRekognition => scrub_response::<AwsRekognition>(raw_response),
        VendorAPI::AwsTextract => scrub_response::<AwsTextract>(raw_response),
        VendorAPI::LexisFlexId => scrub_response::<LexisFlexId>(raw_response),
        VendorAPI::IncodeCurpValidation => scrub_response::<IncodeCurpValidation>(raw_response),
        VendorAPI::IncodeGovernmentValidation => scrub_response::<IncodeIneData>(raw_response),
        VendorAPI::NeuroIdAnalytics => scrub_response::<NeuroIdAnalytics>(raw_response),
        VendorAPI::IncodeApproveSession => scrub_response::<IncodeApproveSession>(raw_response),
    }
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
        VendorAPI::IdologyExpectId => insert_map_entry(map, IdologyExpectID, raw_response)?,
        VendorAPI::IdologyPa => insert_map_entry(map, IdologyPa, raw_response)?,
        VendorAPI::TwilioLookupV2 => insert_map_entry(map, TwilioLookupV2, raw_response)?,
        VendorAPI::SocureIdPlus => insert_map_entry(map, SocureIDPlus, raw_response)?,
        VendorAPI::ExperianPreciseId => insert_map_entry(map, ExperianPreciseID, raw_response)?,
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
        VendorAPI::IncodeAddMlConsent => insert_map_entry(map, IncodeAddMLConsent, raw_response)?,
        VendorAPI::IncodeFetchOcr => insert_map_entry(map, IncodeFetchOCR, raw_response)?,
        VendorAPI::IncodeAddSelfie => insert_map_entry(map, IncodeAddSelfie, raw_response)?,
        VendorAPI::IncodeWatchlistCheck => insert_map_entry(map, IncodeWatchlistCheck, raw_response)?,
        VendorAPI::IncodeUpdatedWatchlistResult => {
            insert_map_entry(map, IncodeUpdatedWatchlistResult, raw_response)?
        }
        VendorAPI::IncodeGetOnboardingStatus => {
            insert_map_entry(map, IncodeGetOnboardingStatus, raw_response)?
        }
        VendorAPI::IncodeProcessFace => insert_map_entry(map, IncodeProcessFace, raw_response)?,
        VendorAPI::StytchLookup => insert_map_entry(map, StytchLookup, raw_response)?,
        VendorAPI::FootprintDeviceAttestation => {
            insert_map_entry(map, FootprintDeviceAttestation, raw_response)?
        }
        VendorAPI::AwsRekognition => insert_map_entry(map, AwsRekognition, raw_response)?,
        VendorAPI::AwsTextract => insert_map_entry(map, AwsTextract, raw_response)?,
        VendorAPI::LexisFlexId => insert_map_entry(map, LexisFlexId, raw_response)?,
        VendorAPI::IncodeCurpValidation => insert_map_entry(map, IncodeCurpValidation, raw_response)?,
        VendorAPI::IncodeGovernmentValidation => insert_map_entry(map, IncodeIneData, raw_response)?,
        VendorAPI::NeuroIdAnalytics => insert_map_entry(map, NeuroIdAnalytics, raw_response)?,
        VendorAPI::IncodeApproveSession => insert_map_entry(map, IncodeApproveSession, raw_response)?,
    };

    Ok(())
}

fn build_verification_identifier_map_entry(
    map: &mut VendorAPIResponseIdentifiersMap,
    request_and_result: VerificationRequestAndResult,
    vendor_api: VendorAPI,
) {
    match vendor_api {
        VendorAPI::IdologyExpectId => map.insert(IdologyExpectID, request_and_result),
        VendorAPI::IdologyPa => map.insert(IdologyPa, request_and_result),
        VendorAPI::TwilioLookupV2 => map.insert(TwilioLookupV2, request_and_result),
        VendorAPI::SocureIdPlus => map.insert(SocureIDPlus, request_and_result),
        VendorAPI::ExperianPreciseId => map.insert(ExperianPreciseID, request_and_result),
        VendorAPI::MiddeskCreateBusiness => map.insert(MiddeskCreateBusiness, request_and_result),
        VendorAPI::MiddeskGetBusiness => map.insert(MiddeskGetBusiness, request_and_result),
        VendorAPI::MiddeskBusinessUpdateWebhook => {
            map.insert(MiddeskBusinessUpdateWebhook, request_and_result)
        }
        VendorAPI::MiddeskTinRetriedWebhook => map.insert(MiddeskTinRetriedWebhook, request_and_result),
        VendorAPI::IncodeStartOnboarding => map.insert(IncodeStartOnboarding, request_and_result),
        VendorAPI::IncodeAddFront => map.insert(IncodeAddFront, request_and_result),
        VendorAPI::IncodeAddBack => map.insert(IncodeAddBack, request_and_result),
        VendorAPI::IncodeProcessId => map.insert(IncodeProcessId, request_and_result),
        VendorAPI::IncodeFetchScores => map.insert(IncodeFetchScores, request_and_result),
        VendorAPI::IncodeAddPrivacyConsent => map.insert(IncodeAddPrivacyConsent, request_and_result),
        VendorAPI::IncodeAddMlConsent => map.insert(IncodeAddMLConsent, request_and_result),
        VendorAPI::IncodeFetchOcr => map.insert(IncodeFetchOCR, request_and_result),
        VendorAPI::IncodeAddSelfie => map.insert(IncodeAddSelfie, request_and_result),
        VendorAPI::IncodeWatchlistCheck => map.insert(IncodeWatchlistCheck, request_and_result),
        VendorAPI::IncodeUpdatedWatchlistResult => {
            map.insert(IncodeUpdatedWatchlistResult, request_and_result)
        }
        VendorAPI::IncodeGetOnboardingStatus => map.insert(IncodeGetOnboardingStatus, request_and_result),
        VendorAPI::IncodeProcessFace => map.insert(IncodeProcessFace, request_and_result),
        VendorAPI::StytchLookup => map.insert(StytchLookup, request_and_result),
        VendorAPI::FootprintDeviceAttestation => map.insert(FootprintDeviceAttestation, request_and_result),
        VendorAPI::AwsRekognition => map.insert(AwsRekognition, request_and_result),
        VendorAPI::AwsTextract => map.insert(AwsTextract, request_and_result),
        VendorAPI::LexisFlexId => map.insert(LexisFlexId, request_and_result),
        VendorAPI::IncodeCurpValidation => map.insert(IncodeCurpValidation, request_and_result),
        VendorAPI::IncodeGovernmentValidation => map.insert(IncodeIneData, request_and_result),
        VendorAPI::NeuroIdAnalytics => map.insert(NeuroIdAnalytics, request_and_result),
        VendorAPI::IncodeApproveSession => map.insert(IncodeApproveSession, request_and_result),
    };
}

// In many cases at the moment, we still have functions that return VendorResults.
// We also still need some things that VendorResults has that this map doesn't (like VerificationResultId). Eventually
// will get rid of this, but it's non-trivial
#[tracing::instrument(skip_all)]
pub fn build_vendor_response_map_from_vendor_results(
    vendor_results: &[VendorResult],
) -> ApiResult<(VendorAPIResponseMap, VendorAPIResponseIdentifiersMap)> {
    let mut out_map: VendorAPIResponseMap = TypedMap::new_with_bounds();
    let mut out_identifiers_map: VendorAPIResponseIdentifiersMap = TypedMap::new_with_bounds();

    vendor_results.iter().try_for_each(|vr| -> Result<(), ApiError> {
        let vendor_api = VendorAPI::from(&vr.response.response);
        // Mapping from VendorAPI struct -> deserialized vendor response
        build_parsed_vendor_response_map_entry(
            &mut out_map,
            vr.response.raw_response.clone().into_leak(),
            vendor_api,
        )?;

        // Now build a similarly keyed map, but with the VerificationResult and VerificationRequest IDs
        let vres_and_result = VerificationRequestAndResult {
            verification_request_id: vr.verification_request_id.clone(),
            verification_result_id: vr.verification_result_id.clone(),
        };

        build_verification_identifier_map_entry(&mut out_identifiers_map, vres_and_result, vendor_api);

        Ok(())
    })?;

    Ok((out_map, out_identifiers_map))
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

/// Typed Map impls
impl TypedMapKey<VendorAPIResponseMarker> for IdologyExpectID {
    type Value = ExpectIDResponse;
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
impl TypedMapKey<VendorAPIResponseMarker> for IncodeUpdatedWatchlistResult {
    type Value = UpdatedWatchlistResultResponse;
}
impl TypedMapKey<VendorAPIResponseMarker> for IncodeGetOnboardingStatus {
    type Value = GetOnboardingStatusResponse;
}
impl TypedMapKey<VendorAPIResponseMarker> for IncodeProcessFace {
    type Value = ProcessFaceResponse;
}
impl TypedMapKey<VendorAPIResponseMarker> for StytchLookup {
    type Value = stytch::response::Response;
}
impl TypedMapKey<VendorAPIResponseMarker> for FootprintDeviceAttestation {
    type Value = serde_json::Value;
}
impl TypedMapKey<VendorAPIResponseMarker> for AwsRekognition {
    type Value = serde_json::Value;
}
impl TypedMapKey<VendorAPIResponseMarker> for AwsTextract {
    type Value = serde_json::Value;
}
impl TypedMapKey<VendorAPIResponseMarker> for LexisFlexId {
    type Value = FlexIdResponse;
}

impl TypedMapKey<VendorAPIResponseMarker> for IncodeCurpValidation {
    type Value = CurpValidationResponse;
}

// TODO:
impl TypedMapKey<VendorAPIResponseMarker> for IncodeIneData {
    type Value = serde_json::Value;
}

impl TypedMapKey<VendorAPIResponseMarker> for NeuroIdAnalytics {
    type Value = serde_json::Value;
}

impl TypedMapKey<VendorAPIResponseMarker> for IncodeApproveSession {
    type Value = serde_json::Value;
}

/// Verification Request and Result map, used in conjunction with the above map for reason codes
impl TypedMapKey<VendorAPIResponseIdsMarker> for IdologyExpectID {
    type Value = VerificationRequestAndResult;
}
impl TypedMapKey<VendorAPIResponseIdsMarker> for IdologyPa {
    type Value = VerificationRequestAndResult;
}
impl TypedMapKey<VendorAPIResponseIdsMarker> for TwilioLookupV2 {
    type Value = VerificationRequestAndResult;
}
impl TypedMapKey<VendorAPIResponseIdsMarker> for SocureIDPlus {
    type Value = VerificationRequestAndResult;
}
impl TypedMapKey<VendorAPIResponseIdsMarker> for ExperianPreciseID {
    type Value = VerificationRequestAndResult;
}
impl TypedMapKey<VendorAPIResponseIdsMarker> for MiddeskCreateBusiness {
    type Value = VerificationRequestAndResult;
}
impl TypedMapKey<VendorAPIResponseIdsMarker> for MiddeskGetBusiness {
    type Value = VerificationRequestAndResult;
}
impl TypedMapKey<VendorAPIResponseIdsMarker> for MiddeskBusinessUpdateWebhook {
    type Value = VerificationRequestAndResult;
}
impl TypedMapKey<VendorAPIResponseIdsMarker> for MiddeskTinRetriedWebhook {
    type Value = VerificationRequestAndResult;
}
impl TypedMapKey<VendorAPIResponseIdsMarker> for IncodeStartOnboarding {
    type Value = VerificationRequestAndResult;
}
impl TypedMapKey<VendorAPIResponseIdsMarker> for IncodeAddFront {
    type Value = VerificationRequestAndResult;
}
impl TypedMapKey<VendorAPIResponseIdsMarker> for IncodeAddBack {
    type Value = VerificationRequestAndResult;
}
impl TypedMapKey<VendorAPIResponseIdsMarker> for IncodeProcessId {
    type Value = VerificationRequestAndResult;
}
impl TypedMapKey<VendorAPIResponseIdsMarker> for IncodeFetchScores {
    type Value = VerificationRequestAndResult;
}
impl TypedMapKey<VendorAPIResponseIdsMarker> for IncodeAddPrivacyConsent {
    type Value = VerificationRequestAndResult;
}
impl TypedMapKey<VendorAPIResponseIdsMarker> for IncodeAddMLConsent {
    type Value = VerificationRequestAndResult;
}
impl TypedMapKey<VendorAPIResponseIdsMarker> for IncodeFetchOCR {
    type Value = VerificationRequestAndResult;
}
impl TypedMapKey<VendorAPIResponseIdsMarker> for IncodeAddSelfie {
    type Value = VerificationRequestAndResult;
}
impl TypedMapKey<VendorAPIResponseIdsMarker> for IncodeWatchlistCheck {
    type Value = VerificationRequestAndResult;
}
impl TypedMapKey<VendorAPIResponseIdsMarker> for IncodeUpdatedWatchlistResult {
    type Value = VerificationRequestAndResult;
}
impl TypedMapKey<VendorAPIResponseIdsMarker> for IncodeGetOnboardingStatus {
    type Value = VerificationRequestAndResult;
}
impl TypedMapKey<VendorAPIResponseIdsMarker> for IncodeProcessFace {
    type Value = VerificationRequestAndResult;
}
impl TypedMapKey<VendorAPIResponseIdsMarker> for StytchLookup {
    type Value = VerificationRequestAndResult;
}
impl TypedMapKey<VendorAPIResponseIdsMarker> for FootprintDeviceAttestation {
    type Value = VerificationRequestAndResult;
}
impl TypedMapKey<VendorAPIResponseIdsMarker> for AwsRekognition {
    type Value = VerificationRequestAndResult;
}
impl TypedMapKey<VendorAPIResponseIdsMarker> for AwsTextract {
    type Value = VerificationRequestAndResult;
}
impl TypedMapKey<VendorAPIResponseIdsMarker> for LexisFlexId {
    type Value = VerificationRequestAndResult;
}

impl TypedMapKey<VendorAPIResponseIdsMarker> for IncodeCurpValidation {
    type Value = VerificationRequestAndResult;
}

impl TypedMapKey<VendorAPIResponseIdsMarker> for IncodeIneData {
    type Value = VerificationRequestAndResult;
}

impl TypedMapKey<VendorAPIResponseIdsMarker> for NeuroIdAnalytics {
    type Value = VerificationRequestAndResult;
}

impl TypedMapKey<VendorAPIResponseIdsMarker> for IncodeApproveSession {
    type Value = VerificationRequestAndResult;
}

#[cfg(test)]
mod tests {
    use super::VendorAPIResponseMap;
    use newtypes::VendorAPI;
    use typedmap::TypedMap;

    use crate::decision::vendor::vendor_api::vendor_api_struct::{
        ExperianPreciseID, IdologyExpectID, IncodeFetchScores,
    };

    #[test]
    fn test_build_parsed_vendor_response_map() {
        let responses = vec![
            (
                VendorAPI::IdologyExpectId,
                idv::test_fixtures::test_idology_expectid_response(),
            ),
            (
                VendorAPI::ExperianPreciseId,
                idv::test_fixtures::experian_cross_core_response(None),
            ),
        ];

        let mut map: VendorAPIResponseMap = TypedMap::new_with_bounds();

        responses.into_iter().for_each(|(vendor_api, raw_response)| {
            super::build_parsed_vendor_response_map_entry(&mut map, raw_response, vendor_api).unwrap();
        });

        assert_eq!(2, map.len());
        assert!(map.get(&IdologyExpectID).is_some());
        assert!(map.get(&ExperianPreciseID).is_some());
        assert!(map.get(&IncodeFetchScores).is_none())
    }
}
