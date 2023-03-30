use std::collections::HashMap;

use crate::schema::data_lifetime;
use crate::schema::document_data;
use crate::DbResult;
use crate::HasLifetime;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use newtypes::DataLifetimeId;
use newtypes::DocumentDataId;
use newtypes::DocumentKind;
use newtypes::ScopedVaultId;
use newtypes::SealedVaultDataKey;
use newtypes::VaultId;
use serde::{Deserialize, Serialize};

use super::data_lifetime::DataLifetime;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = document_data)]
pub struct DocumentData {
    pub id: DocumentDataId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub lifetime_id: DataLifetimeId,
    pub kind: DocumentKind,
    pub mime_type: String,
    pub filename: String,
    pub s3_url: String,
    pub e_data_key: SealedVaultDataKey,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = document_data)]
pub struct NewDocumentData {
    pub lifetime_id: DataLifetimeId,
    pub kind: DocumentKind,
    pub mime_type: String,
    pub filename: String,
    pub s3_url: String,
    pub e_data_key: SealedVaultDataKey,
}

impl DocumentData {
    #[tracing::instrument(skip_all)]
    #[allow(clippy::too_many_arguments)]
    pub fn create(
        conn: &mut TxnPgConn,
        vault_id: &VaultId,
        scoped_vault_id: &ScopedVaultId,
        kind: DocumentKind,
        mime_type: String,
        filename: String,
        s3_url: String,
        e_data_key: SealedVaultDataKey,
    ) -> DbResult<Self> {
        let seqno = DataLifetime::get_next_seqno(conn)?;

        let dl = DataLifetime::create(conn, vault_id, scoped_vault_id, kind.into(), seqno)?;

        let new_doc = NewDocumentData {
            lifetime_id: dl.id,
            kind,
            mime_type,
            filename,
            s3_url,
            e_data_key,
        };

        let res = diesel::insert_into(document_data::table)
            .values(new_doc)
            .get_result::<DocumentData>(conn.conn())?;
        Ok(res)
    }

    // TODO: query by DLId's and call from vdbuilder
    #[tracing::instrument(skip_all)]
    pub fn latest_for_scoped_vault(
        conn: &mut PgConn,
        scoped_vault_id: &ScopedVaultId,
    ) -> DbResult<Option<Self>> {
        let res = document_data::table
            .inner_join(data_lifetime::table)
            .filter(data_lifetime::scoped_vault_id.eq(scoped_vault_id))
            .order_by(document_data::_created_at.desc())
            .select(document_data::all_columns)
            .first(conn)
            .optional()?;

        Ok(res)
    }

    #[tracing::instrument(skip_all)]
    pub fn get_bulk(
        conn: &mut PgConn,
        ids: Vec<&DocumentDataId>,
    ) -> DbResult<HashMap<DocumentDataId, DocumentData>> {
        let results = document_data::table
            .filter(document_data::id.eq_any(ids))
            .get_results::<DocumentData>(conn)?
            .into_iter()
            .map(|d| (d.id.clone(), d))
            .collect();

        Ok(results)
    }
}

impl HasLifetime for DocumentData {
    fn lifetime_id(&self) -> &DataLifetimeId {
        &self.lifetime_id
    }

    fn get_for(conn: &mut PgConn, lifetime_ids: &[DataLifetimeId]) -> DbResult<Vec<Self>>
    where
        Self: Sized,
    {
        let results = document_data::table
            .filter(document_data::lifetime_id.eq_any(lifetime_ids))
            .get_results(conn)?;
        Ok(results)
    }
}
