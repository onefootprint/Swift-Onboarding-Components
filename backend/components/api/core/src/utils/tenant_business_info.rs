use crate::enclave_client::DecryptReq;
use crate::enclave_client::EnclaveClient;
use crate::errors::ApiResult;
use crate::errors::AssertionError;
use db::models::tenant::Tenant;
use db::models::tenant_business_info::TenantBusinessInfo;

#[derive(PartialEq, Eq, Hash)]
enum BusinessInfoField {
    CompanyName,
    AddressLine1,
    City,
    State,
    Zip,
    Phone,
}

pub async fn decrypt_tenant_business_info(
    enclave_client: &EnclaveClient,
    tenant: &Tenant,
    tbi: &TenantBusinessInfo,
) -> ApiResult<newtypes::TenantBusinessInfo> {
    let private_key = tenant.e_private_key.clone();
    let encryped_fields = [
        (BusinessInfoField::CompanyName, tbi.company_name.clone()),
        (BusinessInfoField::AddressLine1, tbi.address_line1.clone()),
        (BusinessInfoField::City, tbi.city.clone()),
        (BusinessInfoField::State, tbi.state.clone()),
        (BusinessInfoField::Zip, tbi.zip.clone()),
        (BusinessInfoField::Phone, tbi.phone.clone()),
    ];
    let sealed_data = encryped_fields
        .iter()
        .map(|(bif, bytes)| (bif, DecryptReq(&private_key, bytes, vec![])))
        .collect();

    let decrypted_fields = enclave_client.batch_decrypt_to_piistring(sealed_data).await?;

    Ok(newtypes::TenantBusinessInfo {
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
}
