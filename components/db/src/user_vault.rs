use crate::schema;
use diesel::prelude::*;
use deadpool_diesel::postgres::Pool;
use crate::models::onboardings::*;
use crate::models::onboarding_session_tokens::{NewOnboardingSessionToken, OnboardingSessionToken};
use crate::models::types::Status;
use crate::models::user_vaults::*;
use crate::errors::DbError;
use chrono::{Duration, Utc};
use crypto::{sha256, random::gen_random_alphanumeric_code, hex::ToHex};

pub async fn init(pool: &Pool, user: NewUserVault, tenant_id: String) -> Result<(Onboarding, String), DbError> {
    let conn = pool.get().await?;

    let token = format!("vtok_{}", gen_random_alphanumeric_code(34));
    let h_token = sha256(token.as_bytes()).encode_hex();

    let onboarding =
        conn.interact(move |conn| {
            conn.build_transaction().run(|| -> Result<Onboarding, DbError> {
            // initialize new user vault
            let user_vault : UserVault = 
            diesel::insert_into(schema::user_vaults::table)
                    .values(&user)
                    .get_result::<UserVault>(conn)?;

            // associate new user with tenant
            let new_onboarding = NewOnboarding {
                tenant_id: tenant_id.clone(),
                user_vault_id: user_vault.id.clone(),
                status: Status::Incomplete
            };
            let onboarding : Onboarding = diesel::insert_into(
                schema::onboardings::table)
                    .values(&new_onboarding)
                    .get_result::<Onboarding>(conn)?;
                    
            // grant temporary credentials to tenant to modify user
            let temp_tenant_user_token = NewOnboardingSessionToken {
                h_token,
                user_ob_id: onboarding.user_ob_id.clone(),
            };
            diesel::insert_into(
                schema::onboarding_session_tokens::table)
                    .values(&temp_tenant_user_token)
                    .get_result::<OnboardingSessionToken>(conn)?;

            Ok(onboarding)
    })}).await??;
    // Return onboarding_session_token
    Ok((onboarding, token))
}

pub async fn update(pool: &Pool, update: UpdateUserVault) -> Result<usize, DbError> {
    let conn = pool.get().await?;

    let size = conn.interact(move |conn| {
        diesel::update(schema::user_vaults::table.filter(schema::user_vaults::id.eq(update.id.clone())))
        .set(update)
        .execute(conn)
    }).await??;

    Ok(size)
}

pub async fn get_by_token(pool: &Pool, auth_token: String) -> Result<(UserVault, OnboardingSessionToken), DbError>  {
    let conn = pool.get().await?;

    let hashed_token: String = sha256(auth_token.as_bytes()).encode_hex();

    let (token, user) = conn.interact(move |conn| -> Result<(OnboardingSessionToken, UserVault), DbError> {
        let (token, onboarding) : (OnboardingSessionToken, Onboarding) =
            schema::onboarding_session_tokens::table
                .inner_join(schema::onboardings::table.on(
                    schema::onboardings::user_ob_id.eq(schema::onboarding_session_tokens::user_ob_id)))
                .filter(schema::onboarding_session_tokens::h_token.eq(hashed_token))
                .first(conn)?;
        
         // check token expiration
        let now = Utc::now().naive_utc();
        if token.created_at.signed_duration_since(now) > Duration::minutes(15) {
            return Err(DbError::OnboardingTokenInactive)
        }
        
        let (_, user): (Onboarding, UserVault) = 
            schema::onboardings::table
                .inner_join(schema::user_vaults::table.on(schema::user_vaults::id.eq(schema::onboardings::user_vault_id)))
                .filter(schema::user_vaults::id.eq(onboarding.user_vault_id))
                .first(conn)?;
        Ok((token, user))
    }).await??;


    Ok((user, token))
}