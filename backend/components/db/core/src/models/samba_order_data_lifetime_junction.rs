use crate::{
    DbResult,
    TxnPgConn,
};
use chrono::{
    DateTime,
    Utc,
};
use db_schema::schema::samba_order_data_lifetime_junction;
use diesel::prelude::*;
use newtypes::{
    DataLifetimeId,
    SambaDatalifetimeJunctionTableId,
    SambaOrderTableId,
};
#[derive(Debug, Clone, Queryable, Insertable)]
#[diesel(table_name = samba_order_data_lifetime_junction)]
pub struct SambaOrderDataLifetimeJunction {
    pub id: SambaDatalifetimeJunctionTableId,
    pub lifetime_id: DataLifetimeId,
    pub order_id: SambaOrderTableId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = samba_order_data_lifetime_junction)]
struct NewSambaOrderDataLifetimeJunctionRow {
    lifetime_id: DataLifetimeId,
    order_id: SambaOrderTableId,
}


impl SambaOrderDataLifetimeJunction {
    #[tracing::instrument("SambaOrderDataLifetimeJunction::bulk_create", skip_all)]
    pub fn bulk_create(
        conn: &mut TxnPgConn,
        lifetime_ids: Vec<DataLifetimeId>,
        order_id: SambaOrderTableId,
    ) -> DbResult<Vec<Self>> {
        let rows: Vec<_> = lifetime_ids
            .into_iter()
            .map(|lifetime_id| NewSambaOrderDataLifetimeJunctionRow {
                lifetime_id,
                order_id: order_id.clone(),
            })
            .collect();

        let result = diesel::insert_into(samba_order_data_lifetime_junction::table)
            .values(rows)
            .get_results::<Self>(conn.conn())?;
        Ok(result)
    }
}
