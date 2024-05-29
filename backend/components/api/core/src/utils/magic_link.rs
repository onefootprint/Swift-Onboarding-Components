use crate::errors::workos::WorkOsError;
use crate::errors::ApiResult;
use crate::State;
use newtypes::PiiString;
use workos::passwordless::{
    CreatePasswordlessSession,
    CreatePasswordlessSessionParams,
    CreatePasswordlessSessionType,
    PasswordlessSessionType,
};

#[tracing::instrument(skip_all)]
pub async fn create_magic_link(
    state: &State,
    email: &str,
    redirect_url: &str,
    is_invite: bool,
) -> ApiResult<PiiString> {
    let session = state
        .workos_client
        .passwordless()
        .create_passwordless_session(&CreatePasswordlessSessionParams {
            r#type: CreatePasswordlessSessionType::MagicLink { email },
            redirect_uri: Some(redirect_url),
            // Can use this to pass more information to the client
            state: is_invite.then_some("invite"),
        })
        .await
        .map_err(WorkOsError::from)?;

    let link = match &session.r#type {
        PasswordlessSessionType::MagicLink { email: _, link } => link.clone(),
    };

    Ok(PiiString::from(link))
}
