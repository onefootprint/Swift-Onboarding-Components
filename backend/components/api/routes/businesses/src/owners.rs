use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::auth::Either;
use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;
use crate::State;
use api_core::errors::business::BusinessError;
use api_core::errors::ApiResult;
use api_core::utils::db2api::DbToApi;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_wire_types::BusinessOwner as ApiBusinessOwner;
use db::models::business_owner::BusinessOwner;
use db::models::scoped_vault::ScopedVault;
use newtypes::BusinessDataKind as BDK;
use newtypes::BusinessOwnerData;
use newtypes::FpId;
use newtypes::KycedBusinessOwnerData;
use paperclip::actix::{api_v2_operation, get, web};
use std::iter::repeat;

type BusinessOwnerListResponse = Vec<ApiBusinessOwner>;

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
            Ok((vw, bos))
        })
        .await??;

    //
    // This is complex - we have two places where we store BOs: colloquially the "vault" and the "DB."
    //  - "vault" BOs are collected during bifrost and are stored under either BDK::BeneficialOwners
    //    or BDK::KycedBeneficialOwners, depending on whether the BOs will be KYCed.
    //  - "DB" BOs exist in the BusinessOwner table inside the DB. Every BO row in the DB represents
    //    a fully-KYCed BO (or a BO that must be fully KYCed to complete KYB)
    //

    // Fetch the "vault" BOs
    let dis = &[BDK::BeneficialOwners.into(), BDK::KycedBeneficialOwners.into()];
    let mut decrypted = vw.decrypt_unchecked(&state.enclave_client, dis).await?;
    let vault_bos = decrypted.remove(&BDK::BeneficialOwners.into());
    let vault_kyced_bos = decrypted.remove(&BDK::KycedBeneficialOwners.into());

    // Zip the "vault" and "DB" BOs depending on which kind of "vault" BOs exist
    let results: Vec<_> = match (vault_bos, vault_kyced_bos) {
        // Non-kyced BOs in the vault
        (Some(vault_bos), None) => {
            if bos.len() > 1 {
                return Err(BusinessError::TooManyBos.into());
            }
            let vault_bos: Vec<BusinessOwnerData> = vault_bos.deserialize()?;
            let ownership: Vec<_> = vault_bos.into_iter().map(|bo| bo.ownership_stake).collect();
            zip_max_n(ownership, bos).collect()
        }
        // KYCed BOs in the vault
        (None, Some(kyced_bos)) => {
            let kyced_bos: Vec<KycedBusinessOwnerData> = kyced_bos.deserialize()?;
            kyced_bos
                .into_iter()
                .map(|vault_bo| {
                    let ownership_stake = Some(vault_bo.ownership_stake);
                    let bo = bos.iter().find(|bo| bo.0.link_id == vault_bo.link_id).cloned();
                    (ownership_stake, bo)
                })
                .collect()
        }
        // No BOs in the vault - this only happens for incomplete onboardings where the BO in the DB
        // exists but the user abandoned before providing info on each BO in the vault
        (None, None) => {
            if bos.len() > 1 {
                return Err(BusinessError::TooManyBos.into());
            }
            zip_max_n(vec![], bos).collect()
        }
        (Some(_), Some(_)) => {
            return Err(BusinessError::KycedAndNonKycedBos.into());
        }
    };

    let results = results.into_iter().map(ApiBusinessOwner::from_db).collect();
    ResponseData::ok(results).json()
}

/// Pad two arrays with None values to the max length of each and zip them together.
fn zip_max_n<T: Clone, U: Clone>(a: Vec<T>, b: Vec<U>) -> impl Iterator<Item = (Option<T>, Option<U>)> {
    let max_n = std::cmp::max(a.len(), b.len());
    let a = a.into_iter().map(Some).chain(repeat(None)).take(max_n);
    let b = b.into_iter().map(Some).chain(repeat(None)).take(max_n);
    a.into_iter().zip(b)
}
