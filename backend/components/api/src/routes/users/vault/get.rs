use crate::auth::tenant::{CanDecrypt, CheckTenantGuard, SecretTenantAuthContext};
use crate::auth::{tenant::TenantSessionAuth, Either};
use crate::errors::tenant::TenantError;
use crate::types::{JsonApiResponse, ResponseData};
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::{errors::ApiError, State};
use actix_web::web::Query;
use db::models::scoped_user::ScopedUser;
use itertools::Itertools;
use newtypes::csv::Csv;
use newtypes::flat_api_object_map_type;
use newtypes::{DataIdentifier, FootprintUserId};
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{self, api_v2_operation, web, web::Path};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema)]
pub struct FieldsParams {
    /// Comma separated list of fields to check. For example, `id.first_name,id.ssn4,custom.bank_account`
    #[openapi(example = "id.last_name, custom.ach_account, id.dob, id.ssn9")]
    fields: Csv<DataIdentifier>,
}

flat_api_object_map_type!(
    GetUnifiedResponse<DataIdentifier, bool>,
    description="A key-value map of identifier to whether the identifier exists in the vault",
    example=r#"{ "id.last_name": "smith", "id.ssn9": "121121212", "custom.credit_card": "1234 1234 1234 1234" }"#
);

#[api_v2_operation(
    description = "Given a list of fields, checks for their existence in the vault without decrypting them.",
    tags(Vault, PublicApi, Users)
)]
#[actix::get("/users/{footprint_user_id}/vault")]
pub async fn get(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Query<FieldsParams>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> JsonApiResponse<GetUnifiedResponse> {
    let footprint_user_id = path.into_inner();

    let request = request.into_inner();
    let FieldsParams { fields } = request;
    let fields = fields.clone().into_iter().collect_vec();

    if fields
        .iter()
        .any(|f| matches!(f, DataIdentifier::IdDocument(_) | DataIdentifier::Selfie(_)))
    {
        return Err(TenantError::CannotDecryptDocument.into());
    }

    let auth = auth.check_guard(CanDecrypt::new(fields.clone()))?;
    let is_live = auth.is_live()?;
    let tenant_id = auth.tenant().id.clone();

    let uvw = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let scoped_user = ScopedUser::get(conn, (&footprint_user_id, &tenant_id, is_live))?;
            let uvw = UserVaultWrapper::build_for_tenant(conn, &scoped_user.id)?;
            Ok(uvw)
        })
        .await??;

    let results = uvw.get_populated_values(&fields)?;
    let results = HashMap::from_iter(fields.into_iter().map(|di| (di.clone(), results.contains(&di))));
    let out = GetUnifiedResponse { map: results };

    ResponseData::ok(out).json()
}
