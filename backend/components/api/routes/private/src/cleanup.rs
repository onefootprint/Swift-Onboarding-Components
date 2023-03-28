use crate::auth::custodian::CustodianAuthContext;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::State;
use db::models::tenant::Tenant;
use db::models::vault::Vault;
use newtypes::{Fingerprinter, IdentityDataKind, PhoneNumber, TenantId};
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, post, web, web::Json};
use std::str::FromStr;

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
pub struct Request {
    phone_number: PhoneNumber,
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct CleanupResponse {
    num_deleted_rows: usize,
}

#[api_v2_operation(
    description = "Private endpoint to clean up specific integration test user information.",
    tags(Private)
)]
#[post("/private/cleanup")]
async fn post(
    state: web::Data<State>,
    _custodian: CustodianAuthContext,
    request: web::Json<Request>,
) -> actix_web::Result<Json<ResponseData<CleanupResponse>>, ApiError> {
    // allowed deletion #s
    let allowed_deletion_numbers: Vec<newtypes::PhoneNumber> = vec![
        "+16504600700",   // belce
        "+14259844138",   // elliott
        "+16178408644",   // alex
        "+16173839084",   // alex2
        "+5548988124050", // rafa
        "+16106807897",   // eli
        "+5561999771150", // pedro
        "+18434698223",   // karen
        "+16319027727",   // dave
        "+16787644785",   // keagan
    ]
    .into_iter()
    .map(newtypes::PhoneNumber::from_str)
    .collect::<Result<Vec<_>, _>>()?;

    let Request { phone_number } = request.into_inner();

    // Use e164 without suffix to see if cleanup is allowed for this phone number
    let is_integration_test_phone_number =
        phone_number.e164() == state.config.integration_test_phone_number.e164();
    let is_allowlisted_real_phone_number = allowed_deletion_numbers
        .iter()
        .any(|x| x.e164() == phone_number.e164());

    if !(is_integration_test_phone_number || is_allowlisted_real_phone_number) {
        return Err(ApiError::AssertionError(
            "Cannot clean up provided number".to_owned(),
        ));
    }

    // Use e164 with suffix to compute fingerprint
    let idk = Box::new(IdentityDataKind::PhoneNumber);
    let sh_data = state
        .compute_fingerprint(idk, phone_number.e164_with_suffix())
        .await?;

    let uv = state
        .db_pool
        .db_query(|conn| Vault::find_portable(conn, sh_data))
        .await??;
    let user_vault_id = if let Some(uv) = uv {
        uv.id
    } else {
        return Ok(Json(ResponseData::ok(CleanupResponse { num_deleted_rows: 0 })));
    };

    let is_production = state.config.service_config.is_production();

    #[allow(clippy::unwrap_used)]
    let allowed_impacted_tenants: Vec<TenantId> = vec![
        "org_e2FHVfOM5Hd3Ce492o5Aat", // Footprint Live
        "org_hyZP3ksCvsT0AlLqMZsgrI", // Acme Inc.
    ]
    .into_iter()
    .map(|s| TenantId::from_str(s).unwrap())
    .collect();

    let num_deleted_rows = state
        .db_pool
        .db_transaction(move |conn| -> Result<usize, ApiError> {
            Vault::lock(conn, &user_vault_id)?;

            if is_production && is_allowlisted_real_phone_number {
                let impacted_tenants: Vec<Tenant> = Tenant::list_by_user_vault_id(conn, &user_vault_id)?;

                let unallowed_affected_tenants: Vec<String> = impacted_tenants
                    .into_iter()
                    .filter(|t| !allowed_impacted_tenants.contains(&t.id))
                    .map(|t| t.id.to_string())
                    .collect();

                if !unallowed_affected_tenants.is_empty() {
                    return Err(ApiError::AssertionError(format!(
                        "Clearing vault would have impacted tenants: {}",
                        unallowed_affected_tenants.join(",")
                    )));
                }
            }

            let num_deleted_rows = db::private_cleanup_integration_tests(conn, user_vault_id)?;
            Ok(num_deleted_rows)
        })
        .await?;

    Ok(Json(ResponseData::ok(CleanupResponse { num_deleted_rows })))
}
