use crate::schema;
use diesel::prelude::*;
use deadpool_diesel::postgres::Pool;
use crate::models::onboardings::*;
use crate::models::onboarding_session_tokens::{NewOnboardingSessionToken, OnboardingSessionToken};
use crate::models::types::Status;
use crate::models::user_vaults::*;
use crate::errors::DbError;
use crypto::{sha256, random::gen_random_alphanumeric_code, hex::ToHex};

pub async fn init(pool: &Pool, user: NewUserVault, tenant_id: String) -> Result<String, DbError> {
    let conn = pool.get().await?;

    let token = format!("vtok_{}", gen_random_alphanumeric_code(34));
    let h_token = sha256(token.as_bytes()).encode_hex();

    let _ =
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
                user_vault_id: user_vault.id,
                tenant_id,
                footprint_user_id: onboarding.footprint_user_id.clone(),
            };
            diesel::insert_into(
                schema::onboarding_session_tokens::table)
                    .values(&temp_tenant_user_token)
                    .get_result::<OnboardingSessionToken>(conn)?;

            Ok(onboarding)
    })}).await??;
    // Return tenant-scoped user id
    Ok(token)
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

pub async fn get_by_tenant_user_id(pool: &Pool, footprint_user_id: String, tenant_id: String) -> Result<UserVault, DbError> {
    let conn = pool.get().await?;

    let (_, user_vault): (Onboarding, UserVault) = conn.interact(move |conn| {
        schema::onboardings::table
            .inner_join(schema::user_vaults::table.on(schema::user_vaults::id.eq(schema::onboardings::user_vault_id)))
            .filter(schema::onboardings::footprint_user_id.eq(footprint_user_id))
            .filter(schema::onboardings::tenant_id.eq(tenant_id))
            .first(conn)
    })
    .await??;

    Ok(user_vault)
}

pub async fn get_by_token(pool: &Pool, auth_token: String) -> Result<(UserVault, OnboardingSessionToken), DbError>  {
    let conn = pool.get().await?;

    let hashed_token: String = sha256(auth_token.as_bytes()).encode_hex();

    let (token, user): (OnboardingSessionToken, UserVault) = conn.interact(move |conn| {
        schema::onboarding_session_tokens::table
            .inner_join(schema::user_vaults::table.on(schema::user_vaults::id.eq(schema::onboarding_session_tokens::user_vault_id)))
            .filter(schema::onboarding_session_tokens::h_token.eq(hashed_token))
            .first(conn)
    })
    .await??;

    Ok((user, token))
}