use crate::PgConn;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::twilio_message_log;
use diesel::prelude::*;
use diesel::Insertable;
use diesel::Queryable;
use newtypes::TenantId;
use newtypes::TwilioMessageLogId;
use newtypes::VaultId;

#[derive(Debug, Clone, Queryable, Insertable)]
#[diesel(table_name = twilio_message_log)]
pub struct TwilioMessageLog {
    pub id: TwilioMessageLogId,
    pub created_at: DateTime<Utc>,
    pub updated_at: Option<DateTime<Utc>>,
    pub message_id: String,
    pub account_sid: String,
    pub tenant_id: Option<TenantId>,
    pub vault_id: Option<VaultId>,
    pub status: String,
    pub error: Option<String>,
}


impl TwilioMessageLog {
    /// Updates the status and error of a Twilio message log if it exists, otherwise creates a new
    /// one. interestingly webhook callbacks can sometimes fire before we even write the log
    /// so we intellgiently resolve conflicts
    #[tracing::instrument(name = "TwilioMessageLog::update_or_create", skip(conn))]
    pub fn update_or_create(
        conn: &mut PgConn,
        message_id: String,
        account_sid: String,
        status: String,
        error: Option<String>,
    ) -> FpResult<()> {
        let updated_at = Utc::now();

        diesel::insert_into(twilio_message_log::table)
            .values((
                twilio_message_log::message_id.eq(&message_id),
                twilio_message_log::account_sid.eq(&account_sid),
                twilio_message_log::status.eq(Some(&status)),
                twilio_message_log::error.eq(error.as_ref()),
                twilio_message_log::created_at.eq(updated_at),
                twilio_message_log::updated_at.eq(Some(updated_at)),
            ))
            .on_conflict(twilio_message_log::message_id)
            .do_update()
            .set((
                twilio_message_log::status.eq(Some(&status)),
                twilio_message_log::error.eq(error.as_ref()),
                twilio_message_log::updated_at.eq(Some(updated_at)),
            ))
            .execute(conn)?;
        Ok(())
    }
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = twilio_message_log)]
pub struct NewTwilioMessageLog {
    message_id: String,
    account_sid: String,
    tenant_id: Option<TenantId>,
    vault_id: Option<VaultId>,
    status: String,
    error: Option<String>,
    created_at: DateTime<Utc>,
}

impl NewTwilioMessageLog {
    /// Inserts a new Twilio message log into the database
    /// if one already exists -- it came from the webhook faster than we stored it
    /// so we just update it with relevent fields
    #[tracing::instrument(name = "NewTwilioMessageLog::update_or_create", skip(conn))]
    pub fn update_or_create(
        conn: &mut PgConn,
        message_id: String,
        account_sid: String,
        tenant_id: Option<TenantId>,
        vault_id: Option<VaultId>,
        status: String,
        error: Option<String>,
    ) -> FpResult<()> {
        let created_at = Utc::now();

        let log = NewTwilioMessageLog {
            message_id,
            account_sid,
            tenant_id,
            vault_id,
            status,
            error,
            created_at,
        };

        diesel::insert_into(twilio_message_log::table)
            .values(&log)
            .on_conflict(twilio_message_log::message_id)
            .do_update()
            .set((
                twilio_message_log::created_at.eq(&log.created_at),
                twilio_message_log::tenant_id.eq(&log.tenant_id),
                twilio_message_log::vault_id.eq(&log.vault_id),
            ))
            .execute(conn)?;
        Ok(())
    }
}
