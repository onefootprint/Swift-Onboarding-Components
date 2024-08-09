use super::get_transformer;
use super::IngressRule;
use crate::auth::tenant::TenantAuth;
use crate::utils::headers::InsightHeaders;
use crate::utils::vault_wrapper::Any;
use crate::utils::vault_wrapper::DataLifetimeSources;
use crate::utils::vault_wrapper::FingerprintedDataRequest;
use crate::utils::vault_wrapper::Person;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::utils::{
    self,
};
use crate::FpResult;
use crate::State;
use api_errors::FpError;
use db::models::access_event::NewAccessEventRow;
use db::models::audit_event::NewAuditEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::Vault;
use either::Either;
use enclave_proxy::DataTransformer;
use enclave_proxy::DataTransforms;
use futures::future::try_join_all;
use itertools::Itertools;
use newtypes::AccessEventKind;
use newtypes::AuditEventDetail;
use newtypes::AuditEventId;
use newtypes::DataIdentifier;
use newtypes::DataRequest;
use newtypes::DbActor;
use newtypes::DecryptionContext;
use newtypes::DocumentDiKind;
use newtypes::FpId;
use newtypes::PiiBytes;
use newtypes::PiiString;
use newtypes::S3Url;
use newtypes::SealedVaultDataKey;
use newtypes::StorageType;
use newtypes::TenantId;
use newtypes::ValidateArgs;
use std::collections::HashMap;

/// Vaults PII values
/// writes the PII token values to the vault
pub async fn vault_pii(
    state: &State,
    auth: &dyn TenantAuth,
    values: HashMap<IngressRule, PiiString>,
    insights: InsightHeaders,
) -> FpResult<()> {
    // no need to DB ops if no ingress to vault
    if values.is_empty() {
        return Ok(());
    }
    // split by fp_id
    let values_by_user = values
        .into_iter()
        .map(|(rule, pii)| {
            let fp_id = rule.proxy_token.fp_id.clone();
            let ffs = get_transformer(&rule.proxy_token.filter_functions);
            let values = (rule.proxy_token.identifier, ffs, pii);
            (fp_id, values)
        })
        .into_group_map();

    for (fp_id, values) in values_by_user {
        let tenant_id = auth.tenant().id.clone();
        let is_live = auth.is_live()?;
        let principal: DbActor = auth.actor().into();
        let insight = CreateInsightEvent::from(insights.clone());

        // extract our mime types
        let mime_types = values
            .iter()
            .filter_map(|(di, filters, pii)| {
                if let DataIdentifier::Document(DocumentDiKind::MimeType(doc_kind, side)) = di {
                    // (edge case): apply the filter on the mime_type if it exists
                    filters
                        .apply_str::<String>(pii.leak())
                        .map(|mt| Some((DocumentDiKind::from_id_doc_kind(*doc_kind, *side), mt)))
                        .map_err(FpError::from)
                        .transpose()
                } else {
                    None
                }
            })
            .collect::<FpResult<Vec<_>>>()?
            .into_iter()
            .collect::<HashMap<_, _>>();

        // build the update request
        let (data, documents): (Vec<_>, Vec<_>) = values
            .into_iter()
            .filter_map(|(di, filters, value)| match di {
                DataIdentifier::Document(ref doc_kind) => match doc_kind.storage_type() {
                    StorageType::VaultData => Some(Either::Left((di, filters, value))),
                    StorageType::DocumentData => {
                        let mime_type = mime_types.get(doc_kind);
                        Some(Either::Right((doc_kind.clone(), (mime_type, filters, value))))
                    }
                    StorageType::DocumentMetadata => None,
                },
                DataIdentifier::InvestorProfile(_)
                | DataIdentifier::Business(_)
                | DataIdentifier::Id(_)
                | DataIdentifier::Custom(_)
                | DataIdentifier::Card(_) => Some(Either::Left((di, filters, value))),
            })
            .partition_map(|r| r);

        // apply filters on the data
        let data = data
            .into_iter()
            .map(|(di, filters, value)| Ok((di, filters.apply_str::<PiiString>(value.leak())?)))
            .collect::<FpResult<Vec<_>>>()?;

        let data: HashMap<_, _> = data.into_iter().collect();
        let documents: HashMap<_, _> = documents.into_iter().collect();

        // skip empty ingress
        if data.is_empty() && documents.is_empty() {
            continue;
        }

        let sv = state
            .db_pool
            .db_query(move |conn| ScopedVault::get(conn, (&fp_id, &tenant_id, is_live)))
            .await?;

        // prepare the data
        let data = DataRequest::clean_and_validate_str(data, ValidateArgs::for_non_portable(is_live))?;
        let data = FingerprintedDataRequest::build(state, data, &sv.id).await?;

        // prepare the documents
        let documents = try_join_all(
            documents
                .into_iter()
                .map(|(doc_kind, (mime_type, filters, pii))| {
                    encrypt_document(
                        state,
                        pii,
                        filters,
                        doc_kind,
                        mime_type,
                        sv.fp_id.clone(),
                        sv.tenant_id.clone(),
                        is_live,
                    )
                }),
        )
        .await?;

        let source = auth.dl_source();
        let actor = auth.actor();
        state
            .db_pool
            .db_transaction(move |conn| -> FpResult<_> {
                let vault = Vault::get(conn, &sv.id)?;

                let insight_event_id = insight.insert_with_conn(conn)?.id;

                let targets: Vec<DataIdentifier> = data
                    .keys()
                    .cloned()
                    .chain(documents.iter().map(|d| DataIdentifier::Document(d.kind.clone())))
                    .collect();

                let aeid = AuditEventId::generate();
                NewAccessEventRow {
                    id: aeid.clone().into_correlated_access_event_id(),
                    scoped_vault_id: sv.id.clone(),
                    tenant_id: sv.tenant_id.clone(),
                    is_live: sv.is_live,
                    reason: None,
                    principal: principal.clone(),
                    insight_event_id: insight_event_id.clone(),
                    kind: AccessEventKind::Update,
                    targets: targets.clone(),
                    purpose: DecryptionContext::VaultProxy,
                }
                .create(conn)?;

                NewAuditEvent {
                    id: aeid,
                    tenant_id: sv.tenant_id,
                    principal_actor: principal,
                    insight_event_id,
                    detail: AuditEventDetail::UpdateUserData {
                        is_live: sv.is_live,
                        scoped_vault_id: sv.id.clone(),
                        updated_fields: targets,
                    },
                }
                .create(conn)?;

                // put our data
                if !data.is_empty() {
                    let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &sv.id)?;
                    let sources = DataLifetimeSources::single(source);
                    uvw.patch_data(conn, data, sources, Some(actor.clone()))?;
                }

                // put our documents
                if !documents.is_empty() {
                    match vault.kind {
                        newtypes::VaultKind::Person => {
                            let uvw: utils::vault_wrapper::WriteableVw<Person> =
                                VaultWrapper::<Person>::lock_for_onboarding(conn, &sv.id)?;
                            let _ = documents
                                .into_iter()
                                .map(
                                    |EncryptedDocumentToStore {
                                         e_data_key,
                                         s3_url,
                                         kind,
                                         filename,
                                         mime_type,
                                     }| {
                                        uvw.put_document_unsafe(
                                            conn,
                                            kind.into(),
                                            mime_type,
                                            filename,
                                            e_data_key,
                                            s3_url,
                                            source,
                                            Some(actor.clone()),
                                            true,
                                        )
                                    },
                                )
                                .collect::<Result<Vec<_>, _>>()?;
                        }
                        newtypes::VaultKind::Business => {
                            // TODO: support business document vaulting?
                        }
                    }
                }

                Ok(())
            })
            .await?;
    }

    Ok(())
}

struct EncryptedDocumentToStore {
    e_data_key: SealedVaultDataKey,
    s3_url: S3Url,
    kind: DocumentDiKind,
    filename: String,
    mime_type: String,
}

#[allow(clippy::too_many_arguments)]
/// helper function to seal document images and push to document store
/// returns storage information for vault wrapper
async fn encrypt_document(
    state: &State,
    file_data: PiiString,
    filters: DataTransforms,
    doc_kind: DocumentDiKind,
    mime_type: Option<&String>,
    fp_id: FpId,
    tenant_id: TenantId,
    is_live: bool,
) -> FpResult<EncryptedDocumentToStore> {
    let (vault, scoped_vault) = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let scoped_vault = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let vault = Vault::get(conn, &scoped_vault.id)?;
            Ok((vault, scoped_vault))
        })
        .await?;

    let file_data = file_data.try_decode_base64().map_err(crypto::Error::from)?;

    // apply the filters on the raw file bytes
    let file_transformed = filters.apply(file_data.into_leak()).map(PiiBytes::new)?;

    let file = utils::file_upload::FileUpload::new_simple(
        file_transformed,
        format!("{}", doc_kind),
        mime_type.as_ref().map(|s| s.as_str()).unwrap_or("image/png"),
    );

    let di = doc_kind.clone().into();
    let (e_data_key, s3_url) =
        utils::vault_wrapper::seal_file_and_upload_to_s3(state, &file, &di, &vault, &scoped_vault.id).await?;

    Ok(EncryptedDocumentToStore {
        e_data_key,
        s3_url,
        kind: doc_kind,
        filename: file.filename,
        mime_type: file.mime_type,
    })
}
