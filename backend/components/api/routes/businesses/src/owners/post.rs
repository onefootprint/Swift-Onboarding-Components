use api_core::auth::tenant::{
    CheckTenantGuard,
    SecretTenantAuthContext,
    TenantGuard,
};
use api_core::errors::{
    ApiResult,
    ValidationError,
};
use api_core::types::ModernApiResult;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::vault_wrapper::{
    Any,
    VaultWrapper,
};
use api_core::State;
use api_wire_types::NewBusinessOwnerRequest;
use db::models::business_owner::BusinessOwner;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::Vault;
use newtypes::{
    BusinessDataKind as BDK,
    DataIdentifier as DI,
    PreviewApi,
    VaultKind,
};
use paperclip::actix::{
    api_v2_operation,
    post,
    web,
};

#[api_v2_operation(
    description = "Link an existing fp_id to the provided business as a beneficial owner.",
    tags(Businesses, Preview)
)]
#[post("/businesses/{fp_bid}/owners")]
pub async fn post(
    state: web::Data<State>,
    fp_bid: FpIdPath,
    auth: SecretTenantAuthContext,
    request: web::Json<NewBusinessOwnerRequest>,
) -> ModernApiResult<api_wire_types::Empty> {
    auth.check_preview_guard(PreviewApi::CreateBusinessOwner)?;
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
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
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
            for disallowed_di in [DI::Business(BDK::BeneficialOwners), DI::Business(BDK::KycedBeneficialOwners)] {
                if bvw.populated_dis().iter().any(|di| di == &disallowed_di) {
                    let err_str = format!("Business already has {} vaulted. If you'd like to link a user as the beneficial owner of this business, please clear out {}", disallowed_di, disallowed_di);
                    return ValidationError(&err_str).into();
                }
            }

            let result = BusinessOwner::create(conn, sb, owner_su.vault_id, ownership_stake);
            match result {
                Ok(_) => (),
                Err(e) if e.is_unique_constraint_violation() => {
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
