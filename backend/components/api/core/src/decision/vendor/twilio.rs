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
use db::models::ob_configuration::ObConfiguration;
use db::models::verification_request::VReqIdentifier;
use idv::twilio::TwilioLookupV2APIResponse;
use idv::twilio::TwilioLookupV2Request;
use newtypes::DecisionIntentId;
use newtypes::ScopedVaultId;
use newtypes::ScrubbedPiiVendorResponse;
use newtypes::TwilioLookupV2;
use newtypes::VaultPublicKey;
use newtypes::VendorAPI;
use newtypes::VerificationCheck;
use newtypes::VerificationCheckKind;
use newtypes::WorkflowId;
use twilio::response::lookup::LookupV2Response;

impl SaveVerificationResultArgs {
    pub fn new_for_twilio(
        request_result: &Result<TwilioLookupV2APIResponse, idv::twilio::Error>,
        decision_intent_id: DecisionIntentId,
        scoped_vault_id: ScopedVaultId,
        vault_public_key: VaultPublicKey,
    ) -> Self {
        let should_save_verification_request = ShouldSaveVerificationRequest::Yes(VendorAPI::TwilioLookupV2);
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
                    decision_intent_id,
                    vault_public_key,
                    scoped_vault_id,
                    identity_document_id: None,
                }
            }
            Err(_) => Self {
                is_error: true,
                raw_response: serde_json::json!("").into(),
                scrubbed_response: serde_json::json!("").into(),
                should_save_verification_request,
                decision_intent_id,
                vault_public_key,
                scoped_vault_id,
                identity_document_id: None,
            },
        }
    }
}


#[tracing::instrument(skip(state, di))]
pub async fn run_twilio_call(
    state: &State,
    di: &DecisionIntent,
    wf_id: &WorkflowId,
    obc: &ObConfiguration,
) -> FpResult<Option<LookupV2Response>> {
    let svid = di.scoped_vault_id.clone();
    // TODO: Make this WF created
    let di_created = di._created_at;
    let (vw, seqno) = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
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
    .ok()
    .map(|(r, _)| r);

    if existing_vendor_result.is_some() {
        return Ok(existing_vendor_result);
    }

    let idv_data =
        build_request::build_idv_data_at(&state.db_pool, &state.enclave_client, &di.scoped_vault_id, seqno)
            .await?;
    // Should not ever happen
    let Some(VerificationCheck::Phone { attributes }) =
        obc.verification_checks().get(VerificationCheckKind::Phone)
    else {
        return Ok(None);
    };
    let request = TwilioLookupV2Request {
        idv_data,
        lookup_fields: attributes.into_iter().map(|a| a.into()).collect(),
    };
    let res = state.vendor_clients.twilio_lookup_v2.make_request(request).await;

    let args = SaveVerificationResultArgs::new_for_twilio(
        &res,
        di.id.clone(),
        di.scoped_vault_id.clone(),
        vw.vault.public_key.clone(),
    );
    let _ = args.save(&state.db_pool).await?;

    let result = res.ok().map(|r| r.parsed_response);

    Ok(result)
}
