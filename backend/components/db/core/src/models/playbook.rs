use super::ob_configuration::IsLive;
use super::ob_configuration::NewObConfigurationArgs;
use super::ob_configuration::ObConfiguration;
use super::tenant::Tenant;
use crate::DbError;
use crate::PgConn;
use crate::TxnPgConn;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::ob_configuration;
use db_schema::schema::playbook;
use db_schema::schema::tenant;
use diesel::prelude::*;
use diesel::sql_types::Bool;
use diesel::Queryable;
use newtypes::ApiKeyStatus;
use newtypes::Locked;
use newtypes::ObConfigurationId;
use newtypes::PlaybookId;
use newtypes::PublishablePlaybookKey;
use newtypes::TenantId;

/// A Playbook row groups together all versions of an ObConfiguration across edits.
#[derive(Debug, Clone, Queryable, Selectable)]
#[diesel(table_name = playbook)]
pub struct Playbook {
    pub id: PlaybookId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub key: PublishablePlaybookKey,
    pub tenant_id: TenantId,
    pub is_live: IsLive,
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
    Id(&'a PlaybookId),
    TenantId {
        id: &'a PlaybookId,
        tenant_id: &'a TenantId,
        is_live: bool,
    },
    TenantObcId {
        obc_id: &'a ObConfigurationId,
        tenant_id: &'a TenantId,
        is_live: bool,
    },
    Key(&'a PublishablePlaybookKey),
    TenantKey {
        key: &'a PublishablePlaybookKey,
        tenant_id: &'a TenantId,
        is_live: bool,
    },
}

impl<'a> PlaybookIdentifier<'a> {
    pub fn filter<'b, QS>(&self) -> Box<dyn BoxableExpression<QS, diesel::pg::Pg, SqlType = Bool> + 'b>
    where
        ob_configuration::id: SelectableExpression<QS>,
        playbook::id: SelectableExpression<QS>,
        playbook::tenant_id: SelectableExpression<QS>,
        playbook::is_live: SelectableExpression<QS>,
        playbook::key: SelectableExpression<QS>,
    {
        match self {
            PlaybookIdentifier::Id(id) => Box::new(playbook::id.eq((*id).clone())),
            PlaybookIdentifier::TenantId {
                id,
                tenant_id,
                is_live,
            } => Box::new(
                playbook::id
                    .eq((*id).clone())
                    .and(playbook::tenant_id.eq((*tenant_id).clone()))
                    .and(playbook::is_live.eq(*is_live)),
            ),
            PlaybookIdentifier::TenantObcId {
                obc_id,
                tenant_id,
                is_live,
            } => Box::new(
                ob_configuration::id
                    .eq((*obc_id).clone())
                    .and(playbook::tenant_id.eq((*tenant_id).clone()))
                    .and(playbook::is_live.eq(*is_live)),
            ),
            PlaybookIdentifier::Key(key) => Box::new(playbook::key.eq((*key).clone())),
            PlaybookIdentifier::TenantKey {
                key,
                tenant_id,
                is_live,
            } => Box::new(
                playbook::key
                    .eq((*key).clone())
                    .and(playbook::tenant_id.eq((*tenant_id).clone()))
                    .and(playbook::is_live.eq(*is_live)),
            ),
        }
    }
}


#[derive(Default, AsChangeset)]
#[diesel(table_name = playbook)]
pub struct PlaybookUpdate {
    pub status: Option<ApiKeyStatus>,
}


impl Playbook {
    #[tracing::instrument("Playbook::create", skip_all)]
    pub fn create(
        conn: &mut TxnPgConn,
        tenant_id: &TenantId,
        is_live: IsLive,
        obc_args: NewObConfigurationArgs,
    ) -> FpResult<(Locked<Self>, ObConfiguration)> {
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

    #[tracing::instrument("Playbook::get", skip_all)]
    pub fn get<'a, T>(conn: &mut PgConn, id: T) -> FpResult<Self>
    where
        T: Into<PlaybookIdentifier<'a>>,
    {
        let id: PlaybookIdentifier = id.into();

        let result = playbook::table
            .inner_join(ob_configuration::table)
            .filter(id.filter())
            .select(Playbook::as_select())
            .get_result(conn)?;
        Ok(result)
    }

    #[tracing::instrument("Playbook::lock", skip_all)]
    pub fn lock<'a, T>(conn: &mut TxnPgConn, id: T) -> FpResult<Locked<Self>>
    where
        T: Into<PlaybookIdentifier<'a>>,
    {
        let id: PlaybookIdentifier = id.into();

        let result = playbook::table
            .inner_join(ob_configuration::table)
            .filter(id.filter())
            .for_no_key_update()
            .select(Playbook::as_select())
            .get_result(conn.conn())?;

        Ok(Locked::new(result))
    }

    /// Gets the latest version (active) OBC for a given playbook.
    #[tracing::instrument("Playbook::get_latest_version", skip_all)]
    pub fn get_latest_version<'a, T>(conn: &mut PgConn, id: T) -> FpResult<(Self, ObConfiguration, Tenant)>
    where
        T: Into<PlaybookIdentifier<'a>>,
    {
        let id: PlaybookIdentifier = id.into();

        let result = ob_configuration::table
            .inner_join(playbook::table.inner_join(tenant::table))
            .filter(id.filter())
            .filter(ob_configuration::deactivated_at.is_null())
            .select((
                playbook::all_columns,
                ob_configuration::all_columns,
                tenant::all_columns,
            ))
            .first(conn)?;
        Ok(result)
    }

    /// Gets the latest version (active) OBC for a given playbook, but returns an error if the
    /// playbook is disabled.
    #[tracing::instrument("Playbook::get_latest_version_if_enabled", skip_all)]
    pub fn get_latest_version_if_enabled<'a, T>(
        conn: &mut PgConn,
        id: T,
    ) -> FpResult<(Self, ObConfiguration, Tenant)>
    where
        T: Into<PlaybookIdentifier<'a>>,
    {
        let (playbook, obc, tenant) = Self::get_latest_version(conn, id)?;
        if playbook.status == ApiKeyStatus::Disabled {
            return Err(DbError::PlaybookDisabled.into());
        }
        Ok((playbook, obc, tenant))
    }

    #[tracing::instrument("Playbook::update", skip_all)]
    pub fn update(
        conn: &mut TxnPgConn,
        // Consume since Playbook may become outdated.
        playbook: Locked<Self>,
        update: PlaybookUpdate,
    ) -> FpResult<Locked<Self>> {
        let result: Self = diesel::update(playbook::table)
            .filter(playbook::id.eq(&playbook.id))
            .set(update)
            .get_result(conn.conn())?;
        Ok(Locked::new(result))
    }
}
