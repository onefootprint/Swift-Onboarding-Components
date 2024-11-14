use crate::ProtectedAuth;
use actix_web::post;
use actix_web::web;
use actix_web::web::Json;
use api_core::decision::vendor::samba::create_order;
use api_core::types::ApiResponse;
use api_core::State;
use db::models::decision_intent::DecisionIntent;
use db::models::scoped_vault::ScopedVault;
use db::models::scoped_vault::ScopedVaultIdentifier;
use newtypes::samba::SambaData;
use newtypes::samba::SambaOrderKind;
use newtypes::DecisionIntentKind;
use newtypes::FpId;

#[derive(Debug, serde::Deserialize)]
pub struct CreateSambaOrderRequest {
    pub fp_id: FpId,
    pub data: Option<SambaData>,
    pub kind: SambaOrderKind,
}
#[post("/private/protected/samba/create_order")]
pub async fn create_samba_order(
    state: web::Data<State>,
    _: ProtectedAuth,
    request: Json<CreateSambaOrderRequest>,
) -> ApiResponse<api_wire_types::Empty> {
    let CreateSambaOrderRequest { fp_id, data, kind } = request.into_inner();

    let di = state
        .db_query(move |conn| {
            let sv = ScopedVault::get(conn, ScopedVaultIdentifier::SuperAdminView { identifier: &fp_id })?;
            // TODO: prevent people from re-running this over and over
            let di = DecisionIntent::create(conn, DecisionIntentKind::ManualRunKyc, &sv.id, None)?;
            Ok(di)
        })
        .await?;

    create_order::run_samba_create_order(
        &state,
        create_order::CreateOrderContext::Adhoc { di, data },
        kind,
        None,
    )
    .await?;

    Ok(api_wire_types::Empty)
}
