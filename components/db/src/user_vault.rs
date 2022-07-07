use crate::models::onboardings::*;
use crate::models::user_data::NewUserData;
use crate::models::user_vaults::*;
use crate::onboarding::get_for_fp_id;
use crate::schema;
use crate::{errors::DbError, models::user_data::UserData};
use diesel::prelude::*;
use newtypes::{DataKind, DataPriority, Fingerprint, FootprintUserId, TenantId, UserVaultId};

pub async fn create(pool: &crate::DbPool, new_user: NewUserVaultReq) -> Result<UserVault, crate::DbError> {
    let user_vault = pool
        .db_transaction(move |conn| {
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

                e_data: new_user.e_phone_number,
                sh_data: Some(new_user.sh_phone_number),
                // Phone numbers are always created as verified
                is_verified: true,
                data_group_id: None,
                data_group_kind: newtypes::DataGroupKind::PhoneNumber,
                data_group_priority: DataPriority::Primary,
            };
            phone_number_data.insert(conn)?;
            Ok(user_vault)
        })
        .await?;
    Ok(user_vault)
}

pub async fn get(pool: &crate::DbPool, uv_id: UserVaultId) -> Result<UserVault, DbError> {
    let user = pool.db_query(move |conn| get_sync(conn, uv_id)).await??;

    Ok(user)
}

pub async fn get_by_tenant_and_onboarding(
    pool: &crate::DbPool,
    tenant_id: TenantId,
    footprint_user_id: FootprintUserId,
) -> Result<Option<(UserVault, Onboarding)>, DbError> {
    let result = pool
        .db_query(move |conn| -> Result<Option<(UserVault, Onboarding)>, DbError> {
            let onboarding: Option<Onboarding> = get_for_fp_id(conn, tenant_id, footprint_user_id)?;

            match onboarding {
                Some(ob) => Ok(Some((get_sync(conn, ob.user_vault_id.clone())?, ob))),
                None => Ok(None),
            }
        })
        .await??;

    Ok(result)
}

pub async fn get_by_fingerprint_and_uv_id(
    pool: &crate::DbPool,
    data_kind: DataKind,
    uv_id: UserVaultId,
    sh_data: Fingerprint,
    require_verified: bool,
) -> Result<Option<(UserVault, UserData)>, DbError> {
    let result = pool
        .db_query(move |conn| -> Result<Option<(UserVault, UserData)>, DbError> {
            let mut result = schema::user_vaults::table
                .inner_join(schema::user_data::table)
                .filter(schema::user_data::data_kind.eq(data_kind))
                .filter(schema::user_data::sh_data.eq(Some(sh_data)))
                .filter(schema::user_vaults::id.eq(uv_id))
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

pub async fn get_by_fingerprint(
    pool: &crate::DbPool,
    data_kind: DataKind,
    sh_data: Fingerprint,
    require_verified: bool,
) -> Result<Option<(UserVault, UserData)>, DbError> {
    let result = pool
        .db_query(move |conn| -> Result<Option<(UserVault, UserData)>, DbError> {
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

pub fn get_sync(conn: &mut PgConnection, uv_id: UserVaultId) -> Result<UserVault, DbError> {
    let user = schema::user_vaults::table
        .filter(schema::user_vaults::id.eq(uv_id))
        .first(conn)?;
    Ok(user)
}
