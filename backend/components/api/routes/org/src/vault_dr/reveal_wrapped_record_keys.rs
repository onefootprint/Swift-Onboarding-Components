use actix_web::web;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantApiKeyGated;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::CanDecrypt;
use api_core::types::ApiResponse;
use api_core::utils::headers::InsightHeaders;
use api_core::State;
use api_errors::FpDbOptionalExtension;
use api_wire_types::VaultDrRevealWrappedRecordKeysRequest;
use api_wire_types::VaultDrRevealWrappedRecordKeysResponse;
use db::models::audit_event::AuditEvent;
use db::models::audit_event::NewAuditEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::vault_dr::VaultDrBlob;
use db::models::vault_dr::VaultDrConfig;
use itertools::Itertools;
use newtypes::preview_api;
use newtypes::AuditEventDetail;
use newtypes::DbActor;
use newtypes::DecryptionContext;
use paperclip::actix;
use paperclip::actix::api_v2_operation;

const RECORD_LIMIT: usize = 50;

#[api_v2_operation(
    tags(VaultDisasterRecovery, Private),
    description = "Reveals the wrapped record keys necessary to decrypt the Vault Disaster Recovery backups for the given fp_id fields"
)]
#[actix::post("/org/vault_dr/reveal_wrapped_record_keys")]
pub async fn post(
    state: web::Data<State>,
    auth: TenantApiKeyGated<preview_api::VaultDisasterRecovery>,
    request: web::Json<VaultDrRevealWrappedRecordKeysRequest>,
    insight_headers: InsightHeaders,
) -> ApiResponse<VaultDrRevealWrappedRecordKeysResponse> {
    // Initially only require read access to turn the record paths into DIs.
    // We will later check for decrypt access on those DIs.
    let read_only_auth = auth.clone().check_guard(TenantGuard::Read)?;
    let tenant = read_only_auth.tenant();
    let is_live = read_only_auth.is_live()?;

    // Extract the DIs from the bucket paths so we can pass them to the check_guard.
    let VaultDrRevealWrappedRecordKeysRequest { record_paths } = request.into_inner();
    let distinct_record_paths = record_paths.into_iter().unique().collect_vec();

    if distinct_record_paths.len() > RECORD_LIMIT {
        return Err(vault_dr::Error::TooManyWrappedRecordKeyRequests(RECORD_LIMIT).into());
    }

    let tenant_id = tenant.id.clone();
    let record_paths = distinct_record_paths.clone();
    let num_records = record_paths.len();
    let blobs = state
        .db_transaction(move |conn| {
            let config = VaultDrConfig::get(conn, (&tenant_id, is_live))
                .optional()?
                .ok_or(vault_dr::Error::NotEnrolled)?;

            let (blobs, dls): (Vec<_>, Vec<_>) = VaultDrBlob::bulk_get(conn, &config.id, record_paths)?
                .into_iter()
                .unzip();

            // Now require decrypt permissions on the DIs.
            let all_dis = dls.iter().map(|dl| dl.kind.clone()).unique().collect_vec();
            let decrypt_auth = auth.check_guard(CanDecrypt::new(all_dis))?;
            let actor = decrypt_auth.actor();

            if blobs.len() < num_records {
                return Err(vault_dr::Error::BlobDoesNotExist.into());
            }

            let dis_by_sv = dls
                .iter()
                .map(|dl| (dl.scoped_vault_id.clone(), dl.kind.clone()))
                .into_group_map();

            let insight = CreateInsightEvent::from(insight_headers).insert_with_conn(conn)?;
            let insight_event_id = insight.id.clone();
            let db_actor: DbActor = actor.into();

            let mut audit_events = vec![];
            for (sv_id, dis) in dis_by_sv {
                // Create audit events to show data could have been decrypted offline.
                let audit_event = NewAuditEvent {
                    tenant_id: tenant_id.clone(),
                    principal_actor: db_actor.clone(),
                    insight_event_id: insight_event_id.clone(),
                    detail: AuditEventDetail::DecryptUserData {
                        is_live,
                        scoped_vault_id: sv_id,
                        reason: "Disaster recovery test".to_owned(),
                        context: DecryptionContext::Api,
                        decrypted_fields: dis.clone(),
                    },
                };
                audit_events.push(audit_event);
            }

            AuditEvent::bulk_create(conn, audit_events)?;

            Ok(blobs)
        })
        .await?;


    let wrapped_record_keys = blobs
        .into_iter()
        .map(|blob| (blob.bucket_path, blob.wrapped_record_key))
        .collect();
    Ok(VaultDrRevealWrappedRecordKeysResponse { wrapped_record_keys })
}
