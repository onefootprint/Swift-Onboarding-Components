use crate::auth::custodian::CustodianAuthContext;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::State;
use db::models::tenant::Tenant;
use db::models::user_vault::UserVault;
use newtypes::{Fingerprinter, IdentityDataKind, TenantId};
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, post, web, web::Json};
use std::str::FromStr;

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
pub struct PhoneNumber {
    phone_number: newtypes::PhoneNumber,
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
    request: web::Json<PhoneNumber>,
) -> actix_web::Result<Json<ResponseData<CleanupResponse>>, ApiError> {
    // allowed deletion #s
    let allowed_deletion_numbers: Vec<newtypes::PhoneNumber> = vec![
        "16504600700",    // belce
        "14259844138",    // elliott
        "16178408644",    // alex
        "16173839084",    // alex2
        "+5548988124050", // rafa
        "16106807897",    // eli
        "+5561999771150", // pedro
        "+15045007931",   // omar
        "+18434698223",   // karen
        "+16319027727",   // dave
        "+16787644785",   // keagan
    ]
    .into_iter()
    .map(newtypes::PhoneNumber::from_str)
    .collect::<Result<Vec<_>, _>>()?;

    let requested_number = request.phone_number.clone();

    let is_integration_test_phone_number = requested_number == state.config.integration_test_phone_number
        || requested_number.leak().split('#').next()
            == Some(state.config.integration_test_phone_number.leak());
    let is_allowlisted_real_phone_number = allowed_deletion_numbers.contains(&requested_number);

    if !(is_integration_test_phone_number || is_allowlisted_real_phone_number) {
        return Err(ApiError::AssertionError(
            "Cannot clean up provided number".to_owned(),
        ));
    }
    let twilio_client = &state.twilio_client;
    let phone_number = twilio_client.standardize(&requested_number).await?;
    let sh_data = state
        .compute_fingerprint(IdentityDataKind::PhoneNumber, phone_number.to_piistring())
        .await?;

    let uv = state
        .db_pool
        .db_query(|conn| UserVault::find_portable(conn, sh_data))
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
            UserVault::lock(conn, &user_vault_id)?;

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

            let num_deleted_rows = db::private_cleanup_integration_tests(conn, &user_vault_id)?;
            Ok(num_deleted_rows)
        })
        .await?;

    Ok(Json(ResponseData::ok(CleanupResponse { num_deleted_rows })))
}
