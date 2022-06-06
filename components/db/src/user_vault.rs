use crate::models::onboardings::*;
use crate::models::session_data::SessionState;
use crate::models::user_data::NewUserData;
use crate::models::user_vaults::*;
use crate::onboarding::get_for_tenant;
use crate::schema;
use crate::session::get_session_by_id_sync;
use crate::{errors::DbError, models::user_data::UserData};
use deadpool_diesel::postgres::Pool;
use diesel::prelude::*;
use newtypes::{DataKind, DataPriority, FootprintUserId, TenantId, UserVaultId};

pub async fn create(pool: &Pool, new_user: NewUserVaultReq) -> Result<UserVault, crate::DbError> {
    let user_vault = pool
        .get()
        .await?
        .interact(move |conn| {
            conn.build_transaction().run(|| -> Result<UserVault, DbError> {
                let new_user_vault = NewUserVault {
                    e_private_key: new_user.e_private_key,
                    public_key: new_user.public_key,
                    id_verified: new_user.id_verified,
                };
                let user_vault = diesel::insert_into(schema::user_vaults::table)
                    .values(new_user_vault)
                    .get_result::<UserVault>(conn)?;
                let phone_number_data = NewUserData {
                    user_vault_id: user_vault.id.clone(),
                    data_kind: DataKind::PhoneNumber,
                    data_priority: DataPriority::Primary,
                    e_data: new_user.e_phone_number,
                    sh_data: Some(new_user.sh_phone_number),
                    // Phone numbers are always created as verified
                    is_verified: true,
                };
                diesel::insert_into(schema::user_data::table)
                    .values(phone_number_data)
                    .get_result::<UserData>(conn)?;
                Ok(user_vault)
            })
        })
        .await??;
    Ok(user_vault)
}

pub async fn get(pool: &Pool, uv_id: UserVaultId) -> Result<UserVault, DbError> {
    let conn = pool.get().await?;

    let user = conn
        .interact(move |conn| -> Result<UserVault, DbError> { get_sync(conn, uv_id) })
        .await??;

    Ok(user)
}

pub async fn get_by_onboarding_session(pool: &Pool, session_id: String) -> Result<UserVault, DbError> {
    let conn = pool.get().await?;

    let user = conn
        .interact(move |conn| -> Result<UserVault, DbError> {
            let session =
                get_session_by_id_sync(conn, session_id)?.ok_or(DbError::InvalidSessionForOperation)?;
            let logged_in_data = match session.session_data {
                SessionState::OnboardingSession(s) => Ok(s),
                _ => Err(DbError::InvalidSessionForOperation),
            }?;
            get_sync(conn, logged_in_data.user_vault_id)
        })
        .await??;

    Ok(user)
}

pub async fn get_by_tenant_and_onboarding(
    pool: &Pool,
    tenant_id: TenantId,
    footprint_user_id: FootprintUserId,
) -> Result<Option<(UserVault, Onboarding)>, DbError> {
    let conn = pool.get().await?;

    let result: Option<(UserVault, Onboarding)> = conn
        .interact(move |conn| -> Result<Option<(UserVault, Onboarding)>, DbError> {
            let onboarding: Option<Onboarding> = get_for_tenant(conn, tenant_id, footprint_user_id)?;

            match onboarding {
                Some(ob) => Ok(Some((get_sync(conn, ob.user_vault_id.clone())?, ob))),
                None => Ok(None),
            }
        })
        .await??;

    Ok(result)
}

pub async fn get_by_fingerprint(
    pool: &Pool,
    data_kind: DataKind,
    sh_data: Vec<u8>,
    require_verified: bool,
) -> Result<Option<(UserVault, UserData)>, DbError> {
    let result = pool
        .get()
        .await?
        .interact(move |conn| -> Result<Option<(UserVault, UserData)>, DbError> {
            let mut result = schema::user_vaults::table
                .inner_join(schema::user_data::table)
                .filter(schema::user_data::data_kind.eq(data_kind))
                .filter(schema::user_data::sh_data.eq(Some(sh_data)))
                .into_boxed();
            if require_verified {
                result = result.filter(schema::user_data::is_verified.eq(true));
            }
            let result = result.first(conn).optional()?;
            Ok(result)
        })
        .await??;

    Ok(result)
}

pub fn get_sync(conn: &PgConnection, uv_id: UserVaultId) -> Result<UserVault, DbError> {
    let user = schema::user_vaults::table
        .filter(schema::user_vaults::id.eq(uv_id))
        .first(conn)?;
    Ok(user)
}
