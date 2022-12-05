use crate::models::phone_number::PhoneNumber;
use crate::models::scoped_user::ScopedUser;
use crate::models::user_vault::*;
use crate::schema;
use crate::{errors::DbError, models};
use diesel::prelude::*;
use newtypes::{DataPriority, Fingerprint, UserVaultId};

/// creates a portable user vault
pub async fn create(pool: &crate::DbPool, new_user: NewPortableUserVaultReq) -> Result<UserVault, DbError> {
    let user_vault = pool
        .db_transaction(move |conn| -> Result<_, DbError> {
            let new_user_vault = NewUserVault {
                e_private_key: new_user.e_private_key,
                public_key: new_user.public_key,
                is_live: new_user.is_live,
                is_portable: true,
            };
            let user_vault = diesel::insert_into(schema::user_vault::table)
                .values(new_user_vault)
                .get_result::<UserVault>(conn.conn())?;
            PhoneNumber::create(
                conn,
                user_vault.id.clone(),
                new_user.e_phone_number,
                new_user.sh_phone_number,
                new_user.e_phone_country,
                true, // phone numbers created as verified
                DataPriority::Primary,
            )?;
            Ok(user_vault)
        })
        .await?;
    Ok(user_vault)
}

/// creates a NON-portable, tenant-scoped vault + a scoped user for the tenant and the vault
/// returning the scoped user
pub async fn create_non_portable(
    pool: &crate::DbPool,
    req: NewNonPortableUserVaultReq,
) -> Result<ScopedUser, DbError> {
    let NewNonPortableUserVaultReq {
        e_private_key,
        public_key,
        is_live,
        tenant_id,
    } = req;

    let scoped_user = pool
        .db_transaction(move |conn| -> Result<_, DbError> {
            let new_user_vault = NewUserVault {
                e_private_key,
                public_key,
                is_live,
                is_portable: false,
            };
            let user_vault = diesel::insert_into(schema::user_vault::table)
                .values(new_user_vault)
                .get_result::<UserVault>(conn.conn())?;

            // create the scoped user
            let scoped_user = ScopedUser::get_or_create(conn, user_vault.id, tenant_id, is_live)?;

            Ok(scoped_user)
        })
        .await?;
    Ok(scoped_user)
}

pub async fn get(pool: &crate::DbPool, uv_id: UserVaultId) -> Result<UserVault, DbError> {
    let user = pool.db_query(move |conn| UserVault::get(conn, &uv_id)).await??;
    Ok(user)
}

#[tracing::instrument(skip(pool, sh_data))]
pub async fn get_by_fingerprint(
    pool: &crate::DbPool,
    sh_data: Fingerprint,
) -> Result<Option<UserVault>, DbError> {
    // we don't filter by is_unique here because we opportunistically
    // want to identify users with not-yet-verified emails
    // (provided they are the only such user in the system)
    let results: Vec<(UserVault, models::fingerprint::Fingerprint)> = pool
        .db_query(move |conn| -> Result<_, DbError> {
            let result = schema::user_vault::table
                .inner_join(schema::fingerprint::table)
                .filter(schema::fingerprint::sh_data.eq(sh_data))
                // multiple fingerprints may point to the same vault
                .distinct_on(schema::user_vault::id)
                .get_results(conn)?;
            Ok(result)
        })
        .await??;

    // we found more than 1 vault on this fingerprint
    if results.len() > 1 {
        // find the unique vaults for this fingerprint
        let unique: Vec<UserVault> = results
            .into_iter()
            .filter(|(_, fp)| fp.is_unique)
            .map(|(uv, _)| uv)
            .collect();

        if unique.len() == 1 {
            return Ok(unique.into_iter().next());
        }

        // in this case, more than 1 vault have non-verified claims for this email address
        // so we cannot be sure which user vault we are trying to identify
        tracing::info!("found more than one vault for fingerprint");
        return Ok(None);
    }

    Ok(results.into_iter().map(|(uv, _)| uv).next())
}
