use crate::errors::DbError;
use crate::models::user_data::UserData;
use crate::schema;
use crate::DbPool;
use diesel::dsl::any;
use diesel::prelude::*;
use itertools::Itertools;
use newtypes::DataKind;
use newtypes::UserVaultId;
use std::collections::HashMap;

pub fn list(
    conn: &PgConnection,
    user_vault_id: UserVaultId,
) -> Result<HashMap<DataKind, Vec<UserData>>, DbError> {
    let result: Vec<UserData> =
        schema::user_data::table
            .filter(schema::user_data::user_vault_id.eq(user_vault_id))
            // Needed for group_by. Fast with the DB index
            .order_by(schema::user_data::data_kind)
            .load(conn)?;

    // Turn the Vec of UserData into a hashmap of grouped DataKind -> Vec<UserData>
    // group_by only groups adjacent items, so this requires that the vec is sorted by data_kind
    let result = result
        .into_iter()
        .group_by(|ud| ud.data_kind)
        .into_iter()
        .map(|g| (g.0, g.1.collect()))
        .collect();
    Ok(result)
}

pub async fn filter(
    pool: &DbPool,
    user_vault_id: UserVaultId,
    data_kinds: Vec<DataKind>,
) -> Result<Vec<UserData>, DbError> {
    use schema::user_data;

    let result: Vec<UserData> = pool
        .get()
        .await?
        .interact(move |conn| {
            user_data::table
                .filter(user_data::user_vault_id.eq(user_vault_id))
                .filter(user_data::data_kind.eq(any(data_kinds)))
                .load(conn)
        })
        .await??;

    Ok(result)
}