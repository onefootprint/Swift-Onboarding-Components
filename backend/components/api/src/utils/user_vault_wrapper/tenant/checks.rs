use db::PgConn;
use newtypes::ScopedUserId;

use crate::{
    auth::{user::UserSession, SessionContext},
    errors::{onboarding::OnboardingError, user::UserError, ApiResult},
};

/// Some shared checks that are done before adding identity data to a user vault.
pub fn pre_add_data_checks(
    user_auth: &SessionContext<UserSession>,
    conn: &mut PgConn,
) -> ApiResult<ScopedUserId> {
    // TODO For now, we only allow adding an email during onboarding since we otherwise
    // don't know which scoped user to associate the data with.
    // We might one day want to support this outside of onboarding for my1fp. In that case,
    // maybe we make the data portable immediately to autofill onboardings
    let scoped_user_id = if let Some(su) = user_auth.scoped_user(conn)? {
        // We have an auth token created with the tenant PK - the scoped user should already exist
        su.id
    } else {
        return Err(UserError::NotAllowedWithoutTenant.into());
    };
    if let Some(ob) = user_auth.onboarding(conn)? {
        if ob.onboarding.idv_reqs_initiated {
            // One day, we'll want to allow editing data after IDV reqs are initiated ONLY
            // when KYC checks don't pass and we want the user to update their info.
            // Until then, this introduces a race condition where we could commit data that
            // isn't verified, so for now we will disallow this.
            return Err(OnboardingError::IdvReqsAlreadyInitiated.into());
        }
    }
    Ok(scoped_user_id)
}
