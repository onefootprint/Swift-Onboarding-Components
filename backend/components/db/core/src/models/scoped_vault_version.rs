use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::scoped_vault_version;
use diesel::prelude::*;
use newtypes::DataLifetimeSeqno;
use newtypes::ScopedVaultId;
use newtypes::ScopedVaultVersionId;
use newtypes::ScopedVaultVersionNumber;

#[derive(Debug, Clone, Queryable, Selectable, Identifiable)]
#[diesel(table_name = scoped_vault_version)]
pub struct ScopedVaultVersion {
    pub id: ScopedVaultVersionId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,

    pub scoped_vault_id: ScopedVaultId,
    pub seqno: DataLifetimeSeqno,
    pub version: ScopedVaultVersionNumber,
}
