use super::data_lifetime::DataLifetime;
use crate::DbError;
use crate::PgConn;
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

#[derive(Debug, Clone, Queryable, Insertable)]
#[diesel(table_name = scoped_vault_tag)]
pub struct ScopedVaultTag {
    pub id: TagId,
    pub created_at: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub created_seqno: DataLifetimeSeqno,
    pub deactivated_seqno: Option<DataLifetimeSeqno>,
    pub scoped_vault_id: ScopedVaultId,
    pub kind: String,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub created_by_actor: Option<DbActor>,
    pub deactivated_by_actor: Option<DbActor>,
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
    pub fn get_active(conn: &mut PgConn, sv_id: &ScopedVaultId) -> Result<Vec<Self>, DbError> {
        let tags = scoped_vault_tag::table
            .filter(scoped_vault_tag::scoped_vault_id.eq(sv_id))
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
    ) -> Result<(), DbError> {
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
    pub fn get_or_create(conn: &mut PgConn, args: NewScopedVaultTag) -> Result<ScopedVaultTag, DbError> {
        let existing = scoped_vault_tag::table
            .filter(scoped_vault_tag::scoped_vault_id.eq(&args.scoped_vault_id))
            .filter(scoped_vault_tag::kind.eq(&args.kind))
            .get_result(conn)
            .optional()?;

        if let Some(tag) = existing {
            Ok(tag)
        } else {
            let res = diesel::insert_into(scoped_vault_tag::table)
                .values(args)
                .get_result(conn)?;

            Ok(res)
        }
    }
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = scoped_vault_tag)]
pub struct NewScopedVaultTag {
    pub created_at: DateTime<Utc>,
    pub created_seqno: DataLifetimeSeqno,
    pub scoped_vault_id: ScopedVaultId,
    pub kind: String,
    pub created_by_actor: DbActor,
}
