use super::vendor_api::loaders::load_response_for_vendor_api;
use super::verification_result::SaveVerificationResultArgs;
use super::verification_result::ShouldSaveVerificationRequest;
use crate::decision::vendor::build_request;
use crate::utils::vault_wrapper::Any;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::utils::vault_wrapper::VwArgs;
use crate::FpResult;
use crate::State;
use api_errors::FpError;
use db::models::data_lifetime::DataLifetime;
use db::models::decision_intent::DecisionIntent;
use db::models::verification_request::VReqIdentifier;
use idv::twilio::TwilioLookupV2APIResponse;
use idv::twilio::TwilioLookupV2Request;
use newtypes::DecisionIntentId;
use newtypes::PhoneLookupAttributes;
use newtypes::ScopedVaultId;
use newtypes::ScrubbedPiiVendorResponse;
use newtypes::TwilioLookupV2;
use newtypes::VaultPublicKey;
use newtypes::VendorAPI;
use newtypes::VerificationResultId;
use newtypes::WorkflowId;
use twilio::response::lookup::LookupV2Response;

impl SaveVerificationResultArgs {
    pub fn new_for_twilio(
        request_result: &FpResult<TwilioLookupV2APIResponse>,
        di_id: DecisionIntentId,
        sv_id: ScopedVaultId,
        vault_public_key: VaultPublicKey,
    ) -> Self {
        let should_save_verification_request =
            ShouldSaveVerificationRequest::Yes(VendorAPI::TwilioLookupV2, di_id, sv_id, None);
        match request_result {
            Ok(response) => {
                let TwilioLookupV2APIResponse {
                    parsed_response,
                    raw_response,
                } = response.clone();

                let scrubbed_response = serde_json::to_value(parsed_response)
                    .map(ScrubbedPiiVendorResponse::from)
                    .map_err(|e| FpError::from(idv::Error::from(e)))
                    .unwrap_or(serde_json::json!("").into());

                Self {
                    // TODO: is there anything in a successful API response that indicates an error?
                    is_error: false,
                    raw_response,
                    scrubbed_response,
                    should_save_verification_request,
                    vault_public_key,
                }
            }
            Err(_) => Self::error(should_save_verification_request, vault_public_key),
        }
    }
}


#[tracing::instrument(skip(state, di))]
pub async fn run_twilio_call(
    state: &State,
    di: &DecisionIntent,
    wf_id: &WorkflowId,
    attributes: &Vec<PhoneLookupAttributes>,
) -> FpResult<Option<(LookupV2Response, VerificationResultId)>> {
    let svid = di.scoped_vault_id.clone();
    // TODO: Make this WF created
    let di_created = di._created_at;
    let (vw, seqno) = state
        .db_query(move |conn| {
            let vw = VaultWrapper::<Any>::build(conn, VwArgs::Tenant(&svid))?;
            let seqno = DataLifetime::get_seqno_at(conn, di_created)?;


            Ok((vw, seqno))
        })
        .await?;

    // If we already have a successful neuro validation for this DI, we return early
    let existing_vendor_result = load_response_for_vendor_api(
        state,
        VReqIdentifier::WfId(wf_id.clone()),
        &vw.vault.e_private_key,
        TwilioLookupV2,
    )
    .await?
    .ok();

    if existing_vendor_result.is_some() {
        return Ok(existing_vendor_result);
    }

    let idv_data =
        build_request::build_idv_data_at(&state.db_pool, &state.enclave_client, &di.scoped_vault_id, seqno)
            .await?;
    // Should not ever happen
    let request = TwilioLookupV2Request {
        idv_data,
        lookup_fields: attributes.iter().map(|a| (*a).into()).collect(),
    };
    let res = state.vendor_clients.twilio_lookup_v2.make_request(request).await;

    let args = SaveVerificationResultArgs::new_for_twilio(
        &res,
        di.id.clone(),
        di.scoped_vault_id.clone(),
        vw.vault.public_key.clone(),
    );
    let (vres, _) = args.save(&state.db_pool).await?;

    let res = res?;

    Ok(Some((res.parsed_response, vres.id)))
}
