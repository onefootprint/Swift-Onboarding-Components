use crate::errors::ApiResult;
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::utils::email::send_email_challenge;
use crate::utils::headers::AllowExtraFieldsHeaders;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_core::auth::user::{UserAuthGuard, UserObAuthContext};
use api_core::decision::features::risk_signals::ssn_optional_and_missing;
use api_core::utils::vault_wrapper::{Any, Person, TenantVw, VwArgs};
use db::models::document_request::{DocumentRequest, NewDocumentRequestArgs};
use db::models::ob_configuration::ObConfiguration;
use newtypes::email::Email;
use newtypes::put_data_request::RawDataRequest;
use newtypes::{
    DataIdentifier, DataLifetimeSource, IdentityDataKind as IDK, Iso3166TwoDigitCountryCode, ScopedVaultId,
    ValidateArgs, WorkflowGuard, WorkflowId,
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
            if let Err(e) = send_email_challenge(&state, &tenant_id, ci.id, &email.email).await {
                // For now, we don't want to block vault updates on these async email verifications.
                // We don't do anything with them today. But maybe we'll want to be more strict
                // about this in the future
                tracing::error!(e=%e, "Unable to send async email verification email");
            }
        }
    }

    let obc = user_auth.ob_config()?;

    if let Ok(workflow) = user_auth.workflow() {
        if let Some(address) = residential_address {
            // if we allow international and haven't requested a doc, we need to create a doc req
            if obc.allow_international_residents
                && obc.document_cdo().is_none()
                && !address.is_us_including_territories()
            {
                tracing::info!(scoped_vault_id=%sv_id2, wf_id=%workflow.id, "creating doc request for international onboarding");

                let args = default_stepup_doc_args(&sv_id2, true, &workflow.id);
                // TODO: FP-5895 handle 1 click case where address doesn't change (we won't hit this endpoint)
                state
                    .db_pool
                    .db_transaction(move |conn| DocumentRequest::get_or_create(conn, args))
                    .await?;
            } else if address.is_us_including_territories() {
                handle_ssn_skipped(&state, obc.clone(), sv_id2.clone(), workflow.id.clone()).await?
            }
        }
    }

    EmptyResponse::ok().json()
}

// Handle the case where ssn is skipped, we by default request a document if not already requested
async fn handle_ssn_skipped(
    state: &State,
    obc: ObConfiguration,
    sv_id: ScopedVaultId,
    workflow_id: WorkflowId,
) -> ApiResult<()> {
    // bail early if not needed
    let Some(doc_info) = obc.document_cdo_for_optional_ssn() else {
        return Ok(())
    };

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let vw = VaultWrapper::<Person>::build(conn, VwArgs::Tenant(&sv_id))?;
            let ssn_optional_and_missing = ssn_optional_and_missing(&vw, &obc);

            if ssn_optional_and_missing {
                let doc_req_args = default_stepup_doc_args(&sv_id, doc_info.requires_selfie(), &workflow_id);
                
                tracing::info!(scoped_vault_id=%sv_id, wf_id=%workflow_id, "creating doc request for ssn skipped");
                DocumentRequest::get_or_create(conn, doc_req_args)?;
            }

            Ok(())
        })
        .await?;

    Ok(())
}

fn default_stepup_doc_args(
    sv_id: &ScopedVaultId,
    should_collect_selfie: bool,
    workflow_id: &WorkflowId,
) -> NewDocumentRequestArgs {
    NewDocumentRequestArgs {
        scoped_vault_id: sv_id.clone(),
        ref_id: None,
        workflow_id: workflow_id.clone(),
        should_collect_selfie,
        // TODO: Deprecated - None of these are used
        global_doc_types_accepted: None,
        country_restrictions: vec![],
        country_doc_type_restrictions: None,
    }
}
