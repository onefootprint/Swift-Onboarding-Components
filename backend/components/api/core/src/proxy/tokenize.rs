use super::IngressRule;
use crate::auth::tenant::TenantAuth;
use crate::errors::ApiResult;
use crate::utils;
use crate::utils::headers::InsightHeaders;
use crate::utils::vault_wrapper::Any;
use crate::utils::vault_wrapper::Person;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use db::models::access_event::NewAccessEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::Vault;
use either::Either;
use futures::future::try_join_all;
use itertools::Itertools;
use newtypes::AccessEventKind;
use newtypes::DataIdentifier;
use newtypes::DataRequest;
use newtypes::DocumentKind;
use newtypes::FpId;
use newtypes::PiiString;
use newtypes::SealedVaultDataKey;
use newtypes::StorageType;
use newtypes::TenantId;
use newtypes::ValidateArgs;
use std::collections::HashMap;

/// Vaults PII values
/// writes the PII token values to the vault
/// NOTE: we only limit proxy vaulting custom PII data
pub async fn vault_pii(
    state: &State,
    auth: &dyn TenantAuth,
    values: HashMap<IngressRule, PiiString>,
    insights: InsightHeaders,
) -> ApiResult<()> {
    // no need to DB ops if no ingress to vault
    if values.is_empty() {
        return Ok(());
    }
    // split by fp_id
    let values_by_user = values
        .into_iter()
        .map(|(rule, pii)| (rule.proxy_token.fp_id.clone(), (rule.proxy_token.identifier, pii)))
        .into_group_map();

    for (fp_id, values) in values_by_user {
        let tenant_id = auth.tenant().id.clone();
        let is_live = auth.is_live()?;
        let principal = auth.actor().into();
        let insight = CreateInsightEvent::from(insights.clone());

        // build the update request
        let (data, documents): (Vec<_>, Vec<_>) = values.into_iter().partition_map(|(di, value)| match di {
            DataIdentifier::Document(doc_kind) => match doc_kind.storage_type() {
                StorageType::VaultData => Either::Left((di, value)),
                StorageType::S3 => Either::Right((doc_kind, value)),
            },
            DataIdentifier::InvestorProfile(_)
            | DataIdentifier::Business(_)
            | DataIdentifier::Id(_)
            | DataIdentifier::Custom(_)
            | DataIdentifier::Card(_) => Either::Left((di, value)),
        });

        let data: HashMap<_, _> = data.into_iter().collect();
        let documents: HashMap<_, _> = documents.into_iter().collect();

        // skip empty ingress
        if data.is_empty() && documents.is_empty() {
            continue;
        }

        // prepare the data
        let data = DataRequest::clean_and_validate(data, ValidateArgs::for_non_portable(is_live))?;
        let data = data.build_tenant_fingerprints(state, &tenant_id).await?;

        // prepare the documents
        let documents = try_join_all(documents.into_iter().map(|(doc_kind, pii)| {
            encrypt_document(state, pii, doc_kind, fp_id.clone(), tenant_id.clone(), is_live)
        }))
        .await?;

        state
            .db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let scoped_vault = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
                let vault = Vault::get(conn, &scoped_vault.id)?;

                NewAccessEvent {
                    scoped_vault_id: scoped_vault.id.clone(),
                    reason: None,
                    principal,
                    insight,
                    kind: AccessEventKind::Update,
                    targets: data
                        .keys()
                        .cloned()
                        .chain(documents.iter().map(|d| DataIdentifier::Document(d.kind)))
                        .collect(),
                }
                .create(conn)?;

                // put our data
                if !data.is_empty() {
                    let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &scoped_vault.id)?;
                    uvw.patch_data(conn, data)?;
                }

                // put our documents
                if !documents.is_empty() {
                    match vault.kind {
                        newtypes::VaultKind::Person => {
                            let uvw: utils::vault_wrapper::WriteableVw<Person> =
                                VaultWrapper::<Person>::lock_for_onboarding(conn, &scoped_vault.id)?;
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
                                            conn, kind, mime_type, filename, e_data_key, s3_url,
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
    s3_url: String,
    kind: DocumentKind,
    filename: String,
    mime_type: String,
}

/// helper function to seal document images and push to document store
/// returns storage information for vault wrapper
async fn encrypt_document(
    state: &State,
    file_data: PiiString,
    doc_kind: DocumentKind,
    fp_id: FpId,
    tenant_id: TenantId,
    is_live: bool,
) -> ApiResult<EncryptedDocumentToStore> {
    let (vault, scoped_vault) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let scoped_vault = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let vault = Vault::get(conn, &scoped_vault.id)?;
            Ok((vault, scoped_vault))
        })
        .await??;

    let file = utils::file_upload::FileUpload::new_simple(
        file_data.try_decode_base64().map_err(crypto::Error::from)?,
        format!("{}", doc_kind),
        "image", // todo: have a way to specify an image for vaulting
    );

    let (e_data_key, s3_url) = utils::vault_wrapper::encrypt_to_s3(
        state,
        &file,
        doc_kind,
        &vault.public_key,
        &vault.id,
        &scoped_vault.id,
    )
    .await?;

    Ok(EncryptedDocumentToStore {
        e_data_key,
        s3_url,
        kind: doc_kind,
        filename: file.filename,
        mime_type: file.mime_type,
    })
}
