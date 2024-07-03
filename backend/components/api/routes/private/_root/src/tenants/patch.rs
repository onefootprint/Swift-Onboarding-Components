use actix_web::patch;
use actix_web::web;
use api_core::auth::protected_auth::ProtectedAuth;
use api_core::types::ApiResponse;
use api_core::utils::db2api::DbToApi;
use api_core::FpResult;
use api_core::State;
use api_wire_types::PrivateUpdateTvc;
use db::models::billing_profile::BillingProfile;
use db::models::billing_profile::UpdateBillingProfile;
use db::models::tenant::PrivateUpdateTenant;
use db::models::tenant::Tenant;
use db::models::tenant_vendor::TenantVendorControl;
use db::models::tenant_vendor::UpdateTenantVendorControlArgs;
use newtypes::TenantId;

#[patch("/private/tenants/{id}")]
async fn patch(
    state: web::Data<State>,
    _: ProtectedAuth,
    id: web::Path<TenantId>,
    request: web::Json<api_wire_types::PrivatePatchTenant>,
) -> ApiResponse<api_wire_types::PrivateTenantDetail> {
    let id = id.into_inner();
    let request = request.into_inner();

    let tenant_info = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let (tenant, bp, tvc) = Tenant::private_get(conn, &id)?;
            // In absence of a real update log, will just add a log line
            tracing::info!(?request, ?tenant, ?bp, ?tvc, "Updating tenant info");

            let (update, bp_update, tvc_update) = make_tenant_update(&tenant, request)?;
            let tenant = Tenant::private_update(conn, &id, update)?;
            let bp = if let Some(bp_update) = bp_update {
                let bp = BillingProfile::update_or_create(conn, &tenant.id, bp_update)?;
                Some(bp)
            } else {
                bp
            };
            let tvc = if let Some(tvc_update) = tvc_update {
                let bp = TenantVendorControl::update_or_create(conn, &tenant.id, tvc_update)?;
                Some(bp)
            } else {
                tvc
            };
            Ok((tenant, bp, tvc))
        })
        .await?;

    let response = api_wire_types::PrivateTenantDetail::from_db(tenant_info);
    Ok(response)
}

fn make_tenant_update(
    tenant: &Tenant,
    req: api_wire_types::PrivatePatchTenant,
) -> FpResult<(
    PrivateUpdateTenant,
    Option<UpdateBillingProfile>,
    Option<UpdateTenantVendorControlArgs>,
)> {
    let api_wire_types::PrivatePatchTenant {
        name,
        domains,
        allow_domain_access,
        sandbox_restricted,
        is_prod_kyc_playbook_restricted,
        is_prod_kyb_playbook_restricted,
        is_prod_auth_playbook_restricted,
        supported_auth_methods,
        allowed_preview_apis,
        pinned_api_version,
        is_demo_tenant,
        super_tenant_id,
        billing_profile,
        vendor_control,
    } = req;
    let update = PrivateUpdateTenant {
        name,
        domains,
        allow_domain_access,
        sandbox_restricted,
        is_prod_ob_config_restricted: is_prod_kyc_playbook_restricted,
        is_prod_kyb_playbook_restricted,
        is_prod_auth_playbook_restricted,
        supported_auth_methods: supported_auth_methods.to_changeset(),
        allowed_preview_apis,
        pinned_api_version: pinned_api_version.to_changeset(),
        is_demo_tenant,
        super_tenant_id: super_tenant_id.to_changeset(),
    };
    let billing_profile =
        billing_profile.map(|bp| bp.0.into_iter().map(|(k, v)| (k, v.to_changeset())).collect());
    let vendor_control = vendor_control
        .map(|tvc| make_tvc_update(tenant, tvc))
        .transpose()?;
    Ok((update, billing_profile, vendor_control))
}

fn make_tvc_update(tenant: &Tenant, request: PrivateUpdateTvc) -> FpResult<UpdateTenantVendorControlArgs> {
    let PrivateUpdateTvc {
        idology_enabled,
        lexis_enabled,
        experian_enabled,
        experian_subscriber_code,
        middesk_api_key,
    } = request;
    let tvc = UpdateTenantVendorControlArgs {
        idology_enabled,
        lexis_enabled,
        experian_enabled,
        experian_subscriber_code: experian_subscriber_code.to_changeset(),
        middesk_api_key: middesk_api_key
            .map(|key| tenant.public_key.seal_bytes(key.leak().as_bytes()))
            .transpose()?
            .to_changeset(),
    };
    Ok(tvc)
}
