use crate::errors::DbError;
use crate::models::onboardings::*;
use crate::models::types::Status;
use crate::models::user_vaults::*;
use crate::onboarding::{get_for_tenant, get_onboarding_by_session_id_sync};
use crate::schema;
use deadpool_diesel::postgres::Pool;
use diesel::prelude::*;

pub async fn init(
    pool: &Pool,
    user: NewUserVault,
    tenant_id: String,
) -> Result<(UserVault, Onboarding), DbError> {
    let conn = pool.get().await?;

    let (user_vault, onboarding) = conn
        .interact(move |conn| {
            conn.build_transaction()
                .run(|| -> Result<(UserVault, Onboarding), DbError> {
                    // initialize new user vault
                    let user_vault: UserVault = diesel::insert_into(schema::user_vaults::table)
                        .values(&user)
                        .get_result::<UserVault>(conn)?;

                    // associate new user with tenant
                    let new_onboarding = NewOnboarding {
                        tenant_id: tenant_id.clone(),
                        user_vault_id: user_vault.clone().id,
                        status: Status::Incomplete,
                    };
                    let onboarding: Onboarding = diesel::insert_into(schema::onboardings::table)
                        .values(&new_onboarding)
                        .get_result::<Onboarding>(conn)?;

                    Ok((user_vault, onboarding))
                })
        })
        .await??;
    Ok((user_vault, onboarding))
}

pub async fn update(pool: &Pool, update: UpdateUserVault) -> Result<usize, DbError> {
    let conn = pool.get().await?;

    let size = conn
        .interact(move |conn| {
            diesel::update(
                schema::user_vaults::table.filter(schema::user_vaults::id.eq(update.id.clone())),
            )
            .set(update)
            .execute(conn)
        })
        .await??;

    Ok(size)
}

pub async fn get(pool: &Pool, uv_id: String) -> Result<UserVault, DbError> {
    let conn = pool.get().await?;

    let user = conn
        .interact(move |conn| -> Result<UserVault, DbError> { get_sync(conn, uv_id) })
        .await??;

    Ok(user)
}

pub async fn get_by_tenant_and_onboarding(
    pool: &Pool,
    tenant_id: String,
    footprint_user_id: String,
) -> Result<Option<(UserVault, Onboarding)>, DbError> {
    let conn = pool.get().await?;

    let result: Option<(UserVault, Onboarding)> = conn
        .interact(
            move |conn| -> Result<Option<(UserVault, Onboarding)>, DbError> {
                let onboarding: Option<Onboarding> =
                    get_for_tenant(conn, tenant_id, footprint_user_id)?;

                match onboarding {
                    Some(ob) => Ok(Some((get_sync(conn, ob.user_vault_id.clone())?, ob))),
                    None => Ok(None),
                }
            },
        )
        .await??;

    Ok(result)
}
pub async fn get_by_session_id(pool: &Pool, session_cookie: String) -> Result<UserVault, DbError> {
    let conn = pool.get().await?;

    let user = conn
        .interact(move |conn| -> Result<UserVault, DbError> {
            let onboarding: Onboarding = get_onboarding_by_session_id_sync(conn, session_cookie)?;

            let (_, user): (Onboarding, UserVault) = schema::onboardings::table
                .inner_join(
                    schema::user_vaults::table
                        .on(schema::user_vaults::id.eq(schema::onboardings::user_vault_id)),
                )
                .filter(schema::user_vaults::id.eq(onboarding.user_vault_id))
                .first(conn)?;
            Ok(user)
        })
        .await??;

    Ok(user)
}

pub async fn get_by_phone_number(
    pool: &Pool,
    sh_phone_number: Vec<u8>,
) -> Result<Option<UserVault>, DbError> {
    let conn = pool.get().await?;

    let user = conn
        .interact(move |conn| -> Result<Option<UserVault>, DbError> {
            let user = schema::user_vaults::table
                .filter(schema::user_vaults::sh_phone_number.eq(sh_phone_number))
                .first(conn)
                .optional()?;
            Ok(user)
        })
        .await??;
    Ok(user)
}

pub async fn get_by_email(pool: &Pool, sh_email: Vec<u8>) -> Result<Option<UserVault>, DbError> {
    let conn = pool.get().await?;

    let user = conn
        .interact(move |conn| -> Result<Option<UserVault>, DbError> {
            let user = schema::user_vaults::table
                .filter(schema::user_vaults::sh_email.eq(sh_email))
                .first(conn)
                .optional()?;
            Ok(user)
        })
        .await??;

    Ok(user)
}

pub fn get_sync(conn: &mut PgConnection, uv_id: String) -> Result<UserVault, DbError> {
    let user = schema::user_vaults::table
        .filter(schema::user_vaults::id.eq(uv_id))
        .first(conn)?;
    Ok(user)
}
