use std::str::FromStr;

use crate::{
    auth::user::UserAuthGuard,
    errors::ApiResult,
    types::{EmptyResponse, JsonApiResponse},
    utils::vault_wrapper::{Business, VaultWrapper},
    State,
};
use api_core::{
    auth::{user::UserWfAuthContext, AuthError},
    errors::{business::BusinessError, AssertionError},
    types::ResponseData,
    utils::vault_wrapper::{Person, TenantVw},
    ApiErrorKind,
};
use db::models::{business_owner::BusinessOwner, scoped_vault::ScopedVault};
use newtypes::{
    put_data_request::{PatchDataRequest, RawDataRequest},
    BusinessDataKind as BDK, BusinessOwnerKind, DataLifetimeSource, KycedBusinessOwnerData, PiiJsonValue,
    ScopedVaultId, ValidateArgs, WorkflowGuard,
};
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(
    description = "Checks if provided vault data is valid before adding it to the business vault",
    tags(Businesses, Hosted, Vault)
)]
#[actix::post("/hosted/business/vault/validate")]
pub async fn post_validate(
    state: web::Data<State>,
    user_auth: UserWfAuthContext,
    request: Json<RawDataRequest>,
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::SignUp)?;
    user_auth.check_workflow_guard(WorkflowGuard::AddData)?;
    let mut request = request.into_inner();
    let sb_id = user_auth.scoped_business_id().ok_or(AuthError::MissingBusiness)?;
    if let Some(kyced_bos) = request.remove(&BDK::KycedBeneficialOwners.into()) {
        let new_kyced_bos = augment_bos(&state, sb_id.clone(), kyced_bos).await?;
        request.insert(BDK::KycedBeneficialOwners.into(), new_kyced_bos);
    }

    let PatchDataRequest { updates, .. } =
        request.clean_and_validate(ValidateArgs::for_bifrost(user_auth.scoped_user.is_live))?;
    let updates = updates.no_fingerprints_for_validation(); // No fingerprints to check speculatively

    state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let bvw: TenantVw<Business> = VaultWrapper::build_for_tenant(conn, &sb_id)?;
            updates.assert_allowable_identifiers(bvw.vault.kind)?;
            bvw.validate_request(conn, updates, None, false)?;
            Ok(())
        })
        .await?;

    EmptyResponse::ok().json()
}

#[api_v2_operation(
    description = "Updates data in a business vault. Can be used to update `business.` data",
    tags(Businesses, Hosted, Vault)
)]
#[actix::patch("/hosted/business/vault")]
pub async fn patch(
    state: web::Data<State>,
    request: Json<RawDataRequest>,
    user_auth: UserWfAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::SignUp)?;
    user_auth.check_workflow_guard(WorkflowGuard::AddData)?;
    let sb_id = user_auth.scoped_business_id().ok_or(AuthError::MissingBusiness)?;

    let mut request = request.into_inner();
    if let Some(kyced_bos) = request.remove(&BDK::KycedBeneficialOwners.into()) {
        let new_kyced_bos = augment_bos(&state, sb_id.clone(), kyced_bos).await?;
        request.insert(BDK::KycedBeneficialOwners.into(), new_kyced_bos);
    }

    let PatchDataRequest { updates, .. } =
        request.clean_and_validate(ValidateArgs::for_bifrost(user_auth.scoped_user.is_live))?;
    let tenant_id = &user_auth.tenant().id;
    let updates = updates
        .build_fingerprints(&state.enclave_client, tenant_id)
        .await?;

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let bvw = VaultWrapper::<Business>::lock_for_onboarding(conn, &sb_id)?;
            bvw.patch_data(conn, updates, DataLifetimeSource::Hosted, None)?;
            Ok(())
        })
        .await?;

    ResponseData::ok(EmptyResponse {}).json()
}

/// Given a serialized list of KycedBos, replaces the primary BO's phone and email with the
/// provided scoped business's primary BO's phone and email.
/// This is some crazy logic needed to properly validate KYCed BOs since the client does not always
/// know the primary BO's phone and email to send along
async fn augment_bos(
    state: &State,
    sb_id: ScopedVaultId,
    kyced_bos: PiiJsonValue,
) -> ApiResult<PiiJsonValue> {
    use newtypes::{email::Email, IdentityDataKind as IDK, PhoneNumber};

    // If we are about to vault KycedBos, we should also fetch the primary BO's contact info to
    // make sure we don't make secondary BOs with the same phone number
    let pbo_vw = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let sb = ScopedVault::get(conn, &sb_id)?;
            // Find the primary BO - it is not necessarily the authed user
            let primary_bo = BusinessOwner::list(conn, &sb.vault_id, &sb.tenant_id)?
                .into_iter()
                .find(|bo| bo.0.kind == BusinessOwnerKind::Primary)
                .ok_or(AssertionError("Primary BO not found"))?;
            let primary_bo_sv = primary_bo.1.ok_or(AssertionError("Primary BO has no SV"))?;
            let vw = VaultWrapper::<Person>::build_for_tenant(conn, &primary_bo_sv.0.id)?;
            Ok(vw)
        })
        .await?;

    // Decrypt the phone and email from the primary BO's vault and strip their sandbox suffix
    let dis = vec![IDK::PhoneNumber.into(), IDK::Email.into()];
    let mut decrypted = pbo_vw.decrypt_unchecked(&state.enclave_client, &dis).await?;
    let phone_number = decrypted
        .remove(&IDK::PhoneNumber.into())
        .ok_or(ApiErrorKind::NoPhoneNumberForVault)?;
    let phone_number = PhoneNumber::parse(phone_number)?;
    let email = decrypted
        .remove(&IDK::Email.into())
        .ok_or(BusinessError::PrimaryBoHasNoEmail)?;
    let email = Email::from_str(email.leak())?;

    // Augment the request to include the primary BO's email and phone number
    type Bo = KycedBusinessOwnerData<Option<()>, Option<Email>, Option<PhoneNumber>>;
    let old_bos = kyced_bos.deserialize_maybe_str::<Vec<Bo>>()?;
    let new_bos: Vec<Bo> = old_bos
        .into_iter()
        .enumerate()
        .map(|(i, mut bo)| {
            // Replace the primary BO's phone number and email with the phone and email from the
            // primary BO's vault
            if i == 0 {
                bo.phone_number = Some(phone_number.clone());
                bo.email = Some(email.clone());
            }
            bo
        })
        .collect();

    let new_kyced_bos = PiiJsonValue::new(serde_json::to_value(new_bos)?);
    Ok(new_kyced_bos)
}
