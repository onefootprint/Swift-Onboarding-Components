use crate::types::ApiResponse;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_core::auth::user::UserAuthScope;
use api_core::auth::user::UserWfAuthContext;
use api_core::utils::headers::BootstrapFieldsHeader;
use api_core::utils::headers::IsBootstrapHeader;
use api_core::utils::vault_wrapper::Any;
use api_core::utils::vault_wrapper::DataRequestSource;
use api_core::utils::vault_wrapper::DlSourceWithOverrides;
use api_core::utils::vault_wrapper::FingerprintedDataRequest;
use api_core::utils::vault_wrapper::Person;
use db::models::document_request::DocumentRequest;
use db::models::document_request::NewDocumentRequestArgs;
use newtypes::put_data_request::ModernRawUserDataRequest;
use newtypes::put_data_request::PatchDataRequest;
use newtypes::DataLifetimeSource;
use newtypes::DocumentAndCountryConfiguration;
use newtypes::DocumentRequestConfig;
use newtypes::IdDocKind;
use newtypes::IdentityDataKind as IDK;
use newtypes::Iso3166TwoDigitCountryCode;
use newtypes::ValidateArgs;
use newtypes::WorkflowGuard;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
};
use std::str::FromStr;

#[api_v2_operation(
    description = "Checks if provided vault data is valid before adding it to the vault",
    tags(Vault, Hosted, Users)
)]
#[actix::post("/hosted/user/vault/validate")]
pub async fn post_validate(
    state: web::Data<State>,
    request: Json<ModernRawUserDataRequest>,
    user_wf_auth: UserWfAuthContext,
) -> ApiResponse<api_wire_types::Empty> {
    let user_auth = user_wf_auth.check_guard(UserAuthScope::VaultData)?;
    user_auth.check_workflow_guard(WorkflowGuard::AddData)?;

    let opts = ValidateArgs {
        ignore_luhn_validation: false,
        for_bifrost: true,
        is_live: user_auth.user.is_live,
    };
    let PatchDataRequest { updates, .. } = PatchDataRequest::clean_and_validate(request.into_inner(), opts)?;
    // No fingerprints to check speculatively
    let updates = FingerprintedDataRequest::no_fingerprints_for_validation(updates);
    let su_id = user_auth.scoped_user.id.clone();
    let source = user_auth.user_session.dl_source();
    state
        .db_query(move |conn| {
            let vw = VaultWrapper::<Person>::build_for_tenant(conn, &su_id)?;
            vw.validate_request(conn, updates, &DataRequestSource::HostedPatchVault(source.into()))?;
            Ok(())
        })
        .await?;

    Ok(api_wire_types::Empty)
}

#[api_v2_operation(description = "Updates data in a user vault", tags(Vault, Hosted, Users))]
#[actix::patch("/hosted/user/vault")]
pub async fn patch(
    state: web::Data<State>,
    request: Json<ModernRawUserDataRequest>,
    user_wf_auth: UserWfAuthContext,
    bootstrap_fields: BootstrapFieldsHeader,
    is_bootstrap: IsBootstrapHeader,
) -> ApiResponse<api_wire_types::Empty> {
    let user_auth = user_wf_auth.check_guard(UserAuthScope::VaultData)?;
    user_auth.check_workflow_guard(WorkflowGuard::AddData)?;

    let PatchDataRequest { updates, .. } = PatchDataRequest::clean_and_validate(
        request.into_inner(),
        ValidateArgs::for_bifrost(user_auth.user.is_live),
    )?;
    let residential_address = updates
        .get(&IDK::Country.into())
        .and_then(|a| Iso3166TwoDigitCountryCode::from_str(a.leak()).ok());

    let sv_id = &user_auth.scoped_user.id;
    let updates = FingerprintedDataRequest::build(&state, updates, sv_id).await?;

    let su_id = user_auth.scoped_user.id.clone();
    let source = match *is_bootstrap {
        true => DataLifetimeSource::LikelyBootstrap,
        false => user_auth.user_session.dl_source(),
    };
    let overrides = (bootstrap_fields.0)
        .into_iter()
        .map(|di| (di, DataLifetimeSource::LikelyBootstrap))
        .collect();
    state
        .db_transaction(move |conn| {
            let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &su_id)?;

            let sources = DlSourceWithOverrides {
                default: source,
                overrides,
            };
            uvw.patch_data(conn, updates, DataRequestSource::HostedPatchVault(sources))?;
            Ok(())
        })
        .await?;

    // TODO these need to be atomic with the patch
    if let Some(address) = residential_address {
        // if we allow international and haven't requested a doc, we need to create a doc req
        let obc = &user_auth.ob_config;
        let wf = &user_auth.workflow;
        let sv_id = &user_auth.scoped_user.id;
        if obc.allow_international_residents
            && obc.document_cdo().is_none()
            && !address.is_us_including_territories()
        {
            tracing::info!(scoped_vault_id=%sv_id, wf_id=%wf.id, "creating doc request for international onboarding");
            // We only support passport for international onboarding for now
            let passport_only_config = DocumentAndCountryConfiguration {
                global: vec![IdDocKind::Passport],
                ..Default::default()
            };
            let args = NewDocumentRequestArgs {
                scoped_vault_id: sv_id.clone(),
                workflow_id: wf.id.clone(),
                rule_set_result_id: None,
                config: DocumentRequestConfig::Identity {
                    collect_selfie: true,
                    document_types_and_countries: Some(passport_only_config),
                },
            };
            // TODO: FP-5895 handle 1 click case where address doesn't change (we won't hit this endpoint)
            state
                .db_transaction(move |conn| DocumentRequest::get_or_create(conn, args))
                .await?;
        }
    }

    Ok(api_wire_types::Empty)
}
