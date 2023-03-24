//! Create a NON-portable user vault for a tenant

use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantAuth;
use crate::errors::ApiError;
use crate::errors::ApiResult;
use crate::types::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::utils::fingerprint::build_fingerprints;
use crate::utils::headers::InsightHeaders;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use db::models::access_event::NewAccessEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::NewVaultArgs;
use db::models::vault::Vault;
use itertools::Itertools;
use newtypes::put_data_request::RawDataRequest;
use newtypes::AccessEventKind;
use newtypes::ParseOptions;
use newtypes::VaultKind;
use paperclip::actix::{api_v2_operation, post, web, web::Json};

#[api_v2_operation(
    description = "Creates a new user vault + scoped user that is not portable.",
    tags(Users, PublicApi)
)]
#[post("/users")]
pub async fn post(
    state: web::Data<State>,
    request: Option<Json<RawDataRequest>>,
    auth: SecretTenantAuthContext,
    insight: InsightHeaders,
) -> actix_web::Result<Json<ResponseData<api_wire_types::User>>, ApiError> {
    let (public_key, e_private_key) = state.enclave_client.generate_sealed_keypair().await?;
    let principal = auth.actor().into();
    let insight = CreateInsightEvent::from(insight);

    let tenant_id = auth.tenant().id.clone();
    let new_user = NewVaultArgs {
        public_key,
        e_private_key,
        is_live: auth.is_live()?,
        is_portable: false,
        kind: VaultKind::Person,
    };

    // Parse optional request
    let request_info = if let Some(request) = request {
        let request = request.into_inner();
        let targets = request.keys().cloned().collect_vec();
        if !targets.is_empty() {
            let request = request.clean_and_validate(ParseOptions::for_non_portable())?;
            let fingerprints = build_fingerprints(&state, request.clone()).await?;
            Some((targets, request, fingerprints))
        } else {
            None
        }
    } else {
        None
    };

    let scoped_user = state
        .db_pool
        .db_transaction(|conn| -> ApiResult<_> {
            let user_vault = Vault::create(conn, new_user)?;
            let scoped_user = ScopedVault::create_non_portable(conn, user_vault, tenant_id)?;

            if let Some((targets, request, fingerprints)) = request_info {
                // If any initial request data was provided, add it to the vault
                let uvw = VaultWrapper::lock_for_onboarding(conn, &scoped_user.id)?;
                uvw.put_person_data(conn, request, fingerprints)?;
                // Create an access event to show data was added
                NewAccessEvent {
                    scoped_user_id: scoped_user.id.clone(),
                    reason: None,
                    principal,
                    insight,
                    kind: AccessEventKind::Update,
                    targets,
                }
                .create(conn)?;
            }

            Ok(scoped_user)
        })
        .await?;

    Ok(Json(ResponseData::ok(api_wire_types::User::from_db(scoped_user))))
}
