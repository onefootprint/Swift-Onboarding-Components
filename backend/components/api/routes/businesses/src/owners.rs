use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::auth::Either;
use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;
use crate::State;
use api_core::errors::ApiResult;
use api_core::utils::db2api::DbToApi;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::ApiError;
use db::models::business_owner::BusinessOwner;
use db::models::scoped_vault::ScopedVault;
use newtypes::BusinessDataKind;
use newtypes::BusinessOwnerData;
use newtypes::DataIdentifier;
use newtypes::FpId;
use newtypes::PiiString;
use paperclip::actix::{api_v2_operation, get, web};

type BusinessOwnerListResponse = Vec<api_wire_types::BusinessOwner>;

#[api_v2_operation(
    description = "Gets the beneficial owners of a business.",
    tags(Entities, Preview)
)]
#[get("/businesses/{fp_id}/owners")]
pub async fn get(
    state: web::Data<State>,
    fp_id: web::Path<FpId>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> JsonApiResponse<BusinessOwnerListResponse> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();

    let (vw, bos) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let vw = VaultWrapper::build_for_tenant(conn, &sv.id)?;
            let bos = sv
                .ob_configuration_id
                .as_ref()
                // Non-portable vaults don't have any BOs
                .map(|ob_config_id| BusinessOwner::list(conn, &sv.vault_id, ob_config_id))
                .transpose()?
                .unwrap_or_default();
            if bos.len() > 1 {
                // Before we support this, we need to have a way to map a BusinessOwner row in the
                // DB to one of the serialized BusinessOwnerData objects in the vault
                return Err(ApiError::AssertionError(
                    "Not allowed to have multiple BOs yet".to_owned(),
                ));
            }
            Ok((vw, bos))
        })
        .await??;

    // Fetch the information on BeneficialOwners from the business's vault
    let di = DataIdentifier::from(BusinessDataKind::BeneficialOwners);
    let bos_str = vw
        .decrypt_unchecked(&state.enclave_client, &[di.clone()])
        .await?
        .remove(&di)
        .unwrap_or_else(|| PiiString::from("[]"));
    let bo_data: Vec<BusinessOwnerData> = serde_json::de::from_str(bos_str.leak())?;
    let results = bo_data
        .into_iter()
        // Zip bo_data from vault with BusinessOwner data from DB.
        // Eventually, we'll need a smarter way of mapping bo_data from vault to the BusinessOwners from the DB
        .zip(bos.into_iter().map(|(_, sv)| Some(sv)).chain(std::iter::repeat(None)))
        .map(api_wire_types::BusinessOwner::from_db)
        .collect();

    ResponseData::ok(results).json()
}
