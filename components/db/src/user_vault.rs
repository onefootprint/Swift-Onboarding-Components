use crate::errors::DbError;
use crate::models::phone_number::PhoneNumber;
use crate::models::user_vaults::*;
use crate::schema;
use diesel::prelude::*;
use newtypes::{DataPriority, Fingerprint, UserVaultId};

pub async fn create(pool: &crate::DbPool, new_user: NewUserVaultReq) -> Result<UserVault, DbError> {
    let user_vault = pool
        .db_transaction(move |conn| -> Result<_, DbError> {
            let new_user_vault = NewUserVault {
                e_private_key: new_user.e_private_key,
                public_key: new_user.public_key,
                is_live: new_user.is_live,
            };
            let user_vault = diesel::insert_into(schema::user_vaults::table)
                .values(new_user_vault)
                .get_result::<UserVault>(conn)?;
            PhoneNumber::create(
                conn,
                user_vault.id.clone(),
                new_user.e_phone_number,
                new_user.e_phone_country,
                vec![new_user.sh_phone_number],
                true, // phone numbers created as verified
                DataPriority::Primary,
            )?;
            Ok(user_vault)
        })
        .await?;
    Ok(user_vault)
}

pub async fn get(pool: &crate::DbPool, uv_id: UserVaultId) -> Result<UserVault, DbError> {
    let user = pool.db_query(move |conn| UserVault::get(conn, &uv_id)).await??;
    Ok(user)
}

pub async fn get_by_fingerprint(
    pool: &crate::DbPool,
    sh_data: Fingerprint,
) -> Result<Option<UserVault>, DbError> {
    let result = pool
        .db_query(move |conn| -> Result<_, DbError> {
            let result = schema::user_vaults::table
                .inner_join(schema::fingerprint::table)
                .filter(schema::fingerprint::sh_data.eq(sh_data))
                .select(schema::user_vaults::all_columns)
                .first(conn)
                .optional()?;
            Ok(result)
        })
        .await??;

    Ok(result)
}
