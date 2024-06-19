use crate::{
    ProtectedAuth,
    State,
};
use actix_web::web::Json;
use actix_web::{
    get,
    patch,
    web,
};
use api_core::errors::ApiResult;
use api_core::types::ModernApiResult;
use api_core::utils;
use db::models::tenant::Tenant;
use db::models::tenant_business_info::{
    NewBusinessInfo,
    TenantBusinessInfo,
};
use newtypes::{
    PiiString,
    TenantId,
};

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
) -> ModernApiResult<api_wire_types::Empty> {
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
    Ok(api_wire_types::Empty)
}

#[get("/private/protected/org/{tenant_id}/business_info")]
pub async fn get_business_info(
    state: web::Data<State>,
    _: ProtectedAuth,
    path: web::Path<TenantId>,
) -> ModernApiResult<Option<api_wire_types::TenantBusinessInfo>> {
    let (tenant, tbi) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let tenant = Tenant::get(conn, &path.into_inner())?;
            let tbi = TenantBusinessInfo::get(conn, &tenant.id)?;
            Ok((tenant, tbi))
        })
        .await?;

    let tbi = if let Some(tbi) = tbi {
        let tbi =
            utils::tenant_business_info::decrypt_tenant_business_info(&state.enclave_client, &tenant, &tbi)
                .await?;
        let newtypes::TenantBusinessInfo {
            company_name,
            address_line1,
            city,
            state,
            zip,
            phone,
        } = tbi;
        let tbi = api_wire_types::TenantBusinessInfo {
            company_name,
            address_line1,
            city,
            state,
            zip,
            phone,
        };
        Some(tbi)
    } else {
        None
    };
    Ok(tbi)
}
