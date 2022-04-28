use crate::schema;
use diesel::prelude::*;
use deadpool_diesel::postgres::Pool;
use crate::models::user_vaults::{UserVault};
use crate::models::challenges::{Challenge, NewChallenge};
use crate::models::types::{ChallengeKind, ChallengeState};
use crate::errors::DbError;
use uuid::Uuid;
use crypto::sha256;

fn gen_code_and_hash() -> (String, [u8; 32]) {
    let code: String = crypto::random::gen_rand_n_digit_code(6);
    let h_code = sha256(code.as_bytes());
    (code, h_code)
}

pub async fn create(
    pool: &Pool,
    user_vault_id: String,
    sh_data: Vec<u8>,
    kind: ChallengeKind,
) -> Result<(Challenge, String), DbError> {
    let conn = pool.get().await?;

    // TODO cryptographically random
    let (code, h_code) = gen_code_and_hash();

    let new_challenge = NewChallenge {
        user_vault_id,
        sh_data,
        h_code: h_code.to_vec(),
        kind,
        state: ChallengeState::AwaitingResponse,
        expires_at: (chrono::Utc::now() + chrono::Duration::minutes(10)).naive_utc(),
    };
    let challenge = conn.interact(move |conn| {
        diesel::insert_into(schema::challenges::table)
            .values(&new_challenge)
            .get_result::<Challenge>(conn)
    })
    .await??;

    Ok((challenge, code))
}

pub async fn expire_old(pool: &Pool, user_vault_id: String, kind: ChallengeKind) -> Result<usize, DbError> {
    let conn = pool.get().await?;

    let num_updates = conn.interact(move |conn| {
        diesel::update(schema::challenges::table
            .filter(schema::challenges::user_vault_id.eq(user_vault_id))
            .filter(schema::challenges::kind.eq(kind)))
            .filter(schema::challenges::state.eq(ChallengeState::AwaitingResponse))
            .set(schema::challenges::state.eq(ChallengeState::Expired))
            .execute(conn)
        })
        .await??;

    Ok(num_updates)
}

pub async fn verify(
    pool: &Pool,
    challenge_id: Uuid,
    user_vault_id: String,
    code: String,
) -> Result<(), DbError> {
    let conn = pool.get().await?;

    // TODO write unit tests
    conn.interact(move |conn| {
        conn.build_transaction().run(|| {
            let challenge: Challenge = schema::challenges::table
                .filter(schema::challenges::id.eq(challenge_id))
                .filter(schema::challenges::user_vault_id.eq(&user_vault_id))
                .for_no_key_update()
                .first(conn)?;
            if (challenge.expires_at - chrono::Utc::now().naive_utc()) < chrono::Duration::seconds(0) {
                return Err(DbError::ChallengeExpired);
            }
            if challenge.state != ChallengeState::AwaitingResponse {
                return Err(DbError::ChallengeInactive);
            }
            let user_vault: UserVault = schema::user_vaults::table
                .filter(schema::user_vaults::id.eq(&user_vault_id))
                .for_no_key_update()
                .first(conn)?;
            let expected_sh_data = match challenge.kind {
                ChallengeKind::PhoneNumber => &user_vault.sh_phone_number,
                ChallengeKind::Email => &user_vault.sh_email,
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
                .set((
                    schema::challenges::state.eq(ChallengeState::Validated),
                    schema::challenges::validated_at.eq(diesel::dsl::now),
                ))
                .execute(conn)?;
            // Mark the piece of data on the user validated
            match challenge.kind {
                ChallengeKind::PhoneNumber => {
                    diesel::update(&user_vault)
                        .set(schema::user_vaults::is_phone_number_verified.eq(true))
                        .execute(conn)?;
                }
                ChallengeKind::Email => {
                    diesel::update(&user_vault)
                        .set(schema::user_vaults::is_email_verified.eq(true))
                        .execute(conn)?;
                }
            }

            Ok(())
        })
    })
    .await??;

    Ok(())
}