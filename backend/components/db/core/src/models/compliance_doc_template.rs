use super::compliance_doc_template_version::{
    ComplianceDocTemplateVersion,
    NewComplianceDocTemplateVersion,
};
use crate::{
    DbResult,
    PgConn,
    TxnPgConn,
};
use chrono::{
    DateTime,
    Utc,
};
use db_schema::schema::{
    compliance_doc_template,
    compliance_doc_template_version,
};
use diesel::prelude::*;
use newtypes::{
    ComplianceDocTemplateId,
    Locked,
    PartnerTenantId,
};

#[derive(Debug, Clone, Queryable, Selectable, Identifiable)]
#[diesel(table_name = compliance_doc_template)]
pub struct ComplianceDocTemplate {
    pub id: ComplianceDocTemplateId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub partner_tenant_id: PartnerTenantId,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = compliance_doc_template)]
pub struct NewComplianceDocTemplate<'a> {
    pub partner_tenant_id: &'a PartnerTenantId,
}

impl<'a> NewComplianceDocTemplate<'a> {
    #[tracing::instrument("NewComplianceDocTemplate::create", skip_all)]
    pub fn create(self, conn: &mut TxnPgConn) -> DbResult<Locked<ComplianceDocTemplate>> {
        let template = diesel::insert_into(compliance_doc_template::table)
            .values(self)
            .get_result(conn.conn())?;

        Ok(Locked::new(template))
    }
}

impl ComplianceDocTemplate {
    #[tracing::instrument("ComplianceDocTemplate::lock", skip_all)]
    pub fn lock(
        conn: &mut TxnPgConn,
        id: &ComplianceDocTemplateId,
        pt_id: &PartnerTenantId,
    ) -> DbResult<Locked<ComplianceDocTemplate>> {
        let template = compliance_doc_template::table
            .filter(compliance_doc_template::id.eq(id))
            .filter(compliance_doc_template::partner_tenant_id.eq(pt_id))
            .filter(compliance_doc_template::deactivated_at.is_null())
            .for_no_key_update()
            .first(conn.conn())?;

        Ok(Locked::new(template))
    }

    // Require a lock on the template since two concurrent updates could result in multiple active
    // versions for a single template, which would trigger a DB constraint violation.
    #[tracing::instrument("ComplianceDocTemplate::create_new_version", skip_all)]
    pub fn create_new_version(
        conn: &mut TxnPgConn,
        template: &Locked<Self>,
        version: NewComplianceDocTemplateVersion,
    ) -> DbResult<ComplianceDocTemplateVersion> {
        diesel::update(compliance_doc_template_version::table)
            .filter(compliance_doc_template_version::template_id.eq(&template.id))
            .filter(compliance_doc_template_version::deactivated_at.is_null())
            .set(compliance_doc_template_version::deactivated_at.eq(Some(Utc::now())))
            .execute(conn.conn())?;

        Ok(diesel::insert_into(compliance_doc_template_version::table)
            .values(version)
            .get_result(conn.conn())?)
    }

    #[tracing::instrument("ComplianceDocTemplate::list_active_with_latest_version", skip_all)]
    pub fn list_active_with_latest_version(
        conn: &mut PgConn,
        pt_id: &PartnerTenantId,
    ) -> DbResult<Vec<(ComplianceDocTemplate, ComplianceDocTemplateVersion)>> {
        Ok(compliance_doc_template::table
            .inner_join(compliance_doc_template_version::table)
            .filter(compliance_doc_template::partner_tenant_id.eq(pt_id))
            .filter(compliance_doc_template::deactivated_at.is_null())
            .filter(compliance_doc_template_version::deactivated_at.is_null())
            .order((
                compliance_doc_template_version::created_at,
                compliance_doc_template_version::id,
            ))
            .select((
                ComplianceDocTemplate::as_select(),
                ComplianceDocTemplateVersion::as_select(),
            ))
            .load(conn)?)
    }

    #[tracing::instrument("ComplianceDocTemplate::deactivate", skip_all)]
    pub fn deactivate(
        conn: &mut TxnPgConn,
        id: &ComplianceDocTemplateId,
        pt_id: &PartnerTenantId,
    ) -> DbResult<()> {
        // Deactivate template.
        diesel::update(compliance_doc_template::table)
            .filter(compliance_doc_template::id.eq(id))
            .filter(compliance_doc_template::partner_tenant_id.eq(pt_id))
            .filter(compliance_doc_template::deactivated_at.is_null())
            .set(compliance_doc_template::deactivated_at.eq(Some(Utc::now())))
            .execute(conn.conn())?;

        // Deactivate all versions.
        diesel::update(compliance_doc_template_version::table)
            .filter(compliance_doc_template_version::template_id.eq(id))
            .filter(compliance_doc_template_version::deactivated_at.is_null())
            .set(compliance_doc_template_version::deactivated_at.eq(Some(Utc::now())))
            .execute(conn.conn())?;

        Ok(())
    }
}
