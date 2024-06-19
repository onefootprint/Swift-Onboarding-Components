use crate::ProtectedAuth;
use actix_web::web::Json;
use actix_web::{
    post,
    web,
};
use api_core::decision::vendor::samba::license_validation::CreateOrderContext;
use api_core::errors::ApiResult;
use api_core::types::JsonApiResponse;
use api_core::{
    decision,
    State,
};
use db::models::decision_intent::DecisionIntent;
use db::models::scoped_vault::{
    ScopedVault,
    ScopedVaultIdentifier,
};
use newtypes::samba::SambaLicenseValidationData;
use newtypes::{
    DecisionIntentKind,
    FpId,
};

#[derive(Debug, serde::Deserialize)]
pub struct CreateSambaOrderRequest {
    pub fp_id: FpId,
    pub data: Option<SambaLicenseValidationData>,
}
#[post("/private/protected/samba/create_order")]
pub async fn create_samba_order(
    state: web::Data<State>,
    _: ProtectedAuth,
    request: Json<CreateSambaOrderRequest>,
) -> JsonApiResponse<api_wire_types::Empty> {
    let CreateSambaOrderRequest { fp_id, data } = request.into_inner();

    let di = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, ScopedVaultIdentifier::SuperAdminView { identifier: &fp_id })?;
            // TODO: prevent people from re-running this over and over
            let di = DecisionIntent::create(conn, DecisionIntentKind::ManualRunKyc, &sv.id, None)?;
            Ok(di)
        })
        .await?;

    decision::vendor::samba::license_validation::run_samba_create_order(
        &state,
        CreateOrderContext::Adhoc { di, data },
    )
    .await?;

    Ok(api_wire_types::Empty)
}
