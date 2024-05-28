use actix_web::{patch, web};
use api_core::{
    auth::protected_auth::ProtectedAuth,
    errors::ApiResult,
    types::{JsonApiResponse, ResponseData},
    utils::db2api::DbToApi,
    State,
};
use api_wire_types::PrivateUpdateBillingProfile;
use db::models::{
    billing_profile::{BillingProfile, UpdateBillingProfile},
    tenant::{PrivateUpdateTenant, Tenant},
};
use newtypes::TenantId;

#[patch("/private/tenants/{id}")]
async fn patch(
    state: web::Data<State>,
    _: ProtectedAuth,
    id: web::Path<TenantId>,
    request: web::Json<api_wire_types::PrivatePatchTenant>,
) -> JsonApiResponse<api_wire_types::PrivateTenantDetail> {
    let id = id.into_inner();
    let request = request.into_inner();

    let (tenant, bp) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let tenant = Tenant::private_get(conn, &id)?;
            // In absence of a real update log, will just add a log line
            tracing::info!(?request, ?tenant, "Updating tenant info");

            let (update, bp_update) = make_tenant_update(request);
            let tenant = Tenant::private_update(conn, &id, update)?;
            let bp = if let Some(bp_update) = bp_update {
                let bp = BillingProfile::update_or_create(conn, &tenant.id, bp_update)?;
                Some(bp)
            } else {
                BillingProfile::get(conn, &tenant.id)?
            };
            Ok((tenant, bp))
        })
        .await?;

    let response = api_wire_types::PrivateTenantDetail::from_db((tenant, bp));
    ResponseData::ok(response).json()
}

fn make_tenant_update(
    req: api_wire_types::PrivatePatchTenant,
) -> (PrivateUpdateTenant, Option<UpdateBillingProfile>) {
    let api_wire_types::PrivatePatchTenant {
        name,
        domains,
        allow_domain_access,
        sandbox_restricted,
        is_prod_kyc_playbook_restricted,
        is_prod_kyb_playbook_restricted,
        is_prod_auth_playbook_restricted,
        allowed_preview_apis,
        is_demo_tenant,
        super_tenant_id,
        billing_profile,
    } = req;
    let update = PrivateUpdateTenant {
        name,
        domains,
        allow_domain_access,
        sandbox_restricted,
        is_prod_ob_config_restricted: is_prod_kyc_playbook_restricted,
        is_prod_kyb_playbook_restricted,
        is_prod_auth_playbook_restricted,
        allowed_preview_apis,
        is_demo_tenant,
        super_tenant_id,
    };
    let billing_profile = billing_profile.map(make_billing_profile_update);
    (update, billing_profile)
}

fn make_billing_profile_update(request: PrivateUpdateBillingProfile) -> UpdateBillingProfile {
    let PrivateUpdateBillingProfile {
        kyc,
        one_click_kyc,
        kyc_waterfall_second_vendor,
        kyc_waterfall_third_vendor,
        id_docs,
        kyb,
        pii,
        hot_vaults,
        hot_proxy_vaults,
        vaults_with_non_pci,
        vaults_with_pci,
        watchlist,
        adverse_media_per_user,
        continuous_monitoring_per_year,
        monthly_minimum,
    } = request;
    UpdateBillingProfile {
        kyc: kyc.to_changeset(),
        one_click_kyc: one_click_kyc.to_changeset(),
        kyc_waterfall_second_vendor: kyc_waterfall_second_vendor.to_changeset(),
        kyc_waterfall_third_vendor: kyc_waterfall_third_vendor.to_changeset(),
        id_docs: id_docs.to_changeset(),
        kyb: kyb.to_changeset(),
        pii: pii.to_changeset(),
        hot_vaults: hot_vaults.to_changeset(),
        hot_proxy_vaults: hot_proxy_vaults.to_changeset(),
        vaults_with_non_pci: vaults_with_non_pci.to_changeset(),
        vaults_with_pci: vaults_with_pci.to_changeset(),
        watchlist: watchlist.to_changeset(),
        adverse_media_per_user: adverse_media_per_user.to_changeset(),
        continuous_monitoring_per_year: continuous_monitoring_per_year.to_changeset(),
        monthly_minimum: monthly_minimum.to_changeset(),
    }
}
