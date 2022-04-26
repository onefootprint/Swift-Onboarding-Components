extern crate openssl; // this is needed because https://github.com/clux/muslrust#diesel-and-pq-builds

#[macro_use]
extern crate diesel;

#[macro_use]
extern crate diesel_migrations;

pub mod models;

use deadpool_diesel::postgres::{Manager, Pool, Runtime};
use diesel::prelude::*;
use models::challenge::{Challenge, NewChallenge};
use models::tenant_api_keys::*;
use models::tenants::*;
use models::user_tenant_verifications::*;
use models::users::*;
use models::types::Status;
use models::temp_tenant_user_tokens::{NewTempTenantUserToken, TempTenantUserToken, PartialTempTenantUserToken};
use crate::models::types::{ChallengeKind, ChallengeState};
use uuid::Uuid;
use deadpool::managed::BuildError;
use chrono::Utc;
use crypto::{sha256,  hex::ToHex};

use thiserror::Error;

#[allow(unused_imports)]
pub mod schema;

embed_migrations!();

pub type DbPool = Pool;

#[derive(Debug, Error)]
pub enum DbError {
    #[error("db_interact: {0}")]
    DbInteract(#[from] deadpool_diesel::InteractError),

    #[error("db_error: {0}")]
    DbError(#[from] diesel::result::Error),

    #[error("pool_get: {0}")]
    PoolGet(#[from] deadpool::managed::PoolError<deadpool_diesel::Error>),

    #[error("pool_init: {0}")]
    PoolInit(#[from] BuildError<deadpool_diesel::Error>),

    #[error("connection_error: {0}")]
    ConnectionError(#[from] ConnectionError),

    #[error("migration_error: {0}")]
    MigrationError(#[from] diesel_migrations::RunMigrationsError),

    #[error("invalid tenant auth")]
    InvalidTenantAuth(),

    #[error("challenge_data_mismatch")]
    ChallengeDataMismatch,

    #[error("challenge_code_mismatch")]
    ChallengeCodeMismatch,

    #[error("challenge_expired")]
    ChallengeExpired,
}

/// Initialize our DB
pub fn init(url: &str) -> Result<Pool, DbError> {
    let manager = Manager::new(url, Runtime::Tokio1);
    let pool = Pool::builder(manager).max_size(8).build()?;

    Ok(pool)
}

pub fn run_migrations(url: &str) -> Result<(), DbError> {
    let conn = PgConnection::establish(url)?;
    embedded_migrations::run(&conn)?;
    Ok(())
}

pub async fn health_check(pool: &Pool) -> Result<Tenant, DbError> {
    let new_tenant = NewTenant {
        name: format!("Test_{}", chrono::Utc::now().timestamp()),
    };

    let tenant = pool
        .get()
        .await?
        .interact(move |conn| {
            diesel::insert_into(schema::tenants::table)
                .values(&new_tenant)
                .get_result(conn)
        })
        .await??;

    Ok(tenant)
}

pub async fn tenant_init(pool: &Pool, new_tenant: NewTenant) -> Result<Tenant, DbError> {
    let conn = pool.get().await?;

    let tenant = conn.interact(move |conn| {
        diesel::insert_into(schema::tenants::table)
            .values(&new_tenant)
            .get_result::<Tenant>(conn)
    })
    .await??;

    Ok(tenant)
}

pub async fn tenant_api_init(pool: &Pool, tenant_api: PartialTenantApiKey, secret_api_key: String) -> Result<TenantApiKey, DbError> {
    let conn = pool.get().await?;

    // TODO, use hmac instead of sha256
    let sh_api_key = sha256(&secret_api_key.as_bytes());

    let now = Utc::now().naive_utc();

    let new_tenant_api_key = NewTenantApiKey {
        tenant_id: tenant_api.tenant_id,
        name: tenant_api.name,
        sh_api_key: sh_api_key.to_vec(),
        is_enabled: true,
        created_at: now,
        updated_at: now, 
    };
    let tenant_api_key = conn.interact(move |conn| {
        diesel::insert_into(schema::tenant_api_keys::table)
            .values(&new_tenant_api_key)
            .get_result::<TenantApiKey>(conn)
    })
    .await??;

    Ok(tenant_api_key)

}

pub async fn tenant_user_lookup(pool: &Pool, auth_token: String, tenant_user_id: String) -> Result<PartialUser, DbError>  {
    let conn = pool.get().await?;

    let hashed_token : String = sha256(&auth_token.as_bytes()).encode_hex();

    let tenant_user: TempTenantUserToken = conn.interact(move |conn| {
        schema::temp_tenant_user_tokens::table.filter(
            schema::temp_tenant_user_tokens::h_token.eq(hashed_token)).first(conn)
    })
    .await??;

    if tenant_user.tenant_user_id != tenant_user_id {
        return Err(DbError::InvalidTenantAuth())
    }

    let user = user_get(pool, tenant_user.user_id).await?;

    let partial_user = PartialUser {
        id: user.id,
        public_key: user.public_key
    };

    Ok(partial_user)
}

pub async fn user_vault_init(pool: &Pool, user: NewUser, tenant: PartialTempTenantUserToken) -> Result<String, DbError> {
    let conn = pool.get().await?;

    let temp_token =
        conn.interact(move |conn| {
            conn.build_transaction().run(|| -> Result<TempTenantUserToken, DbError> {
            // initialize new user vault
            let user : User = 
            diesel::insert_into(schema::users::table)
                    .values(&user)
                    .get_result::<User>(conn)?;

            // associate new user with tenant
            let user_tenant = NewUserTenantVerification {
                tenant_id: tenant.tenant_id.clone(),
                user_id: user.id.clone(),
                status: Status::Incomplete
            };
            let user_tenant_record : UserTenantVerification = diesel::insert_into(
                schema::user_tenant_verifications::table)
                    .values(&user_tenant)
                    .get_result::<UserTenantVerification>(conn)?;
                    
            // grant temporary credentials to tenant to modify user
            let temp_tenant_user_token = NewTempTenantUserToken {
                h_token: tenant.h_token,
                user_id: user.id,
                tenant_id: tenant.tenant_id,
                tenant_user_id: user_tenant_record.tenant_user_id
            };
            let temp_token : TempTenantUserToken = diesel::insert_into(
                schema::temp_tenant_user_tokens::table)
                    .values(&temp_tenant_user_token)
                    .get_result::<TempTenantUserToken>(conn)?;

            Ok(temp_token)
    })}).await??;
    // Return tenant-scoped user id
    Ok(temp_token.tenant_user_id)
}

pub async fn user_vault_update(pool: &Pool, update: UpdateUser) -> Result<usize, DbError> {
    let conn = pool.get().await?;

    let size = conn.interact(move |conn| {
        diesel::update(schema::users::table.filter(schema::users::id.eq(update.id.clone())))
        .set(update)
        .execute(conn)
    }).await??;

    Ok(size)
}
pub async fn tenant_pub_auth_check(pool: &Pool, tenant_pub_key: String) -> Result<TenantApiKey, DbError> {
    let conn = pool.get().await?;

    let tenant_api_key : TenantApiKey = conn.interact(move |conn| {
        schema::tenant_api_keys::table.filter(
            schema::tenant_api_keys::api_key_id.eq(tenant_pub_key)).first(conn)
    })
    .await??;

    Ok(tenant_api_key)
}

pub async fn user_get(pool: &Pool, user_id: String) -> Result<User, DbError> {
    let conn = pool.get().await?;

    let user: User = conn.interact(move |conn| {
        schema::users::table.filter(schema::users::id.eq(user_id)).first(conn)
    })
    .await??;

    Ok(user)
}

fn gen_code_and_hash() -> (String, [u8; 32]) {
    let code: String = crypto::random::gen_rand_n_digit_code(6);
    let h_code = crypto::sha256(code.as_bytes());
    (code, h_code)
}

pub async fn create_challenge(
    pool: &Pool,
    user_id: String,
    sh_data: Vec<u8>,
    kind: ChallengeKind,
) -> Result<(Challenge, String), DbError> {
    let conn = pool.get().await?;

    // TODO cryptographically random
    let (code, h_code) = gen_code_and_hash();

    let new_challenge = NewChallenge {
        user_id: user_id,
        sh_data: sh_data,
        h_code: h_code.to_vec(),
        kind: kind,
        state: ChallengeState::AwaitingResponse,
    };
    let challenge = conn.interact(move |conn| {
        diesel::insert_into(schema::challenge::table)
            .values(&new_challenge)
            .get_result::<Challenge>(conn)
    })
    .await??;

    Ok((challenge, code))
}

pub async fn expire_old_challenges(pool: &Pool, user_id: String, kind: ChallengeKind) -> Result<usize, DbError> {
    let conn = pool.get().await?;

    let num_updates = conn.interact(move |conn| {
        diesel::update(schema::challenge::table
            .filter(schema::challenge::user_id.eq(user_id))
            .filter(schema::challenge::kind.eq(kind)))
            .filter(schema::challenge::state.eq(ChallengeState::AwaitingResponse))
            .set(schema::challenge::state.eq(ChallengeState::Expired))
            .execute(conn)
        })
        .await??;

    Ok(num_updates)
}

pub async fn verify_challenge(
    pool: &Pool,
    challenge_id: Uuid,
    user_id: String,
    code: String,
) -> Result<(), DbError> {
    let conn = pool.get().await?;

    // TODO write unit tests
    conn.interact(move |conn| {
        conn.build_transaction().run(|| {
            let challenge: Challenge = schema::challenge::table
                .filter(schema::challenge::id.eq(challenge_id))
                .filter(schema::challenge::user_id.eq(&user_id))
                .for_no_key_update()
                .first(conn)?;
            if challenge.state != ChallengeState::AwaitingResponse {
                return Err(DbError::ChallengeExpired);
            }
            let user: User = schema::users::table
                .filter(schema::users::id.eq(&user_id))
                .for_no_key_update()
                .first(conn)?;
            let expected_sh_data = match challenge.kind {
                ChallengeKind::PhoneNumber => &user.sh_phone_number,
                ChallengeKind::Email => &user.sh_email,
            };
            let expected_sh_data = match expected_sh_data {
                Some(expected_sh_data) => expected_sh_data,
                None => return Err(DbError::ChallengeDataMismatch),
            };
            if challenge.sh_data != *expected_sh_data {
                return Err(DbError::ChallengeDataMismatch);
            }
            // TODO only store a hash of the code and do a hash comparison of the code
            if challenge.h_code != crypto::sha256(code.as_bytes()) {
                return Err(DbError::ChallengeCodeMismatch);
            }
            // The code matches, and the sh_data on the challenge matches the user. Mark the challenge as validated
            diesel::update(&challenge)
                .set(schema::challenge::state.eq(ChallengeState::Validated))
                // challenge::validated_at.eq(Some(chrono::offset::Utc::now())),
                .execute(conn)?;
            // Mark the piece of data on the user validated
            match challenge.kind {
                ChallengeKind::PhoneNumber => {
                    diesel::update(&user)
                        .set(schema::users::is_phone_number_verified.eq(true))
                        .execute(conn)?;
                }
                ChallengeKind::Email => {
                    diesel::update(&user)
                        .set(schema::users::is_email_verified.eq(true))
                        .execute(conn)?;
                }
            }

            Ok(())
        })
    })
    .await??;

    Ok(())
}