//! Get custom data from a user vault

use crate::auth::tenant::{SecretTenantAuthContext, TenantAuth};
use crate::errors::ApiResult;
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::utils::headers::InsightHeaders;
use crate::utils::user_vault_wrapper::{UserVaultWrapper, WriteableUvw};
use crate::{errors::ApiError, State};
use db::models::access_event::NewAccessEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_user::ScopedUser;
use db::TxnPgConnection;
use newtypes::{
    flat_api_object_map_type, AccessEventKind, DataIdentifier, FootprintUserId, KvDataKey, PiiString,
};
use paperclip::actix::{self, api_v2_operation, web, web::Json, web::Path};

flat_api_object_map_type!(
    PutCustomDataRequest<KvDataKey, PiiString>,
    description="Key-value map for data to store in the vault",
    example=r#"{ "ach_account_number": "1234567890", "cc_last_4": "4242" }"#
);

#[api_v2_operation(description = "Stores custom data.", tags(Users, PublicApi))]
#[actix::put("/users/{footprint_user_id}/vault/custom")]
pub async fn put(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Json<PutCustomDataRequest>,
    tenant_auth: SecretTenantAuthContext,
    insights: InsightHeaders,
) -> JsonApiResponse<EmptyResponse> {
    let footprint_user_id = path.into_inner();
    let tenant_id = tenant_auth.tenant().id.clone();
    let is_live = tenant_auth.is_live()?;
    let update = request.into_inner();
    let insight = CreateInsightEvent::from(insights);

    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let scoped_user = ScopedUser::get(conn, (&footprint_user_id, &tenant_id, is_live))?;
            let uvw = UserVaultWrapper::lock_for_onboarding(conn, &scoped_user.id)?;
            put_internal(conn, uvw, &tenant_auth, &scoped_user, insight, update)?;
            Ok(())
        })
        .await?;

    EmptyResponse::ok().json()
}

pub fn put_internal(
    conn: &mut TxnPgConnection,
    uvw: WriteableUvw,
    tenant_auth: &SecretTenantAuthContext,
    scoped_user: &ScopedUser,
    insight: CreateInsightEvent,
    update: PutCustomDataRequest,
) -> ApiResult<()> {
    // Create an AccessEvent log showing that the tenant updated these fields
    NewAccessEvent {
        scoped_user_id: scoped_user.id.clone(),
        reason: None,
        principal: tenant_auth.actor().into(),
        insight,
        kind: AccessEventKind::Update,
        targets: update.keys().cloned().map(DataIdentifier::Custom).collect(),
    }
    .create(conn)?;
    uvw.update_custom_data(conn, update.into())?;
    Ok(())
}
