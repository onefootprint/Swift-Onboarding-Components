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
use db::DbPool;
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::incode::request::OnboardingStartCustomNameFields;
use idv::incode::IncodeStartOnboardingRequest;
use newtypes::vendor_credentials::{IncodeCredentials, IncodeCredentialsWithToken};
use newtypes::{IncodeAuthorizationToken, IncodeConfigurationId, IncodeSessionId, VendorAPI};

pub struct StartOnboarding {
    pub incode_session: IncodeVerificationSession,
    pub incode_credentials: IncodeCredentials,
    pub configuration_id: IncodeConfigurationId,
}

#[async_trait]
impl IncodeStateTransition for StartOnboarding {
    async fn run(
        self,
        db_pool: &DbPool,
        footprint_http_client: &FootprintVendorHttpClient,
        ctx: &IncodeContext,
    ) -> Result<IncodeState, ApiError> {
        //
        // make the request to incode
        //
        // TODO: we need to be able to error if the fn/ln is missing and we need it
        let custom_name_fields = OnboardingStartCustomNameFields {
            first_name: ctx.docv_data.first_name.clone(),
            last_name: ctx.docv_data.last_name.clone(),
        };
        let request = IncodeStartOnboardingRequest {
            credentials: self.incode_credentials.clone(),
            configuration_id: self.configuration_id.clone(),
            session_id: None,
            custom_name_fields: Some(custom_name_fields),
        };
        let res = footprint_http_client.make_request(request).await;

        //
        // Save our result
        //
        let args = SaveVerificationResultArgs::from(&res, VendorAPI::IncodeStartOnboarding, ctx);
        save_incode_verification_result(db_pool, args).await?;

        // Now ensure we don't have an error
        // If we get an error here, the response does not include interviewId or anything else, so we just error here and will restart
        let successful_response = res
            .map_err(map_to_api_err)?
            .result
            .into_success()
            .map_err(map_to_api_err)?;

        //
        // Set up the next state transition
        //
        let session = VerificationSession {
            id: self.incode_session.id.clone(),
            credentials: IncodeCredentialsWithToken {
                credentials: self.incode_credentials,
                authentication_token: successful_response.token.clone(),
            },
        };

        let ctx = ctx.clone();
        let next_state = db_pool
            .db_transaction(move |conn| -> ApiResult<IncodeState> {
                // We only need to add consent if the session is of kind=Selfie
                let next_state: IncodeState = if self.incode_session.kind.requires_consent() {
                    AddConsent::enter(conn, &ctx, session)?.into()
                } else {
                    AddFront { session }.into()
                };

                // Update our state to the next stage
                let update = UpdateIncodeVerificationSession::set_state_and_incode_session_and_token(
                    next_state.name(),
                    IncodeSessionId::from(successful_response.interview_id),
                    IncodeAuthorizationToken::from(successful_response.token.leak_to_string()),
                );
                IncodeVerificationSession::update(conn, &self.incode_session.id, update)?;

                Ok(next_state)
            })
            .await?;

        Ok(next_state)
    }
}
