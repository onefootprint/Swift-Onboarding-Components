use crate::{ProtectedAuth, State};
use actix_web::web;
use actix_web::web::Json;
use actix_web::{get, patch};
use api_core::enclave_client::DecryptReq;
use api_core::errors::{ApiResult, AssertionError};
use api_core::types::JsonApiResponse;
use api_core::types::{EmptyResponse, ResponseData};
use db::models::tenant::Tenant;
use db::models::tenant_business_info::NewBusinessInfo;
use db::models::tenant_business_info::TenantBusinessInfo;
use newtypes::PiiString;
use newtypes::TenantId;

#[derive(serde::Deserialize)]
pub struct UpdateBusinessInfoRequest {
    company_name: PiiString,
    address_line1: PiiString,
    city: PiiString,
    state: PiiString,
    zip: PiiString,
    phone: PiiString,
}

#[derive(serde::Serialize)]
pub struct BusinessInfoResponse {
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

#[derive(PartialEq, Eq, Hash)]
enum BusinessInfoField {
    CompanyName,
    AddressLine1,
    City,
    State,
    Zip,
    Phone,
}

#[get("/private/protected/org/{tenant_id}/business_info")]
pub async fn get_business_info(
    state: web::Data<State>,
    _: ProtectedAuth,
    path: web::Path<TenantId>,
) -> JsonApiResponse<BusinessInfoResponse> {
    let (private_key, tbi) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let tenant = Tenant::get(conn, &path.into_inner())?;
            let tbi = TenantBusinessInfo::get(conn, &tenant.id)?;
            Ok((tenant.e_private_key, tbi))
        })
        .await?;

    let encryped_fields = vec![
        (BusinessInfoField::CompanyName, tbi.company_name),
        (BusinessInfoField::AddressLine1, tbi.address_line1),
        (BusinessInfoField::City, tbi.city),
        (BusinessInfoField::State, tbi.state),
        (BusinessInfoField::Zip, tbi.zip),
        (BusinessInfoField::Phone, tbi.phone),
    ];
    let sealed_data = encryped_fields
        .iter()
        .map(|(bif, bytes)| (bif, DecryptReq(&private_key, bytes, vec![])))
        .collect();

    let decrypted_fields = state
        .enclave_client
        .batch_decrypt_to_piistring(sealed_data)
        .await?;

    ResponseData::ok(BusinessInfoResponse {
        company_name: decrypted_fields
            .get(&BusinessInfoField::CompanyName)
            .ok_or(AssertionError("Missing decrypt field: CompanyName"))?
            .clone(),
        address_line1: decrypted_fields
            .get(&BusinessInfoField::AddressLine1)
            .ok_or(AssertionError("Missing decrypt field: AddressLine1"))?
            .clone(),
        city: decrypted_fields
            .get(&BusinessInfoField::City)
            .ok_or(AssertionError("Missing decrypt field: City"))?
            .clone(),
        state: decrypted_fields
            .get(&BusinessInfoField::State)
            .ok_or(AssertionError("Missing decrypt field: State"))?
            .clone(),
        zip: decrypted_fields
            .get(&BusinessInfoField::Zip)
            .ok_or(AssertionError("Missing decrypt field: Zip"))?
            .clone(),
        phone: decrypted_fields
            .get(&BusinessInfoField::Phone)
            .ok_or(AssertionError("Missing decrypt field: Phone"))?
            .clone(),
    })
    .json()
}
