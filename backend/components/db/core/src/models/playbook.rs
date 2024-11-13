use super::ob_configuration::IsLive;
use super::ob_configuration::NewObConfigurationArgs;
use super::ob_configuration::ObConfiguration;
use super::tenant::Tenant;
use crate::DbError;
use crate::DbResult;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::ob_configuration;
use db_schema::schema::playbook;
use db_schema::schema::tenant;
use diesel::prelude::*;
use diesel::Queryable;
use newtypes::ApiKeyStatus;
use newtypes::Locked;
use newtypes::PlaybookId;
use newtypes::PublishablePlaybookKey;
use newtypes::TenantId;

/// A Playbook row groups together all versions of an ObConfiguration across edits.
#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = playbook)]
pub struct Playbook {
    pub id: PlaybookId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub key: PublishablePlaybookKey,
    pub tenant_id: TenantId,
    pub is_live: IsLive,
    /// Currently unused.
    /// TODO: implement playbook-wide immediate deactivation.
    pub status: ApiKeyStatus,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = playbook)]
pub struct NewPlaybook {
    pub key: PublishablePlaybookKey,
    pub tenant_id: TenantId,
    pub is_live: IsLive,
    pub status: ApiKeyStatus,
}

#[derive(Debug, derive_more::From)]
pub enum PlaybookIdentifier<'a> {
    Key(&'a PublishablePlaybookKey),
    TenantKey {
        key: &'a PublishablePlaybookKey,
        tenant_id: &'a TenantId,
        is_live: bool,
    },
}

impl Playbook {
    #[tracing::instrument("Playbook::create", skip_all)]
    pub fn create(
        conn: &mut TxnPgConn,
        tenant_id: &TenantId,
        is_live: IsLive,
        obc_args: NewObConfigurationArgs,
    ) -> DbResult<(Locked<Self>, ObConfiguration)> {
        let new_playbook = NewPlaybook {
            key: PublishablePlaybookKey::generate(is_live),
            tenant_id: tenant_id.clone(),
            is_live,
            status: ApiKeyStatus::Enabled,
        };

        let result: Playbook = diesel::insert_into(playbook::table)
            .values(&new_playbook)
            .get_result(conn.conn())?;
        let pb = Locked::new(result);

        let obc = ObConfiguration::create(conn, &pb, obc_args)?;

        Ok((pb, obc))
    }

    #[tracing::instrument("Playbook::lock", skip_all)]
    pub fn lock(conn: &mut TxnPgConn, playbook_id: &PlaybookId) -> DbResult<Locked<Self>> {
        let result = playbook::table
            .filter(playbook::id.eq(playbook_id))
            .for_no_key_update()
            .get_result(conn.conn())?;
        Ok(Locked::new(result))
    }

    /// Gets the latest version (active) OBC for a given playbook.
    #[tracing::instrument("Playbook::get_latest_version", skip_all)]
    pub fn get_latest_version<'a, T>(conn: &mut PgConn, id: T) -> DbResult<(Self, ObConfiguration, Tenant)>
    where
        T: Into<PlaybookIdentifier<'a>>,
    {
        let query = ob_configuration::table
            .inner_join(playbook::table)
            .inner_join(tenant::table)
            .into_boxed();

        let query = match id.into() {
            PlaybookIdentifier::Key(key) => query.filter(playbook::key.eq(key)),
            PlaybookIdentifier::TenantKey {
                key,
                tenant_id,
                is_live,
            } => query
                .filter(playbook::key.eq(key))
                .filter(playbook::tenant_id.eq(tenant_id))
                .filter(playbook::is_live.eq(is_live)),
        };

        let result = query
            .filter(ob_configuration::deactivated_at.is_null())
            .select((
                playbook::all_columns,
                ob_configuration::all_columns,
                tenant::all_columns,
            ))
            .first(conn)?;
        Ok(result)
    }

    /// Gets the latest version (active) OBC for a given playbook, but returns an error if it that
    /// latest version is disabled.
    #[tracing::instrument("Playbook::get_latest_version_if_enabled", skip_all)]
    pub fn get_latest_version_if_enabled<'a, T>(
        conn: &mut PgConn,
        id: T,
    ) -> DbResult<(Self, ObConfiguration, Tenant)>
    where
        T: Into<PlaybookIdentifier<'a>>,
    {
        let (playbook, obc, tenant) = Self::get_latest_version(conn, id)?;
        // n.b. playbook-wide (all version) disabled status is not implemented yet.
        if obc.status == ApiKeyStatus::Disabled {
            return Err(DbError::PlaybookDisabled);
        }
        Ok((playbook, obc, tenant))
    }
}
