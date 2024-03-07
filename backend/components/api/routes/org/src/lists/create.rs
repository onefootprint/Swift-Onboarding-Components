use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard, TenantSessionAuth},
    errors::ApiResult,
    types::ResponseData,
    utils::db2api::DbToApi,
    State,
};
use api_core::errors::ValidationError;
use api_wire_types::CreateListRequest;
use crypto::seal::SealedChaCha20Poly1305DataKey;
use db::models::{list::List, tenant::Tenant};
use newtypes::SealedVaultDataKey;
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(description = "Creates a new List", tags(Organization, Private, Lists))]
#[actix::post("/org/lists")]
pub async fn create_list(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    request: Json<CreateListRequest>,
) -> ApiResult<Json<ResponseData<api_wire_types::List>>> {
    let auth = auth.check_guard(TenantGuard::OnboardingConfiguration)?; // TODO: new guard for this + /rules probably
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let actor = auth.actor();

    let CreateListRequest { name, alias, kind } = request.into_inner();

    let list = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let t = Tenant::get(conn, &tenant_id)?;
            if List::find(conn, &tenant_id, is_live, &name, &alias)?.is_some() {
                return Err(ValidationError("List with that name already exists").into()); // AssertionError? something else?
            }

            let (e_data_key, _) =
                SealedChaCha20Poly1305DataKey::generate_sealed_random_chacha20_poly1305_key_with_plaintext(
                    t.public_key.as_ref(),
                )?;
            let e_data_key = SealedVaultDataKey::try_from(e_data_key.sealed_key)?;
            Ok(List::create(
                conn,
                &tenant_id,
                is_live,
                actor.into(),
                name,
                alias,
                kind,
                e_data_key,
            )?)
        })
        .await?;

    ResponseData::ok(api_wire_types::List::from_db(list)).json()
}
