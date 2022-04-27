use crate::schema;
use diesel::prelude::*;
use deadpool_diesel::postgres::Pool;
use crate::models::users::{User};
use crate::models::challenge::{Challenge, NewChallenge};
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
    user_id: String,
    sh_data: Vec<u8>,
    kind: ChallengeKind,
) -> Result<(Challenge, String), DbError> {
    let conn = pool.get().await?;

    // TODO cryptographically random
    let (code, h_code) = gen_code_and_hash();

    let new_challenge = NewChallenge {
        user_id,
        sh_data,
        h_code: h_code.to_vec(),
        kind,
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

pub async fn expire_old(pool: &Pool, user_id: String, kind: ChallengeKind) -> Result<usize, DbError> {
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

pub async fn verify(
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