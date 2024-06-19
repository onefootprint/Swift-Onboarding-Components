use api_core::auth::tenant::{
    CheckTenantGuard,
    TenantGuard,
    TenantSessionAuth,
};
use api_core::errors::tenant::TenantError;
use api_core::types::{
    JsonApiListResponse,
    JsonApiResponse,
};
use api_core::utils::db2api::DbToApi;
use api_core::State;
use db::models::tenant_frequent_note::TenantFrequentNote;
use db::DbResult;
use newtypes::TenantFrequentNoteId;
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
};

#[api_v2_operation(
    description = "Returns a list of frequent notes for the organization.",
    tags(OrgSettings, Organization, Private)
)]
#[actix::get("/org/frequent_notes")]
pub async fn get(
    state: web::Data<State>,
    filters: web::Query<api_wire_types::GetOrgFrequentNotes>,
    auth: TenantSessionAuth,
) -> JsonApiListResponse<api_wire_types::OrgFrequentNote> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();

    let api_wire_types::GetOrgFrequentNotes { kind } = filters.into_inner();

    let list = state
        .db_pool
        .db_query(move |conn| -> DbResult<_> { TenantFrequentNote::list(conn, &tenant_id, kind) })
        .await?
        .into_iter()
        .map(api_wire_types::OrgFrequentNote::from_db)
        .collect();
    Ok(list)
}

#[api_v2_operation(
    description = "Creates a new frequent note for the organization.",
    tags(OrgSettings, Organization, Private)
)]
#[actix::post("/org/frequent_notes")]
pub async fn post(
    state: web::Data<State>,
    request: web::Json<api_wire_types::CreateOrgFrequentNoteRequest>,
    auth: TenantSessionAuth,
) -> JsonApiResponse<api_wire_types::OrgFrequentNote> {
    let auth = auth.check_guard(TenantGuard::OrgSettings)?;
    let tenant_id = auth.tenant().id.clone();

    let actor = auth.actor().into();
    let api_wire_types::CreateOrgFrequentNoteRequest { kind, content } = request.into_inner();

    if content.is_empty() {
        return Err(TenantError::ValidationError("frequent note content cannot be empty".to_owned()).into());
    }

    let new_freq_note = state
        .db_pool
        .db_query(move |conn| -> DbResult<_> {
            TenantFrequentNote::create(conn, tenant_id, actor, kind, content)
        })
        .await?;
    Ok(api_wire_types::OrgFrequentNote::from_db(new_freq_note))
}

#[api_v2_operation(
    description = "Delete a frequent note for the organization.",
    tags(OrgSettings, Organization, Private)
)]
#[actix::delete("/org/frequent_notes/{frequent_note_id}")]
pub async fn delete(
    state: web::Data<State>,
    frequent_note_id: web::Path<TenantFrequentNoteId>,
    auth: TenantSessionAuth,
) -> JsonApiResponse<api_wire_types::Empty> {
    let auth = auth.check_guard(TenantGuard::OrgSettings)?;
    let tenant_id = auth.tenant().id.clone();

    let fn_id = frequent_note_id.into_inner();

    state
        .db_pool
        .db_query(move |conn| -> DbResult<_> { TenantFrequentNote::deactivate(conn, &tenant_id, &fn_id) })
        .await?;

    Ok(api_wire_types::Empty)
}
