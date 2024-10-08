use crate::DbResult;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::tenant_vendor_control;
use diesel::ExpressionMethods;
use diesel::Insertable;
use diesel::OptionalExtension;
use diesel::QueryDsl;
use diesel::Queryable;
use diesel::RunQueryDsl;
use newtypes::SealedVaultBytes;
use newtypes::SentilinkTenantVendorControlCredentials;
use newtypes::TenantId;
use newtypes::TenantVendorControlId;

#[derive(Debug, Clone, Queryable, PartialEq, Eq)]
#[diesel(table_name = tenant_vendor_control)]
pub struct TenantVendorControl {
    pub id: TenantVendorControlId,
    pub tenant_id: TenantId,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub idology_enabled: bool,
    pub experian_enabled: bool,
    pub experian_subscriber_code: Option<String>,
    pub middesk_api_key: Option<SealedVaultBytes>,
    pub lexis_enabled: bool,
    pub sentilink_credentials: Option<SentilinkTenantVendorControlCredentials>,
    pub neuro_enabled: bool,
}

#[derive(Debug, Clone, Queryable, Insertable)]
#[diesel(table_name = tenant_vendor_control)]
struct NewTenantVendorControl<'a> {
    tenant_id: &'a TenantId,
    idology_enabled: bool,
    experian_enabled: bool,
    experian_subscriber_code: Option<String>,
    middesk_api_key: Option<SealedVaultBytes>,
    lexis_enabled: bool,
    neuro_enabled: bool,
}

#[derive(Default)]
pub struct UpdateTenantVendorControlArgs {
    pub idology_enabled: Option<bool>,
    pub experian_enabled: Option<bool>,
    pub experian_subscriber_code: Option<Option<String>>,
    pub middesk_api_key: Option<Option<SealedVaultBytes>>,
    pub lexis_enabled: Option<bool>,
    pub neuro_enabled: Option<bool>,
}

impl TenantVendorControl {
    #[tracing::instrument("TenantVendorControl::update_or_create", skip_all)]
    pub fn update_or_create(
        conn: &mut TxnPgConn,
        tenant_id: &TenantId,
        args: UpdateTenantVendorControlArgs,
    ) -> DbResult<Self> {
        // TVC is a create-new-and-deactivate-old model, so let's overlay the update args over the
        // existing TVC, if any
        let existing = Self::get(conn, tenant_id)?;

        #[derive(Default)]
        struct ExistingArgs {
            idology_enabled: bool,
            experian_enabled: bool,
            lexis_enabled: bool,
            experian_subscriber_code: Option<String>,
            middesk_api_key: Option<SealedVaultBytes>,
            neuro_enabled: bool,
        }
        let existing = if let Some(existing) = existing {
            ExistingArgs {
                idology_enabled: existing.idology_enabled,
                experian_enabled: existing.experian_enabled,
                lexis_enabled: existing.lexis_enabled,
                experian_subscriber_code: existing.experian_subscriber_code,
                middesk_api_key: existing.middesk_api_key,
                neuro_enabled: existing.neuro_enabled,
            }
        } else {
            ExistingArgs::default()
        };

        // Deactivate the existing TVC, if any
        diesel::update(tenant_vendor_control::table)
            .filter(tenant_vendor_control::tenant_id.eq(tenant_id))
            .set(tenant_vendor_control::deactivated_at.eq(Utc::now()))
            .execute(conn.conn())?;

        // Create the new TVC that's a function of the update args and existing TVC
        let new = NewTenantVendorControl {
            tenant_id,
            idology_enabled: args.idology_enabled.unwrap_or(existing.idology_enabled),
            experian_enabled: args.experian_enabled.unwrap_or(existing.experian_enabled),
            lexis_enabled: args.lexis_enabled.unwrap_or(existing.lexis_enabled),
            experian_subscriber_code: args
                .experian_subscriber_code
                .unwrap_or(existing.experian_subscriber_code),
            middesk_api_key: args.middesk_api_key.unwrap_or(existing.middesk_api_key),
            neuro_enabled: args.neuro_enabled.unwrap_or(existing.neuro_enabled),
        };
        let tvc = diesel::insert_into(tenant_vendor_control::table)
            .values(new)
            .get_result(conn.conn())?;

        Ok(tvc)
    }

    #[tracing::instrument("TenantVendorControl::get", skip_all)]
    pub fn get(conn: &mut PgConn, tenant_id: &TenantId) -> Result<Option<Self>, crate::DbError> {
        let control: Option<Self> = tenant_vendor_control::table
            .filter(tenant_vendor_control::tenant_id.eq(tenant_id))
            .filter(tenant_vendor_control::deactivated_at.is_null())
            .order_by(tenant_vendor_control::_created_at.desc())
            .first(conn)
            .optional()?;
        Ok(control)
    }
}

#[cfg(test)]
mod test {
    use crate::models::tenant_vendor::TenantVendorControl;
    use crate::models::tenant_vendor::UpdateTenantVendorControlArgs;
    use crate::tests::prelude::*;
    use macros::db_test;
    use newtypes::SealedVaultBytes;
    use newtypes::TenantId;

    #[db_test]
    fn test_update_tvc(conn: &mut TestPgConn) {
        let tenant_id = TenantId::test_data("org_xxx".into());
        let middesk_api_key = SealedVaultBytes(vec![1, 2, 3]);

        // First, create the TVC with some defaults
        let args = UpdateTenantVendorControlArgs {
            idology_enabled: Some(true),
            experian_enabled: Some(true),
            lexis_enabled: Some(false),
            middesk_api_key: Some(Some(middesk_api_key.clone())),
            ..Default::default()
        };
        let tvc = TenantVendorControl::update_or_create(conn, &tenant_id, args).unwrap();
        assert!(tvc.idology_enabled);
        assert!(tvc.experian_enabled);
        assert!(!tvc.lexis_enabled);
        assert!(tvc.experian_subscriber_code.is_none());
        assert_eq!(tvc.middesk_api_key.as_ref(), Some(&middesk_api_key));

        // Then, update the TVC. We should overlay the patch request over the existing TVC
        let args = UpdateTenantVendorControlArgs {
            idology_enabled: Some(false),
            middesk_api_key: Some(Some(middesk_api_key.clone())),
            ..Default::default()
        };
        let tvc = TenantVendorControl::update_or_create(conn, &tenant_id, args).unwrap();
        assert!(!tvc.idology_enabled);
        assert!(tvc.experian_enabled);
        assert!(!tvc.lexis_enabled);
        assert!(tvc.experian_subscriber_code.is_none());
        assert_eq!(tvc.middesk_api_key.as_ref(), Some(&middesk_api_key));

        // And one more update to clear out middesk api key
        let args = UpdateTenantVendorControlArgs {
            middesk_api_key: Some(None),
            ..Default::default()
        };
        let tvc = TenantVendorControl::update_or_create(conn, &tenant_id, args).unwrap();
        assert!(tvc.middesk_api_key.is_none());
        // Other properties didn't change
        assert!(!tvc.idology_enabled);
        assert!(tvc.experian_enabled);
        assert!(!tvc.lexis_enabled);
        assert!(tvc.experian_subscriber_code.is_none());
    }
}
