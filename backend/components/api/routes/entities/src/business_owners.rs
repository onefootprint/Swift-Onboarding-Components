use api_core::auth::tenant::{
    CheckTenantGuard,
    TenantGuard,
    TenantSessionAuth,
};
use api_core::errors::ApiResult;
use api_core::serializers::BusinessOwnerInfo;
use api_core::types::response::ResponseData;
use api_core::types::JsonApiResponse;
use api_core::utils::db2api::DbToApi;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::vault_wrapper::{
    Business,
    DecryptedBusinessOwners,
    TenantVw,
    VaultWrapper,
};
use api_core::State;
use api_wire_types::BusinessOwner as ApiBusinessOwner;
use db::models::scoped_vault::ScopedVault;
use macros::route_alias;
use paperclip::actix::{
    api_v2_operation,
    get,
    web,
};

type BusinessOwnerListResponse = Vec<ApiBusinessOwner>;

// TODO rm this
#[route_alias(get(
    "/businesses/{fp_id}/owners",
    tags(Businesses, Private),
    description = "Gets the beneficial owners of a business.",
))]
#[api_v2_operation(
    description = "Gets the beneficial owners of a business entity.",
    tags(EntityDetails, Private)
)]
#[get("/entities/{fp_id}/business_owners")]
pub async fn get(
    state: web::Data<State>,
    fp_id: FpIdPath,
    auth: TenantSessionAuth,
) -> JsonApiResponse<BusinessOwnerListResponse> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();

    let (vw, sv) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;

            let vw: TenantVw<Business> = VaultWrapper::build_for_tenant(conn, &sv.id)?;
            Ok((vw, sv))
        })
        .await?;

    let decrypted_bos = vw
        .decrypt_business_owners(&state.db_pool, &state.enclave_client, &sv.tenant_id)
        .await?;

    let results = business_owner_infos(decrypted_bos)
        .into_iter()
        .map(ApiBusinessOwner::from_db)
        .collect();
    ResponseData::ok(results).json()
}

fn business_owner_infos(decrypted_bos: DecryptedBusinessOwners) -> Vec<BusinessOwnerInfo> {
    match decrypted_bos {
        DecryptedBusinessOwners::NoVaultedOrLinkedBos => vec![],
        DecryptedBusinessOwners::NoVaultedBos {
            primary_bo,
            primary_bo_vault,
        } => vec![(None, Some(primary_bo), Some(primary_bo_vault))],
        DecryptedBusinessOwners::VaultedBos { bos } => bos
            .into_iter()
            .map(|b| (Some(b.ownership_stake), None, None))
            .collect(),
        DecryptedBusinessOwners::SingleKyc {
            primary_bo,
            primary_bo_vault,
            primary_bo_data,
            secondary_bos,
        } => {
            let mut v = vec![(
                Some(primary_bo_data.ownership_stake),
                Some(primary_bo),
                Some(primary_bo_vault),
            )];
            v.extend(
                secondary_bos
                    .into_iter()
                    .map(|b| (Some(b.ownership_stake), None, None)),
            );
            v
        }
        DecryptedBusinessOwners::MultiKyc {
            primary_bo,
            primary_bo_vault,
            primary_bo_data,
            secondary_bos,
        } => {
            let mut v = vec![(
                Some(primary_bo_data.ownership_stake),
                Some(primary_bo),
                Some(primary_bo_vault),
            )];
            v.extend(
                secondary_bos
                    .into_iter()
                    .map(|b| (Some(b.0.ownership_stake), Some(b.1), b.2)),
            );
            v
        }
    }
}
