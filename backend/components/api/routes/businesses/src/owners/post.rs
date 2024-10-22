use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantApiKeyGated;
use api_core::auth::tenant::TenantGuard;
use api_core::errors::ValidationError;
use api_core::types::ApiResponse;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::vault_wrapper::Any;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::FpResult;
use api_core::State;
use api_wire_types::NewBusinessOwnerRequest;
use db::models::business_owner::BusinessOwner;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::Vault;
use db::DbError;
use newtypes::preview_api;
use newtypes::BusinessDataKind as BDK;
use newtypes::DataIdentifier as DI;
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
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_bid = fp_bid.into_inner();
    let NewBusinessOwnerRequest {
        fp_id,
        ownership_stake,
    } = request.into_inner();

    if !(0..=100).contains(&ownership_stake) {
        return ValidationError("ownership_stake must be between 0 and 100").into();
    }

    state
        .db_transaction(move |conn| -> FpResult<_> {
            let sb = ScopedVault::lock(conn, (&fp_bid, &tenant_id, is_live))?;
            if sb.kind != VaultKind::Business {
                return ValidationError("Provided fp_bid does not correspond to a business").into();
            }

            let bv = Vault::get(conn, &sb.vault_id)?;
            if !bv.is_created_via_api {
                return ValidationError(
                    "Provided business was created by onboarding onto a playbook. Business owners are managed automatically by the playbook, so they cannot be mutated.",
                )
                .into();
            }

            let owner_su = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            if owner_su.kind != VaultKind::Person {
                return ValidationError("Provided fp_id does not correspond to a person").into();
            }

            let bvw = VaultWrapper::<Any>::build_for_tenant(conn, &sb.id)?;
            if let Some(disallowed_di) = bvw.populated_dis().iter().find(|di| matches!(di, DI::Business(BDK::BeneficialOwners) | DI::Business(BDK::KycedBeneficialOwners) | DI::Business(BDK::BeneficialOwnerData(_, _)))) {
                let err_str = format!("Business already has vaulted BOs. If you'd like to link a user as the beneficial owner of this business, please clear out {}", disallowed_di);
                return ValidationError(&err_str).into();
            }

            let result = BusinessOwner::create_tenant_api(conn, sb, owner_su.vault_id, ownership_stake);
            match result {
                Ok(_) => (),
                Err(DbError::UniqueConstraintViolation(_)) => {
                    return ValidationError("The provided user is already an owner of the provided business")
                        .into()
                }
                Err(e) => return Err(e.into()),
            }
            Ok(())
        })
        .await?;

    Ok(api_wire_types::Empty)
}
