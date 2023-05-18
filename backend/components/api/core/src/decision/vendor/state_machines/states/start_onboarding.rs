use super::{
    map_to_api_err, save_incode_verification_result, AddConsent, AddFront, IncodeState,
    IncodeStateTransition, SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::vendor::state_machines::incode_state_machine::IncodeContext;
use crate::decision::vendor::vendor_trait::VendorAPICall;
use crate::errors::ApiResult;
use crate::ApiError;
use async_trait::async_trait;
use db::models::incode_verification_session::{IncodeVerificationSession, UpdateIncodeVerificationSession};
use db::models::ob_configuration::ObConfiguration;
use db::models::verification_request::VerificationRequest;
use db::{DbPool, DbResult};
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::incode::request::OnboardingStartCustomNameFields;
use idv::incode::IncodeStartOnboardingRequest;
use newtypes::vendor_credentials::{IncodeCredentials, IncodeCredentialsWithToken};
use newtypes::IncodeVerificationSessionKind;
use newtypes::{IncodeAuthorizationToken, IncodeConfigurationId, IncodeSessionId, VendorAPI};

pub struct StartOnboarding {
    pub incode_credentials: IncodeCredentials,
    pub configuration_id: IncodeConfigurationId,
}

#[async_trait]
impl IncodeStateTransition for StartOnboarding {
    async fn run(
        &self,
        db_pool: &DbPool,
        footprint_http_client: &FootprintVendorHttpClient,
        ctx: &IncodeContext,
    ) -> Result<IncodeState, ApiError> {
        let sv_id = ctx.scoped_vault_id.clone();
        let di_id = ctx.decision_intent_id.clone();
        let id_doc_id = ctx.identity_document_id.clone();
        let incode_credentials = self.incode_credentials.clone();
        let config_id = self.configuration_id.clone();

        //
        // Save our initial VReq
        //
        // TODO not idempotent
        let (start_onboarding_verification_request, verification_session) = db_pool
            .db_transaction(
                move |conn| -> DbResult<(VerificationRequest, IncodeVerificationSession)> {
                    let vr =
                        VerificationRequest::create(conn, &sv_id, &di_id, VendorAPI::IncodeStartOnboarding)?;

                    let obc = ObConfiguration::get_by_scoped_vault_id(conn, &sv_id)?;
                    let session_kind = if obc.must_collect_selfie() {
                        IncodeVerificationSessionKind::Selfie
                    } else {
                        IncodeVerificationSessionKind::IdDocument
                    };

                    // Initialize the incode state
                    let is =
                        IncodeVerificationSession::create(conn, sv_id, config_id, id_doc_id, session_kind)?;

                    Ok((vr, is))
                },
            )
            .await?;

        //
        // make the request to incode
        //
        // TODO: we need to be able to error if the fn/ln is missing and we need it
        let custom_name_fields = OnboardingStartCustomNameFields {
            first_name: ctx.docv_data.first_name.clone(),
            last_name: ctx.docv_data.last_name.clone(),
        };
        let request = IncodeStartOnboardingRequest {
            credentials: incode_credentials.clone(),
            configuration_id: self.configuration_id.clone(),
            session_id: None,
            custom_name_fields: Some(custom_name_fields),
        };

        let request_result = footprint_http_client.make_request(request).await;

        //
        // Save our result
        //
        let vres = SaveVerificationResultArgs::from((
            &request_result,
            start_onboarding_verification_request.id.clone(),
        ));

        save_incode_verification_result(db_pool, vres, &ctx.vault.public_key).await?;

        // Now ensure we don't have an error
        // If we get an error here, the response does not include interviewId or anything else, so we just error here and will restart
        let successful_response = request_result
            .map_err(map_to_api_err)?
            .result
            .into_success()
            .map_err(map_to_api_err)?;

        //
        // Set up the next state transition
        //
        let session = VerificationSession {
            id: verification_session.id.clone(),
            credentials: IncodeCredentialsWithToken {
                credentials: incode_credentials,
                authentication_token: successful_response.token.clone(),
            },
        };

        // Save the next stage's Vreq
        let ctx = ctx.clone();
        let next_state = db_pool
            .db_transaction(move |conn| -> ApiResult<IncodeState> {
                // We only need to add consent if the session is of kind=Selfie
                let next_state: IncodeState = if verification_session.kind.requires_consent() {
                    AddConsent::enter(conn, &ctx, session)?.into()
                } else {
                    AddFront::enter(conn, &ctx, session)?.into()
                };

                // Update our state to the next stage
                let update = UpdateIncodeVerificationSession::set_state_and_incode_session_and_token(
                    next_state.name(),
                    IncodeSessionId::from(successful_response.interview_id),
                    IncodeAuthorizationToken::from(successful_response.token.leak_to_string()),
                );

                IncodeVerificationSession::update(conn, verification_session.id, update)?;

                Ok(next_state)
            })
            .await?;

        Ok(next_state)
    }
}
