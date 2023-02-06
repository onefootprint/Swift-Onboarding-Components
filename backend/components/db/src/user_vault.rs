use crate::models::scoped_user::ScopedUser;
use crate::models::user_vault::{NewUserVaultArgs, UserVault};
use crate::{errors::DbError, models::user_vault::NewNonPortableUserVaultReq};
use diesel::dsl::not;
use diesel::prelude::*;
use itertools::Itertools;
use newtypes::Fingerprint;

// TODO modernize these utils
/// a NON-portable, tenant-scoped vault + a scoped user for the tenant and the vault
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
            let new_user_vault = NewUserVaultArgs {
                e_private_key,
                public_key,
                is_live,
                is_portable: false,
            };
            let user_vault = UserVault::create(conn, new_user_vault)?;
            let scoped_user = ScopedUser::create_non_portable(conn, user_vault, tenant_id)?;

            Ok(scoped_user)
        })
        .await?;
    Ok(scoped_user)
}

#[tracing::instrument(skip(pool, sh_data))]
/// Look for the portable user vault with a matching fingerprint
pub async fn get_portable_by_fingerprint(
    pool: &crate::DbPool,
    sh_data: Fingerprint,
    // If true, allows locating users by an uncommitted, non-portable fingerprint
    search_non_portable: bool,
) -> Result<Option<UserVault>, DbError> {
    // we don't filter by is_unique here because we opportunistically
    // want to identify users with not-yet-verified emails
    // (provided they are the only such user in the system)
    use crate::schema::{data_lifetime, fingerprint, user_vault};
    let results: Vec<_> = pool
        .db_query(move |conn| -> Result<_, DbError> {
            let mut query = user_vault::table
                .inner_join(data_lifetime::table.inner_join(fingerprint::table))
                .filter(fingerprint::sh_data.eq(sh_data))
                .filter(data_lifetime::deactivated_seqno.is_null())
                // Never allow finding a vault-only, non-portable user vault created via API
                .filter(user_vault::is_portable.eq(true))
                .select(user_vault::all_columns)
                .into_boxed();
            if !search_non_portable {
                query = query.filter(not(data_lifetime::portablized_seqno.is_null()))
            }
            let results = query.get_results::<UserVault>(conn)?;
            Ok(results)
        })
        .await??;

    // we found more than 1 vault on this fingerprint
    if results.len() > 1 {
        // find the unique vaults for this fingerprint
        let unique: Vec<_> = results.into_iter().unique_by(|uv| uv.id.clone()).collect();
        if unique.len() == 1 {
            return Ok(unique.into_iter().next());
        }

        // in this case, more than 1 vault have non-verified claims for this email address
        // so we cannot be sure which user vault we are trying to identify
        tracing::info!("found more than one vault for fingerprint");
        return Ok(None);
    }

    Ok(results.into_iter().next())
}
