extern crate openssl; // this is needed because https://github.com/clux/muslrust#diesel-and-pq-builds

#[macro_use]
extern crate diesel;

#[macro_use]
extern crate diesel_migrations;

pub mod models;

use deadpool_diesel::postgres::{Manager, Pool, Runtime};
use diesel::prelude::*;
use models::challenge::{Challenge, NewChallenge};
use models::types::{ChallengeKind, ChallengeState};
use models::fp_user::{NewFpUser, FpUser};
use uuid::Uuid;
use rand::{thread_rng, Rng};
use rand::distributions::Alphanumeric;
use deadpool::managed::BuildError;
use schema::{challenge, fp_user};
use thiserror::Error;

#[allow(unused_imports)]
pub mod schema;

embed_migrations!();

pub type DbPool = Pool;
type TempUserVaultToken = String;

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

pub async fn init_user_vault(pool: &Pool, user: NewFpUser) -> Result<(Uuid, TempUserVaultToken), DbError> {
    let conn = pool.get().await?;

    let user = conn.interact(move |conn| {
        diesel::insert_into(schema::fp_user::table)
            .values(&user)
            .get_result::<FpUser>(conn)
    })
    .await??;

    // TODO moce into crypto crate
    let temp_token = thread_rng()
        .sample_iter(&Alphanumeric)
        .take(34)
        .map(char::from)
        .collect();

    // TODO pass tenant info in params, modify user_tenant_verification table, add token to
    // temp token table

    Ok((user.id, temp_token))
}

pub async fn get_user(pool: &Pool, user_id: Uuid) -> Result<FpUser, DbError> {
    let conn = pool.get().await.map_err(DbError::from)?;

    let user: FpUser = conn.interact(move |conn| {
        schema::fp_user::table.filter(schema::fp_user::id.eq(user_id)).first(conn)
    })
    .await??;

    Ok(user)
}

pub async fn create_challenge(pool: &Pool, user_id: Uuid, sh_data: Vec<u8>, kind: ChallengeKind) -> Result<Uuid, DbError> {
    let conn = pool.get().await?;

    let new_challenge = NewChallenge{
        user_id: user_id,
        sh_data: sh_data,
        code: 123456, // TODO random
        kind: kind,
        state: ChallengeState::AwaitingResponse,
    };
    let challenge = conn.interact(move |conn| {
        diesel::insert_into(challenge::table)
            .values(&new_challenge)
            .get_result::<Challenge>(conn)
    })
    .await??;

    Ok(challenge.id)
}

pub async fn expire_old_challenges(pool: &Pool, user_id: Uuid, kind: ChallengeKind) -> Result<usize, DbError> {
    let conn = pool.get().await?;

    let num_updates = conn.interact(move |conn| {
        diesel::update(challenge::table
            .filter(challenge::user_id.eq(user_id))
            .filter(challenge::kind.eq(kind)))
            .filter(challenge::state.eq(ChallengeState::AwaitingResponse))
            .set(challenge::state.eq(ChallengeState::Expired))
            .execute(conn)
    })
    .await??;

    Ok(num_updates)
}

pub async fn verify_challenge(pool: &Pool, challenge_id: Uuid, user_id: Uuid, code: i32) -> Result<(), DbError> {
    let conn = pool.get().await?;

    conn.interact(move |conn| {
        conn.build_transaction().run(|| {
            let challenge: Challenge = challenge::table
                .filter(challenge::id.eq(challenge_id))
                .filter(challenge::user_id.eq(user_id))
                .for_no_key_update()
                .first(conn)?;
            if challenge.state != ChallengeState::AwaitingResponse {
                return Err(DbError::ChallengeExpired)
            }
            let user: FpUser = schema::fp_user::table
                .filter(schema::fp_user::id.eq(user_id))
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
            if challenge.code != code {
                return Err(DbError::ChallengeCodeMismatch);
            }
            // The code matches, and the sh_data on the challenge matches the user. Mark the challenge as validated
            diesel::update(&challenge)
                .set(challenge::state.eq(ChallengeState::Validated))
                    // challenge::validated_at.eq(Some(chrono::offset::Utc::now())),
                .execute(conn)?;
            // Mark the piece of data on the user validated
            match challenge.kind {
                ChallengeKind::PhoneNumber => {
                    diesel::update(&user)
                        .set(fp_user::is_phone_number_verified.eq(true))
                        .execute(conn)?;
                },
                ChallengeKind::Email => {
                    diesel::update(&user)
                        .set(fp_user::is_email_verified.eq(true))
                        .execute(conn)?;
                },
            }

            Ok(())
        })
    })
    .await
    .map_err(DbError::from)??;

    Ok(())
}