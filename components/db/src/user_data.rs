use crate::errors::DbError;
use crate::models::user_data::UserData;
use crate::schema;
use crate::DbPool;
use chrono::Utc;
use diesel::dsl::sql;
use diesel::prelude::*;
use diesel::sql_types::Array;
use diesel::sql_types::Text;
use itertools::Itertools;
use newtypes::DataKind;
use newtypes::{UserDataId, UserVaultId};
use std::collections::HashMap;

pub fn list(
    conn: &mut PgConnection,
    user_vault_id: UserVaultId,
) -> Result<HashMap<DataKind, Vec<UserData>>, DbError> {
    let result: Vec<UserData> = schema::user_data::table
            .filter(schema::user_data::user_vault_id.eq(user_vault_id))
            .filter(schema::user_data::deactivated_at.is_null())
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
        .db_query(move |conn| {
            user_data::table
                .filter(user_data::user_vault_id.eq(user_vault_id))
                .filter(user_data::data_kind.eq_any(data_kinds))
                .filter(user_data::deactivated_at.is_null())
                .load(conn)
        })
        .await??;

    Ok(result)
}

pub fn bulk_deactivate(conn: &mut PgConnection, user_data_ids: Vec<UserDataId>) -> Result<usize, DbError> {
    use schema::user_data;

    let expected_num_rows_updated = user_data_ids.len();
    let now = Utc::now();
    let num_rows_updated = diesel::update(user_data::table)
        .filter(user_data::id.eq_any(user_data_ids))
        .set(user_data::deactivated_at.eq(now))
        .execute(conn)?;
    if num_rows_updated != expected_num_rows_updated {
        return Err(DbError::IncorrectNumberOfRowsUpdated);
    }
    Ok(num_rows_updated)
}

pub fn bulk_fetch_populated_kinds(
    conn: &mut PgConnection,
    user_vault_ids: Vec<&UserVaultId>,
) -> Result<HashMap<UserVaultId, Vec<DataKind>>, DbError> {
    use schema::user_data;
    // Fetch a list of data kinds from the set of active user_datas, grouped by user_vault_id.
    // This effectively tells us the list of data kinds that the user has added to their vault.
    let results: Vec<(UserVaultId, Vec<DataKind>)> = user_data::table
        .select((
            user_data::user_vault_id,
            sql::<Array<Text>>("array_agg(data_kind)"),
        ))
        .filter(user_data::user_vault_id.eq_any(user_vault_ids))
        .filter(user_data::deactivated_at.is_null())
        .group_by(user_data::user_vault_id)
        .load(conn)?;
    let user_id_to_data_kinds: HashMap<UserVaultId, Vec<DataKind>> = results.into_iter().collect();
    Ok(user_id_to_data_kinds)
}
