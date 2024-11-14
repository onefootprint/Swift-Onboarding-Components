use super::data_lifetime::DataLifetime;
use super::scoped_vault::ScopedVault;
use crate::PgConn;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::scoped_vault_tag;
use diesel::prelude::*;
use diesel::Insertable;
use diesel::Queryable;
use newtypes::DataLifetimeSeqno;
use newtypes::DbActor;
use newtypes::ScopedVaultId;
use newtypes::TagId;
use newtypes::TagKind;
use newtypes::TenantId;

#[derive(Debug, Clone, Queryable, Insertable)]
#[diesel(table_name = scoped_vault_tag)]
pub struct ScopedVaultTag {
    pub id: TagId,
    pub created_at: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub created_seqno: DataLifetimeSeqno,
    pub deactivated_seqno: Option<DataLifetimeSeqno>,
    pub scoped_vault_id: ScopedVaultId,
    pub kind: TagKind,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub created_by_actor: Option<DbActor>,
    pub deactivated_by_actor: Option<DbActor>,
    pub tenant_id: TenantId,
    pub is_live: bool,
}

#[derive(Debug, Clone, AsChangeset)]
#[diesel(table_name = scoped_vault_tag)]
pub struct DeactivateTagUpdate {
    pub deactivated_at: DateTime<Utc>,
    pub deactivated_seqno: DataLifetimeSeqno,
    pub deactivated_by_actor: DbActor,
}

impl ScopedVaultTag {
    #[tracing::instrument("ScopedVaultTag::get_active", skip_all)]
    pub fn get_active(conn: &mut PgConn, sv_id: &ScopedVaultId) -> FpResult<Vec<Self>> {
        let tags = scoped_vault_tag::table
            .filter(scoped_vault_tag::scoped_vault_id.eq(sv_id))
            .filter(scoped_vault_tag::deactivated_seqno.is_null())
            .order_by(scoped_vault_tag::created_at.asc())
            .get_results(conn)?;
        Ok(tags)
    }

    #[tracing::instrument("ScopedVaultTag::bulk_get_active", skip_all)]
    pub fn bulk_get_active(conn: &mut PgConn, sv_ids: Vec<&ScopedVaultId>) -> FpResult<Vec<Self>> {
        let tags = scoped_vault_tag::table
            .filter(scoped_vault_tag::scoped_vault_id.eq_any(sv_ids))
            .filter(scoped_vault_tag::deactivated_seqno.is_null())
            .order_by(scoped_vault_tag::created_at.asc())
            .get_results(conn)?;
        Ok(tags)
    }

    #[tracing::instrument("ScopedVaultTag::deactivate", skip_all)]
    pub fn deactivate(
        conn: &mut PgConn,
        sv_id: &ScopedVaultId,
        tag_id: &TagId,
        deactivated_by_actor: DbActor,
    ) -> FpResult<()> {
        let seqno = DataLifetime::get_current_seqno(conn)?;

        let update = DeactivateTagUpdate {
            deactivated_at: Utc::now(),
            deactivated_seqno: seqno,
            deactivated_by_actor,
        };

        diesel::update(scoped_vault_tag::table)
            .filter(scoped_vault_tag::id.eq(tag_id))
            .filter(scoped_vault_tag::scoped_vault_id.eq(sv_id))
            .filter(scoped_vault_tag::deactivated_seqno.is_null())
            .set(update)
            .get_result::<Self>(conn)?;

        Ok(())
    }

    #[tracing::instrument("ScopedVaultTag::get_or_create", skip_all)]
    pub fn get_or_create(conn: &mut PgConn, args: NewScopedVaultTag) -> FpResult<ScopedVaultTag> {
        let existing = scoped_vault_tag::table
            .filter(scoped_vault_tag::scoped_vault_id.eq(&args.scoped_vault.id))
            .filter(scoped_vault_tag::deactivated_seqno.is_null())
            .filter(scoped_vault_tag::kind.eq(&args.kind))
            .get_result(conn)
            .optional()?;

        if let Some(tag) = existing {
            return Ok(tag);
        }
        let new = NewScopedVaultTagRow {
            created_at: args.created_at,
            created_seqno: args.created_seqno,
            scoped_vault_id: args.scoped_vault.id,
            kind: args.kind,
            created_by_actor: args.created_by_actor,
            tenant_id: args.scoped_vault.tenant_id,
            is_live: args.scoped_vault.is_live,
        };
        let res = diesel::insert_into(scoped_vault_tag::table)
            .values(new)
            .get_result(conn)?;

        Ok(res)
    }
}

#[derive(Debug, Clone)]
pub struct NewScopedVaultTag {
    pub created_at: DateTime<Utc>,
    pub created_seqno: DataLifetimeSeqno,
    pub scoped_vault: ScopedVault,
    pub kind: String,
    pub created_by_actor: DbActor,
}


#[derive(Debug, Insertable)]
#[diesel(table_name = scoped_vault_tag)]
struct NewScopedVaultTagRow {
    created_at: DateTime<Utc>,
    created_seqno: DataLifetimeSeqno,
    scoped_vault_id: ScopedVaultId,
    kind: String,
    created_by_actor: DbActor,
    tenant_id: TenantId,
    is_live: bool,
}
