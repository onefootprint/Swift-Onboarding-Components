use actix_web::{
    patch,
    web,
};
use api_core::auth::protected_auth::ProtectedAuth;
use api_core::errors::ApiResult;
use api_core::types::ModernApiResult;
use api_core::utils::db2api::DbToApi;
use api_core::State;
use api_wire_types::{
    PrivateUpdateBillingProfile,
    PrivateUpdateTvc,
};
use db::models::billing_profile::{
    BillingProfile,
    UpdateBillingProfile,
};
use db::models::tenant::{
    PrivateUpdateTenant,
    Tenant,
};
use db::models::tenant_vendor::{
    TenantVendorControl,
    UpdateTenantVendorControlArgs,
};
use newtypes::TenantId;

#[patch("/private/tenants/{id}")]
async fn patch(
    state: web::Data<State>,
    _: ProtectedAuth,
    id: web::Path<TenantId>,
    request: web::Json<api_wire_types::PrivatePatchTenant>,
) -> ModernApiResult<api_wire_types::PrivateTenantDetail> {
    let id = id.into_inner();
    let request = request.into_inner();

    let tenant_info = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
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
) -> ApiResult<(
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
    let billing_profile = billing_profile.map(make_billing_profile_update);
    let vendor_control = vendor_control
        .map(|tvc| make_tvc_update(tenant, tvc))
        .transpose()?;
    Ok((update, billing_profile, vendor_control))
}

fn make_billing_profile_update(request: PrivateUpdateBillingProfile) -> UpdateBillingProfile {
    let PrivateUpdateBillingProfile {
        kyc,
        one_click_kyc,
        kyc_waterfall_second_vendor,
        kyc_waterfall_third_vendor,
        id_docs,
        kyb,
        curp_verification,
        pii,
        hot_vaults,
        hot_proxy_vaults,
        vaults_with_non_pci,
        vaults_with_pci,
        watchlist,
        adverse_media_per_user,
        continuous_monitoring_per_year,
        monthly_minimum,
        monthly_platform_fee,
    } = request;
    UpdateBillingProfile {
        kyc: kyc.to_changeset(),
        one_click_kyc: one_click_kyc.to_changeset(),
        kyc_waterfall_second_vendor: kyc_waterfall_second_vendor.to_changeset(),
        kyc_waterfall_third_vendor: kyc_waterfall_third_vendor.to_changeset(),
        id_docs: id_docs.to_changeset(),
        kyb: kyb.to_changeset(),
        pii: pii.to_changeset(),
        curp_verification: curp_verification.to_changeset(),
        hot_vaults: hot_vaults.to_changeset(),
        hot_proxy_vaults: hot_proxy_vaults.to_changeset(),
        vaults_with_non_pci: vaults_with_non_pci.to_changeset(),
        vaults_with_pci: vaults_with_pci.to_changeset(),
        watchlist: watchlist.to_changeset(),
        adverse_media_per_user: adverse_media_per_user.to_changeset(),
        continuous_monitoring_per_year: continuous_monitoring_per_year.to_changeset(),
        monthly_minimum: monthly_minimum.to_changeset(),
        monthly_platform_fee: monthly_platform_fee.to_changeset(),
    }
}

fn make_tvc_update(tenant: &Tenant, request: PrivateUpdateTvc) -> ApiResult<UpdateTenantVendorControlArgs> {
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
