use crate::errors::ApiResult;
use crate::types::{
    EmptyResponse,
    JsonApiResponse,
};
use crate::utils::email::send_email_challenge;
use crate::utils::headers::AllowExtraFieldsHeaders;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_core::auth::user::{
    UserAuthScope,
    UserWfAuthContext,
};
use api_core::utils::headers::BootstrapFieldsHeader;
use api_core::utils::vault_wrapper::{
    Any,
    DataLifetimeSources,
    DataRequestSource,
    FingerprintedDataRequest,
    Person,
    VwArgs,
};
use db::models::document_request::{
    DocumentRequest,
    NewDocumentRequestArgs,
};
use db::models::ob_configuration::ObConfiguration;
use newtypes::email::Email;
use newtypes::put_data_request::{
    PatchDataRequest,
    RawDataRequest,
};
use newtypes::{
    DataIdentifier,
    DataLifetimeSource,
    DocumentRequestConfig,
    IdentityDataKind as IDK,
    Iso3166TwoDigitCountryCode,
    ScopedVaultId,
    ValidateArgs,
    WorkflowGuard,
    WorkflowId,
};
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
};
use std::str::FromStr;

#[api_v2_operation(
    description = "Checks if provided vault data is valid before adding it to the vault",
    tags(Vault, Hosted, Users)
)]
#[actix::post("/hosted/user/vault/validate")]
pub async fn post_validate(
    state: web::Data<State>,
    request: Json<RawDataRequest>,
    user_wf_auth: UserWfAuthContext,
    allow_extra_fields: AllowExtraFieldsHeaders,
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_wf_auth.check_guard(UserAuthScope::VaultData)?;
    user_auth.check_workflow_guard(WorkflowGuard::AddData)?;

    let opts = ValidateArgs {
        ignore_luhn_validation: false,
        for_bifrost: true,
        allow_dangling_keys: *allow_extra_fields,
        is_live: user_auth.user().is_live,
    };
    let PatchDataRequest { updates, .. } = request.into_inner().clean_and_validate(opts)?;
    // No fingerprints to check speculatively
    let updates = FingerprintedDataRequest::no_fingerprints_for_validation(updates);
    let su_id = user_auth.scoped_user.id.clone();
    let source = user_auth.user_session.dl_source();
    state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let vw = VaultWrapper::<Person>::build_for_tenant(conn, &su_id)?;
            let sources = DataLifetimeSources::single(source);
            vw.validate_request(conn, updates, sources, None, DataRequestSource::PatchVault)?;
            Ok(())
        })
        .await?;

    EmptyResponse::ok().json()
}

#[api_v2_operation(description = "Updates data in a user vault", tags(Vault, Hosted, Users))]
#[actix::patch("/hosted/user/vault")]
pub async fn patch(
    state: web::Data<State>,
    request: Json<RawDataRequest>,
    user_wf_auth: UserWfAuthContext,
    bootstrap_fields: BootstrapFieldsHeader,
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_wf_auth.check_guard(UserAuthScope::VaultData)?;
    user_auth.check_workflow_guard(WorkflowGuard::AddData)?;
    let t_id = &user_auth.tenant().id;

    let PatchDataRequest { updates, .. } = request
        .into_inner()
        .clean_and_validate(ValidateArgs::for_bifrost(user_auth.user().is_live))?;

    let email = updates
        .get(&IDK::Email.into())
        .map(|p| Email::from_str(p.leak()))
        .transpose()?;

    let residential_address = updates
        .get(&IDK::Country.into())
        .and_then(|a| Iso3166TwoDigitCountryCode::from_str(a.leak()).ok());

    let sv_id = &user_auth.scoped_user.id;
    let updates = FingerprintedDataRequest::build(&state, updates, sv_id).await?;

    let su_id = user_auth.scoped_user.id.clone();
    let source = user_auth.user_session.dl_source();
    let new_ci = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &su_id)?;

            let overrides = bootstrap_fields
                .0
                .into_iter()
                .map(|di| (di, DataLifetimeSource::LikelyBootstrap))
                .collect();
            let sources = DataLifetimeSources::overrides(source, overrides);
            // Even though this accepts id.phone_number, it will always error at runtime if we
            // provide id.phone_number since we only allow a vault to have one phone number
            let new_contact_info = uvw.patch_data(conn, updates, sources, None)?.new_ci;
            Ok(new_contact_info)
        })
        .await?;

    // If we just added a new email address to the vault, send a verification email
    if let Some(email) = email {
        if let Some((_, ci)) = new_ci
            .into_iter()
            .find(|(di, _)| di == &DataIdentifier::from(IDK::Email))
        {
            if let Err(err) = send_email_challenge(&state, t_id, ci.id, &email.email).await {
                // For now, we don't want to block vault updates on these async email verifications.
                // We don't do anything with them today. But maybe we'll want to be more strict
                // about this in the future
                tracing::error!(?err, "Unable to send async email verification email");
            }
        }
    }

    // TODO these need to be atomic with the patch
    if let Some(address) = residential_address {
        // if we allow international and haven't requested a doc, we need to create a doc req
        let obc = user_auth.ob_config();
        let wf = user_auth.workflow();
        let sv_id = &user_auth.scoped_user.id;
        if obc.allow_international_residents
            && obc.document_cdo().is_none()
            && !address.is_us_including_territories()
        {
            tracing::info!(scoped_vault_id=%sv_id, wf_id=%wf.id, "creating doc request for international onboarding");

            let args = default_identity_doc_args(sv_id, true, &wf.id);
            // TODO: FP-5895 handle 1 click case where address doesn't change (we won't hit this endpoint)
            state
                .db_pool
                .db_transaction(move |conn| DocumentRequest::get_or_create(conn, args))
                .await?;
        } else if address.is_us_including_territories() {
            handle_ssn_skipped(&state, obc.clone(), sv_id.clone(), wf.id.clone()).await?
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
        return Ok(());
    };

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let vw = VaultWrapper::<Person>::build(conn, VwArgs::Tenant(&sv_id))?;
            let ssn_optional_and_missing = api_core::decision::features::user_input::ssn_optional_and_missing(&vw, &obc);

            if ssn_optional_and_missing {
                let doc_req_args = default_identity_doc_args(&sv_id, doc_info.requires_selfie(), &workflow_id);

                tracing::info!(scoped_vault_id=%sv_id, wf_id=%workflow_id, "creating doc request for ssn skipped");
                DocumentRequest::get_or_create(conn, doc_req_args)?;
            }

            Ok(())
        })
        .await?;

    Ok(())
}

fn default_identity_doc_args(
    sv_id: &ScopedVaultId,
    should_collect_selfie: bool,
    workflow_id: &WorkflowId,
) -> NewDocumentRequestArgs {
    NewDocumentRequestArgs {
        scoped_vault_id: sv_id.clone(),
        workflow_id: workflow_id.clone(),
        rule_set_result_id: None,
        config: DocumentRequestConfig::Identity {
            collect_selfie: should_collect_selfie,
        },
    }
}
