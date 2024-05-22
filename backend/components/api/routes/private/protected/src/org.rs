use crate::{ProtectedAuth, State};
use actix_web::{get, patch, web, web::Json};
use api_core::{
    errors::ApiResult,
    types::{EmptyResponse, JsonApiResponse, ResponseData},
    utils,
};
use db::models::{
    tenant::{Tenant, UpdateTenantLiveMode},
    tenant_business_info::{NewBusinessInfo, TenantBusinessInfo},
    tenant_vendor::TenantVendorControl,
};
use newtypes::{PiiString, TenantId};

#[derive(serde::Deserialize)]
pub struct UpdateBusinessInfoRequest {
    company_name: PiiString,
    address_line1: PiiString,
    city: PiiString,
    state: PiiString,
    zip: PiiString,
    phone: PiiString,
}

#[patch("/private/protected/org/{tenant_id}/business_info")]
pub async fn update_business_info(
    state: web::Data<State>,
    _: ProtectedAuth,
    path: web::Path<TenantId>,
    request: Json<UpdateBusinessInfoRequest>,
) -> JsonApiResponse<EmptyResponse> {
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let tenant = Tenant::get(conn, &path.into_inner())?;
            // TODO: could apply validations we use for bifrost address/phone here
            let UpdateBusinessInfoRequest {
                company_name,
                address_line1,
                city,
                state,
                zip,
                phone,
            } = request.into_inner();

            let _tbi = TenantBusinessInfo::create(
                conn,
                &tenant.id,
                NewBusinessInfo {
                    company_name: tenant.public_key.seal_bytes(company_name.leak().as_bytes())?,
                    address_line1: tenant.public_key.seal_bytes(address_line1.leak().as_bytes())?,
                    city: tenant.public_key.seal_bytes(city.leak().as_bytes())?,
                    state: tenant.public_key.seal_bytes(state.leak().as_bytes())?,
                    zip: tenant.public_key.seal_bytes(zip.leak().as_bytes())?,
                    phone: tenant.public_key.seal_bytes(phone.leak().as_bytes())?,
                },
            )?;
            Ok(())
        })
        .await?;
    EmptyResponse::ok().json()
}

#[get("/private/protected/org/{tenant_id}/business_info")]
pub async fn get_business_info(
    state: web::Data<State>,
    _: ProtectedAuth,
    path: web::Path<TenantId>,
) -> JsonApiResponse<Option<newtypes::TenantBusinessInfo>> {
    let (tenant, tbi) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let tenant = Tenant::get(conn, &path.into_inner())?;
            let tbi = TenantBusinessInfo::get(conn, &tenant.id)?;
            Ok((tenant, tbi))
        })
        .await?;

    let tbi = if let Some(tbi) = tbi {
        Some(
            utils::tenant_business_info::decrypt_tenant_business_info(&state.enclave_client, &tenant, &tbi)
                .await?,
        )
    } else {
        None
    };
    ResponseData::ok(tbi).json()
}


#[derive(serde::Deserialize)]
pub struct UpdateTenantLiveModeRequest {
    is_live: bool,
    kyc_live: Option<bool>,
    kyb_live: Option<bool>,
    auth_live: Option<bool>,
    vendor_control: Option<UpdateTenantVendorControl>,
}

#[derive(serde::Deserialize)]
pub struct UpdateTenantVendorControl {
    idology_enabled: bool,
    lexis_enabled: bool,
    experian_enabled: bool,
    experian_subscriber_code: Option<String>,
    middesk_api_key: Option<PiiString>,
}

#[patch("/private/protected/org/{tenant_id}/live_mode")]
pub async fn update_tenant_live_mode(
    state: web::Data<State>,
    _: ProtectedAuth,
    path: web::Path<TenantId>,
    request: Json<UpdateTenantLiveModeRequest>,
) -> JsonApiResponse<EmptyResponse> {
    let request = request.into_inner();

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let tenant = Tenant::get(conn, &path.into_inner())?;
            let _ = tenant.private_update_live_mode(
                conn,
                UpdateTenantLiveMode {
                    sandbox_restricted: Some(!request.is_live),
                    is_prod_ob_config_restricted: request.kyc_live.map(|b| !b),
                    is_prod_kyb_playbook_restricted: request.kyb_live.map(|b| !b),
                    is_prod_auth_playbook_restricted: request.auth_live.map(|b| !b),
                },
            )?;

            if let Some(UpdateTenantVendorControl {
                idology_enabled,
                lexis_enabled,
                experian_enabled,
                experian_subscriber_code,
                middesk_api_key,
            }) = request.vendor_control
            {
                let _ = TenantVendorControl::create(
                    conn,
                    tenant.id,
                    idology_enabled,
                    experian_enabled,
                    lexis_enabled,
                    experian_subscriber_code,
                    middesk_api_key
                        .map(|key| tenant.public_key.seal_bytes(key.leak().as_bytes()))
                        .transpose()?,
                )?;
            }
            Ok(())
        })
        .await?;
    EmptyResponse::ok().json()
}
