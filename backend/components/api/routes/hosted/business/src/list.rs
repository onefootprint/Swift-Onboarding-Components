use crate::State;
use api_core::auth::user::UserAuthContext;
use api_core::errors::ValidationError;
use api_core::types::ApiListResponse;
use api_core::utils::db2api::DbToApi;
use api_core::utils::vault_wrapper::bulk_decrypt;
use api_core::utils::vault_wrapper::BulkDecryptReq;
use api_core::utils::vault_wrapper::Business;
use api_core::utils::vault_wrapper::DecryptAuditEventInfo;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::FpResult;
use api_wire_types::business::HostedBusiness;
use db::models::business_owner::BusinessOwner;
use newtypes::BusinessDataKind as BDK;
use newtypes::DataIdentifier as DI;
use newtypes::UserAuthScope;
use paperclip::actix;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use std::collections::HashMap;

#[api_v2_operation(
    description = "Get information about the businesses owned by the authenticated user",
    tags(Businesses, Hosted)
)]
#[actix::get("/hosted/businesses")]
pub async fn get(state: web::Data<State>, user_auth: UserAuthContext) -> ApiListResponse<HostedBusiness> {
    let user_auth = user_auth.check_guard(UserAuthScope::SignUp)?;
    let uv_id = user_auth.user.id.clone();
    let tenant = (user_auth.tenant.as_ref()).ok_or(ValidationError("Tenant is required"))?;
    let tenant_id = tenant.id.clone();

    let (bos, bvws) = state
        .db_query(move |conn| -> FpResult<_> {
            let bos = BusinessOwner::list_owned_businesses(conn, &uv_id, &tenant_id)?;
            let svs = bos.iter().map(|(_, sv, v)| (sv.clone(), v.clone())).collect();
            let bvws = VaultWrapper::<Business>::multi_get_for_tenant(conn, svs, None)?;
            Ok((bos, bvws))
        })
        .await?;

    let decrypt_name_reqs = bvws
        .iter()
        .map(|(sv_id, vw)| {
            let targets = vec![DI::Business(BDK::Name).into()];
            let req = BulkDecryptReq { vw, targets };
            (sv_id.clone(), req)
        })
        .collect();
    let audit_event = DecryptAuditEventInfo::NoAuditEvent;
    let mut results = bulk_decrypt(&state, decrypt_name_reqs, audit_event)
        .await?
        .into_iter()
        .collect::<HashMap<_, _>>();

    let results = bos
        .into_iter()
        .filter_map(|(bo, sb, _)| -> Option<_> {
            let name = results.remove(&sb.id)?.remove(&BDK::Name.into())?;
            let name = name.to_piistring().ok()?;
            Some((bo, sb, name))
        })
        .map(HostedBusiness::from_db)
        .collect();

    Ok(results)
}
