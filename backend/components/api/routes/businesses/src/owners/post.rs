use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantApiKeyGated;
use api_core::auth::tenant::TenantGuard;
use api_core::types::ApiResponse;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::vault_wrapper::Business;
use api_core::utils::vault_wrapper::DataRequestSource;
use api_core::utils::vault_wrapper::FingerprintedDataRequest;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::FpResult;
use api_core::State;
use api_errors::BadRequestInto;
use api_errors::FpErrorCode;
use api_wire_types::NewBusinessOwnerRequest;
use db::models::business_owner::BusinessOwner;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::Vault;
use newtypes::preview_api;
use newtypes::DataRequest;
use newtypes::VaultKind;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web;

#[api_v2_operation(
    description = "Link an existing fp_id to the provided business as a beneficial owner.",
    tags(Businesses, Preview, HideWhenLocked)
)]
#[post("/businesses/{fp_bid}/owners")]
pub async fn post(
    state: web::Data<State>,
    fp_bid: FpIdPath,
    auth: TenantApiKeyGated<preview_api::CreateBusinessOwner>,
    request: web::Json<NewBusinessOwnerRequest>,
) -> ApiResponse<api_wire_types::Empty> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let actor = auth.actor();
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_bid = fp_bid.into_inner();
    let NewBusinessOwnerRequest {
        fp_id,
        ownership_stake,
    } = request.into_inner();

    let ownership_stake_u32: u32 = match ownership_stake.try_into() {
        Ok(stake) if (0..=100).contains(&stake) => FpResult::Ok(stake),
        _ => BadRequestInto("ownership_stake must be between 0 and 100"),
    }?;

    state
        .db_transaction(move |conn| {
            let sb = ScopedVault::lock(conn, (&fp_bid, &tenant_id, is_live))?;
            let bvw = VaultWrapper::<Business>::lock_for_onboarding(conn, &sb.id)?;
            if sb.kind != VaultKind::Business {
                return BadRequestInto("Provided fp_bid does not correspond to a business");
            }

            let bv = Vault::get(conn, &sb.vault_id)?;
            if !bv.is_created_via_api {
                return BadRequestInto(
                    "Provided business was created by onboarding onto a playbook. Business owners are managed automatically by the playbook, so they cannot be mutated.",
                );
            }

            let owner_su = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            if owner_su.kind != VaultKind::Person {
                return BadRequestInto("Provided fp_id does not correspond to a person");
            }

            let result = BusinessOwner::create_tenant_api(conn, sb, owner_su.vault_id);
            let bo = match result {
                Ok(bo) => bo,
                Err(e) if e.code() == Some(FpErrorCode::DbUniqueConstraintViolation) => {
                    return BadRequestInto("The provided user is already an owner of the provided business");
                }
                Err(e) => return Err(e),
            };

            // Record the beneficial owner's ownership stake on the business vault.
            let request = DataRequest::empty().into_beneficial_owner_data(&bo.link_id, Some(ownership_stake_u32))?;
            let request = FingerprintedDataRequest::manual_fingerprints(request, vec![]);
            bvw.patch_data(conn, request, DataRequestSource::TenantPatchVault(actor))?;

            Ok(())
        })
        .await?;

    Ok(api_wire_types::Empty)
}
