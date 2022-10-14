use crate::auth::tenant::SecretTenantAuthContext;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::State;

use chrono::{DateTime, Utc};
use db::models::tenant_api_key::TenantApiKey;
use newtypes::secret_api_key::SecretApiKey;
use paperclip::actix::{api_v2_operation, get, web, web::Json};

#[api_v2_operation(description = "Checks that the api key is OK", tags(Organization, PublicApi))]
#[get("/org/api_keys/check")]
async fn get(
    _state: web::Data<State>,
    auth: SecretTenantAuthContext,
) -> actix_web::Result<Json<ResponseData<api_wire_types::SecretApiKey>>, ApiError> {
    let response = api_wire_types::SecretApiKey::from_db((auth.api_key().clone(), None, Some(Utc::now())));
    Ok(Json(ResponseData::ok(response)))
}

type DbTenantApiKey = (TenantApiKey, Option<SecretApiKey>, Option<DateTime<Utc>>);

impl DbToApi<DbTenantApiKey> for api_wire_types::SecretApiKey {
    fn from_db(s: (TenantApiKey, Option<SecretApiKey>, Option<DateTime<Utc>>)) -> Self {
        let TenantApiKey {
            id,
            name,
            status,
            created_at,
            is_live,
            ..
        } = s.0;
        Self {
            id,
            name,
            is_live,
            key: s.1,
            created_at,
            status,
            last_used_at: s.2,
        }
    }
}
