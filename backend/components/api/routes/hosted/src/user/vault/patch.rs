use crate::errors::ApiResult;
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::utils::email::send_email_challenge;
use crate::utils::headers::AllowExtraFieldsHeaders;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_core::auth::user::{UserAuthGuard, UserObAuthContext};
use api_core::utils::vault_wrapper::{Any, TenantVw};
use db::models::document_request::{DocumentRequest, NewDocumentRequestArgs};
use newtypes::email::Email;
use newtypes::put_data_request::RawDataRequest;
use newtypes::{
    DataIdentifier, DataLifetimeSource, IdentityDataKind as IDK, Iso3166TwoDigitCountryCode, ValidateArgs,
    WorkflowGuard,
};
use paperclip::actix::{self, api_v2_operation, web, web::Json};
use std::str::FromStr;

#[api_v2_operation(
    description = "Checks if provided vault data is valid before adding it to the vault",
    tags(Hosted, Vault, Users)
)]
#[actix::post("/hosted/user/vault/validate")]
pub async fn post_validate(
    state: web::Data<State>,
    request: Json<RawDataRequest>,
    user_auth: UserObAuthContext,
    allow_extra_fields: AllowExtraFieldsHeaders,
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::SignUp)?;
    user_auth.check_workflow_guard(WorkflowGuard::AddData)?;
    let opts = ValidateArgs {
        ignore_luhn_validation: false,
        for_bifrost: true,
        allow_dangling_keys: *allow_extra_fields,
        is_live: user_auth.scoped_user.is_live,
    };
    let request = request.into_inner().clean_and_validate(opts)?;
    let request = request.no_fingerprints(); // No fingerprints to check speculatively
    let su_id = user_auth.data.scoped_user.id;
    let uvw: TenantVw = state
        .db_pool
        .db_query(move |conn| VaultWrapper::build_for_tenant(conn, &su_id))
        .await??;
    request.assert_allowable_identifiers(uvw.vault.kind)?;
    uvw.validate_request(request)?;

    EmptyResponse::ok().json()
}

#[api_v2_operation(
    description = "Updates data in a user vault. Same as PATCH",
    tags(Hosted, Vault, Users, Deprecated)
)]
#[actix::put("/hosted/user/vault")]
pub async fn put(
    state: web::Data<State>,
    request: Json<RawDataRequest>,
    user_auth: UserObAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    let result = patch_inner(state, request, user_auth).await?;
    Ok(result)
}

#[api_v2_operation(description = "Updates data in a user vault", tags(Hosted, Vault, Users))]
#[actix::patch("/hosted/user/vault")]
pub async fn patch(
    state: web::Data<State>,
    request: Json<RawDataRequest>,
    user_auth: UserObAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    let result = patch_inner(state, request, user_auth).await?;
    Ok(result)
}

async fn patch_inner(
    state: web::Data<State>,
    request: Json<RawDataRequest>,
    user_auth: UserObAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::SignUp)?;
    user_auth.check_workflow_guard(WorkflowGuard::AddData)?;
    let request = request
        .into_inner()
        .clean_and_validate(ValidateArgs::for_bifrost(user_auth.scoped_user.is_live))?;
    let is_fixture = user_auth.user().is_fixture;
    let tenant_id = user_auth.tenant()?.id.clone();
    let su_id = user_auth.data.scoped_user.id.clone();
    let sv_id2 = su_id.clone();
    let email = request
        .get(&IDK::Email.into())
        .map(|p| Email::from_str(p.leak()))
        .transpose()?;

    let residential_address = request
        .get(&IDK::Country.into())
        .and_then(|a| Iso3166TwoDigitCountryCode::from_str(a.leak()).ok());

    let request = request
        .build_global_fingerprints(state.as_ref(), is_fixture)
        .await?;

    let new_ci = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &su_id)?;

            // Even though this accepts id.phone_number, it will always error at runtime if we
            // provide id.phone_number since we only allow a vault to have one phone number
            let new_contact_info = uvw.patch_data(conn, request, DataLifetimeSource::Hosted)?.new_ci;
            Ok(new_contact_info)
        })
        .await?;

    // If we just added a new email address to the vault, send a verification email
    if let Some(email) = email {
        if let Some((_, ci)) = new_ci
            .into_iter()
            .find(|(di, _)| di == &DataIdentifier::from(IDK::Email))
        {
            send_email_challenge(&state, &tenant_id, ci.id, &email.email).await?;
        }
    }

    let obc = user_auth.ob_config()?;

    if let (Some(address), Some(workflow)) = (residential_address, user_auth.workflow().ok()) {
        // if we allow international and haven't requested a doc, we need to create a doc req
        if obc.allow_international_residents && obc.document_cdo().is_none() && !address.is_us() {
            tracing::info!(scoped_vault_id=%sv_id2, wf_id=%workflow.id, "creating doc request for international onboarding");

            let args = NewDocumentRequestArgs {
                scoped_vault_id: sv_id2.clone(),
                ref_id: None,
                workflow_id: workflow.id.clone(),
                // international we require selfie for now
                should_collect_selfie: true,
                // TODO: Deprecated - None of these are used
                global_doc_types_accepted: None,
                country_restrictions: vec![],
                country_doc_type_restrictions: None,
            };
            // TODO: FP-5895 handle 1 click case where address doesn't change (we won't hit this endpoint)
            state
                .db_pool
                .db_transaction(move |conn| DocumentRequest::get_or_create(conn, args))
                .await?;
        }
    }

    EmptyResponse::ok().json()
}
