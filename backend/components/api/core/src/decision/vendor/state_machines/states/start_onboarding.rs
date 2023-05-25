use super::{
    map_to_api_err, save_incode_verification_result, AddFront, IncodeStateTransition,
    SaveVerificationResultArgs,
};
use crate::decision::vendor::state_machines::incode_state_machine::IncodeContext;
use crate::decision::vendor::vendor_trait::VendorAPICall;
use crate::errors::ApiResult;
use crate::State;
use db::models::incode_verification_session::{IncodeVerificationSession, UpdateIncodeVerificationSession};
use idv::incode::request::OnboardingStartCustomNameFields;
use idv::incode::IncodeStartOnboardingRequest;
use newtypes::vendor_credentials::IncodeCredentials;
use newtypes::{IncodeAuthorizationToken, IncodeConfigurationId, IncodeSessionId, VendorAPI};

/// This is weird - it's not a real state like all of the others. Just groups together some logic
/// to initialize the state machine
pub struct StartOnboarding {}

impl StartOnboarding {
    pub async fn run(
        state: &State,
        ctx: &IncodeContext,
        incode_session: IncodeVerificationSession,
        incode_credentials: IncodeCredentials,
        configuration_id: IncodeConfigurationId,
    ) -> ApiResult<()> {
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
            configuration_id: configuration_id.clone(),
            session_id: None,
            custom_name_fields: Some(custom_name_fields),
        };
        let res = state.fp_client.make_request(request).await;

        //
        // Save our result
        //
        let args = SaveVerificationResultArgs::from(&res, VendorAPI::IncodeStartOnboarding, ctx);
        save_incode_verification_result(&state.db_pool, args).await?;

        // Now ensure we don't have an error
        // If we get an error here, the response does not include interviewId or anything else, so we just error here and will restart
        let successful_response = res
            .map_err(map_to_api_err)?
            .result
            .into_success()
            .map_err(map_to_api_err)?;

        state
            .db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let next_state = AddFront::new();

                // Update our state to the next stage, saving the auth token needed for all other
                // states
                let update = UpdateIncodeVerificationSession::set_state_and_incode_session_and_token(
                    next_state.name(),
                    IncodeSessionId::from(successful_response.interview_id),
                    IncodeAuthorizationToken::from(successful_response.token.leak_to_string()),
                );
                IncodeVerificationSession::update(conn, &incode_session.id, update)?;

                Ok(())
            })
            .await?;

        Ok(())
    }
}
