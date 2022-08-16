use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::session_data::workos::WorkOsSession;
use crate::auth::Either;
use crate::auth::HasTenant;
use crate::auth::IsLive;
use crate::types::address::ApiAddress;
use crate::types::response::ApiResponseData;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use crate::{auth::SessionContext, errors::ApiError};
use newtypes::FootprintUserId;
use paperclip::actix::{api_v2_operation, get, web, web::Json};

type ListResponse<D> = Vec<ApiAddress<D>>;

#[api_v2_operation(tags(PublicApi))]
#[get("/addresses")]
/// Allows a tenant to view a customer's audit trail
fn get(
    state: web::Data<State>,
    fp_user_id: web::Path<FootprintUserId>,
    auth: Either<SessionContext<WorkOsSession>, SecretTenantAuthContext>,
) -> actix_web::Result<Json<ApiResponseData<ListResponse<bool>>>, ApiError> {
    let tenant = auth.tenant(&state.db_pool).await?;
    let is_live = auth.is_live(&state.db_pool).await?;

    let (uvw, _) = state
        .db_pool
        .db_query(move |conn| UserVaultWrapper::from_fp_user_id(conn, &fp_user_id, &tenant.id, is_live))
        .await??;
    let serialize = |x| ApiAddress::serialize(x, |i| i.is_some());
    let response = uvw.addresses.into_iter().map(serialize).collect::<Vec<_>>();
    Ok(Json(ApiResponseData::ok(response)))
}
