use std::collections::{HashMap, HashSet};

use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::{CheckTenantGuard, SecretTenantAuthContext};
use crate::errors::ApiResult;
use crate::types::JsonApiResponse;

use crate::utils::vault_wrapper::VaultWrapper;

use crate::State;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::auth::Either;
use api_core::types::ResponseData;
use api_core::utils::headers::InsightHeaders;
use api_core::utils::vault_wrapper::TenantVw;

use db::models::access_event::NewAccessEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use macros::route_alias;
use newtypes::input::Csv;

use newtypes::{flat_api_object_map_type, AccessEventKind, DataIdentifier, FpId};
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{self, api_v2_operation, web, web::Json, web::Path};
use serde::Deserialize;

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
pub struct DeleteFieldsParams {
    /// Comma separated list of fields to check. For example, `id.first_name,id.ssn4,custom.bank_account`
    #[openapi(example = "card.primary.cvc, custom.ach_account")]
    fields: Csv<DataIdentifier>,
}

flat_api_object_map_type!(
    DeleteVaultResponse<DataIdentifier, bool>,
    description="A key-value map of identifier to whether the identifier was successfully deleted in the vault",
    example=r#"{ "id.last_name": true, "id.ssn9": true, "custom.credit_card": true, "id.dob": false }"#
);

#[route_alias(
    actix::delete(
        "/users/{fp_id}/vault",
        description = "Deletes data in a user vault.",
        tags(Users, Vault, PublicApi)
    ),
    actix::delete(
        "/businesses/{fp_id}/vault",
        description = "Deletes data in a business vault.",
        tags(Businesses, Vault, PublicApi)
    )
)]
#[api_v2_operation(
    description = "Works for either person or business entities. Deletes data in a vault.",
    tags(Entities, Vault, Preview)
)]
#[actix::delete("/entities/{fp_id}/vault")]
pub async fn delete(
    state: web::Data<State>,
    path: Path<FpId>,
    request: Json<DeleteFieldsParams>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
    insight: InsightHeaders,
) -> JsonApiResponse<DeleteVaultResponse> {
    let fp_id = path.into_inner();
    let DeleteFieldsParams { fields } = request.into_inner();

    let auth = auth.check_guard(TenantGuard::Admin)?;
    let actor = auth.actor();
    let is_live = auth.is_live()?;
    let tenant_id = auth.tenant().id.clone();
    let requested_dis = fields.to_vec();

    let deleted_dis = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<HashSet<_>> {
            let scoped_user = ScopedVault::get(conn.conn(), (&fp_id, &tenant_id, is_live))?;
            let uvw: TenantVw = VaultWrapper::build_for_tenant(conn.conn(), &scoped_user.id)?;
            let dis = uvw.soft_delete_vault_data(conn, fields.to_vec())?;

            NewAccessEvent {
                scoped_vault_id: scoped_user.id,
                reason: None,
                principal: actor.into(),
                insight: CreateInsightEvent::from(insight),
                kind: AccessEventKind::Delete,
                targets: dis.clone(),
            }
            .create(conn.conn())?;

            Ok(HashSet::from_iter(dis.into_iter()))
        })
        .await?;

    let results = HashMap::from_iter(
        requested_dis
            .into_iter()
            .map(|di| (di.clone(), deleted_dis.contains(&di))),
    );
    let out = DeleteVaultResponse { map: results };

    ResponseData::ok(out).json()
}
