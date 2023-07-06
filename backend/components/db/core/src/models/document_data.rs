use std::collections::HashMap;

use crate::DbResult;
use crate::HasLifetime;
use crate::PgConn;
use crate::TxnPgConn;
use crate::VaultedData;
use chrono::{DateTime, Utc};
use db_schema::schema::data_lifetime;
use db_schema::schema::document_data;
use diesel::prelude::*;
use itertools::Itertools;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeId;
use newtypes::DocumentDataId;
use newtypes::PiiString;
use newtypes::S3Url;
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
    pub kind: DataIdentifier,
    pub mime_type: PiiString,
    pub filename: String,
    pub s3_url: S3Url,
    pub e_data_key: SealedVaultDataKey,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = document_data)]
pub struct NewDocumentData {
    pub lifetime_id: DataLifetimeId,
    pub kind: DataIdentifier,
    pub mime_type: PiiString,
    pub filename: String,
    pub s3_url: S3Url,
    pub e_data_key: SealedVaultDataKey,
}

impl DocumentData {
    #[tracing::instrument("DocumentData::create", skip_all)]
    #[allow(clippy::too_many_arguments)]
    pub fn create(
        conn: &mut TxnPgConn,
        vault_id: &VaultId,
        scoped_vault_id: &ScopedVaultId,
        kind: DataIdentifier,
        mime_type: String,
        filename: String,
        s3_url: S3Url,
        e_data_key: SealedVaultDataKey,
    ) -> DbResult<Self> {
        let seqno = DataLifetime::get_next_seqno(conn)?;

        let dl = DataLifetime::create(conn, vault_id, scoped_vault_id, kind.clone(), seqno)?;

        let new_doc = NewDocumentData {
            lifetime_id: dl.id,
            kind,
            mime_type: PiiString::from(mime_type),
            filename,
            s3_url,
            e_data_key,
        };

        let res = diesel::insert_into(document_data::table)
            .values(new_doc)
            .get_result::<DocumentData>(conn.conn())?;
        Ok(res)
    }

    #[tracing::instrument("DocumentData::get_bulk", skip_all)]
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

    #[tracing::instrument("DocumentData::bulk_get_by_lifetime_ids", skip_all)]
    pub fn bulk_get_by_lifetime_ids(
        conn: &mut PgConn,
        ids: Vec<&DataLifetimeId>,
    ) -> DbResult<HashMap<VaultId, Vec<DocumentData>>> {
        let results: Vec<_> = document_data::table
            .inner_join(data_lifetime::table)
            .filter(data_lifetime::id.eq_any(ids))
            .select((data_lifetime::vault_id, document_data::all_columns))
            .get_results::<(VaultId, DocumentData)>(conn)?;

        // group by vault id
        let results = results
            .into_iter()
            .group_by(|(v_id, _)| v_id.clone())
            .into_iter()
            .map(|(v_id, g)| (v_id, g.into_iter().map(|(_, d)| d).collect()))
            .collect();

        Ok(results)
    }
}

impl HasLifetime for DocumentData {
    fn lifetime_id(&self) -> &DataLifetimeId {
        &self.lifetime_id
    }

    #[tracing::instrument("DocumentData::get_for", skip_all)]
    fn get_for(conn: &mut PgConn, lifetime_ids: &[DataLifetimeId]) -> DbResult<Vec<Self>>
    where
        Self: Sized,
    {
        let results = document_data::table
            .filter(document_data::lifetime_id.eq_any(lifetime_ids))
            .get_results(conn)?;
        Ok(results)
    }

    fn data(&self) -> VaultedData {
        VaultedData::LargeSealed(&self.s3_url, &self.e_data_key)
    }
}
