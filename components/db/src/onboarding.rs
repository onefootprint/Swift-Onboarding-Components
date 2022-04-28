use crate::errors::DbError;
use crate::models::{
    onboardings::Onboarding, 
    onboarding_session_tokens::OnboardingSessionToken
};
use crate::schema;
use deadpool_diesel::postgres::Pool;
use diesel::prelude::*;

pub async fn get_onboarding_by_token(pool: &Pool, hashed_token: String) -> Result<Onboarding, DbError> {
    let conn = pool.get().await?;

    let (_, onboarding): (OnboardingSessionToken, Onboarding) = conn.interact(move |conn| {
        schema::onboarding_session_tokens::table
            .inner_join(schema::onboardings::table.on(
                schema::onboardings::footprint_user_id.eq(schema::onboarding_session_tokens::footprint_user_id)))
            .filter(schema::onboarding_session_tokens::h_token.eq(hashed_token))
            .first(conn)
    })
    .await??;

    Ok(onboarding)
}

