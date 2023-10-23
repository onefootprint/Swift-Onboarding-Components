use crate::errors::ApiResult;
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::utils::email::send_email_challenge;
use crate::utils::headers::AllowExtraFieldsHeaders;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_core::auth::user::{UserAuthContext, UserAuthGuard, UserWfAuthContext};
use api_core::auth::AuthError;
use api_core::decision::features::risk_signals::ssn_optional_and_missing;
use api_core::utils::vault_wrapper::{Any, Person, VwArgs};
use db::models::document_request::{DocumentRequest, NewDocumentRequestArgs};
use db::models::ob_configuration::ObConfiguration;
use db::models::tenant::Tenant;
use db::models::vault::Vault;
use db::models::workflow::Workflow;
use newtypes::email::Email;
use newtypes::put_data_request::RawDataRequest;
use newtypes::{
    DataIdentifier, DataLifetimeSource, IdentityDataKind as IDK, Iso3166TwoDigitCountryCode, ScopedVaultId,
    ValidateArgs, WorkflowGuard, WorkflowId,
};
use paperclip::actix::{self, api_v2_operation, web, web::Json};
use std::str::FromStr;

/// Short-term solution to support normal UserAuthContext in addition to UserWfAuth - there's one
/// client codepath that makes a request to this endpoint before a workflow exists
async fn parse_auth(
    state: &State,
    user_auth: UserAuthContext,
    user_wf_auth: Option<UserWfAuthContext>,
) -> ApiResult<(Vault, ScopedVaultId, Tenant, Option<(ObConfiguration, Workflow)>)> {
    // TODO We should move this to only take UserWfAuth at some point, but the client makes one request
    // to this API before POST /hosted/onboarding to add the email to a vault after it's created
    let result = if let Some(user_wf_auth) = user_wf_auth {
        let user_auth = user_wf_auth.check_guard(UserAuthGuard::SignUp)?;
        user_auth.check_workflow_guard(WorkflowGuard::AddData)?;
        let user = user_auth.user().clone();
        let su_id = user_auth.scoped_user.id.clone();
        let tenant = user_auth.tenant().clone();
        let wf_info = Some((user_auth.ob_config()?.clone(), user_auth.workflow().clone()));
        (user, su_id, tenant, wf_info)
    } else {
        let user_auth = user_auth.check_guard(UserAuthGuard::SignUp)?;
        let user = user_auth.user.clone();
        let su_id = user_auth.scoped_user_id().ok_or(AuthError::MissingScopedUser)?;
        let su_id2 = su_id.clone();
        let tenant = state
            .db_pool
            .db_query(move |conn| Tenant::get(conn, &su_id2))
            .await??;
        let wf_info = None;
        (user, su_id, tenant, wf_info)
    };
    Ok(result)
}

#[api_v2_operation(
    description = "Checks if provided vault data is valid before adding it to the vault",
    tags(Hosted, Vault, Users)
)]
#[actix::post("/hosted/user/vault/validate")]
pub async fn post_validate(
    state: web::Data<State>,
    request: Json<RawDataRequest>,
    user_auth: UserAuthContext,
    user_wf_auth: Option<UserWfAuthContext>,
    allow_extra_fields: AllowExtraFieldsHeaders,
) -> JsonApiResponse<EmptyResponse> {
    let (user, su_id, _, _) = parse_auth(&state, user_auth, user_wf_auth).await?;

    let opts = ValidateArgs {
        ignore_luhn_validation: false,
        for_bifrost: true,
        allow_dangling_keys: *allow_extra_fields,
        is_live: user.is_live,
    };
    let request = request.into_inner().clean_and_validate(opts)?;
    let request = request.no_fingerprints(); // No fingerprints to check speculatively
    state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let vw = VaultWrapper::<Person>::build_for_tenant(conn, &su_id)?;
            request.assert_allowable_identifiers(vw.vault.kind)?;
            vw.validate_request(conn, request)?;
            Ok(())
        })
        .await??;

    EmptyResponse::ok().json()
}

#[api_v2_operation(description = "Updates data in a user vault", tags(Hosted, Vault, Users))]
#[actix::patch("/hosted/user/vault")]
pub async fn patch(
    state: web::Data<State>,
    request: Json<RawDataRequest>,
    // We should move this to UserWfAuth at some point, but the client makes one request to this
    // API before POST /hosted/onboarding to add the email to a vault after it's created
    user_auth: UserAuthContext,
    user_wf_auth: Option<UserWfAuthContext>,
) -> JsonApiResponse<EmptyResponse> {
    let (user, su_id, tenant, wf_info) = parse_auth(&state, user_auth, user_wf_auth).await?;
    let is_fixture = user.is_fixture;
    let sv_id2 = su_id.clone();
    let request = request
        .into_inner()
        .clean_and_validate(ValidateArgs::for_bifrost(user.is_live))?;

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
            if let Err(err) = send_email_challenge(&state, &tenant.id, ci.id, &email.email).await {
                // For now, we don't want to block vault updates on these async email verifications.
                // We don't do anything with them today. But maybe we'll want to be more strict
                // about this in the future
                tracing::error!(?err, "Unable to send async email verification email");
            }
        }
    }

    // wf_info is only ever None for the singular request that adds an email to the vault before
    // onboarding has started
    if let Some((obc, wf)) = wf_info {
        if let Some(address) = residential_address {
            // if we allow international and haven't requested a doc, we need to create a doc req
            if obc.allow_international_residents
                && obc.document_cdo().is_none()
                && !address.is_us_including_territories()
            {
                tracing::info!(scoped_vault_id=%sv_id2, wf_id=%wf.id, "creating doc request for international onboarding");

                let args = default_stepup_doc_args(&sv_id2, true, &wf.id);
                // TODO: FP-5895 handle 1 click case where address doesn't change (we won't hit this endpoint)
                state
                    .db_pool
                    .db_transaction(move |conn| DocumentRequest::get_or_create(conn, args))
                    .await?;
            } else if address.is_us_including_territories() {
                handle_ssn_skipped(&state, obc.clone(), sv_id2.clone(), wf.id.clone()).await?
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
    }
}
