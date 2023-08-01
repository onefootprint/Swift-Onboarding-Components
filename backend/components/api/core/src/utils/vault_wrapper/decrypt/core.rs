use super::super::VaultWrapper;
use super::{DecryptUncheckedResult, EnclaveDecryptOperation, Pii};
use crate::enclave_client::{DecryptReq, EnclaveClient};
use crate::errors::enclave::EnclaveError;
use crate::errors::ApiResult;
use db::VaultedData;
use either::Either;
use enclave_proxy::{DataTransformer, DataTransforms};
use futures_util::StreamExt;
use itertools::Itertools;
use newtypes::output::Csv;
use newtypes::{DataIdentifier, DocumentKind, EncryptedVaultPrivateKey, PiiBytes, PiiString};
use std::collections::HashMap;

impl<Type> VaultWrapper<Type> {
    /// Like `fn_decrypt_unchecked` but with no transform
    pub async fn decrypt_unchecked(
        &self,
        enclave_client: &EnclaveClient,
        ops: &[DataIdentifier],
    ) -> ApiResult<DecryptUncheckedResult> {
        let ops: Vec<_> = ops.iter().map(|di| di.clone().into()).collect();
        self.fn_decrypt_unchecked(enclave_client, ops).await
    }

    /// Get the VaultedData for the provided id, if exists. This also includes strange logic to
    /// get the mime type
    fn get_vaulted_data(&self, di: DataIdentifier) -> Option<VaultedData> {
        // This is weird - get the mime type from the document row
        if let &DataIdentifier::Document(DocumentKind::MimeType(doc_kind, side)) = &di {
            let di: DataIdentifier = DocumentKind::from_id_doc_kind(doc_kind, side).into();
            let speculative_doc = self.speculative.documents.iter().find(|d| d.kind == di);
            let portable_doc = || self.portable.documents.iter().find(|d| d.kind == di);
            let document = speculative_doc.or_else(portable_doc)?;
            return Some(VaultedData::NonPrivate(&document.mime_type));
        }
        self.get(di).map(|v| v.data())
    }

    /// Util to transform decrypt a list of DataIdentifiers WITHOUT checking permissions or making an access
    /// event.
    ///
    /// Returns a hashmap of identifiers to their decrypted PiiString.
    /// Note: a provided id may not be included as a key in the resulting hashmap if the identifier
    /// doesn't exist in the UVW.
    #[tracing::instrument("VaultWrapper::fn_decrypt_unchecked", skip_all)]
    pub async fn fn_decrypt_unchecked(
        &self,
        enclave_client: &EnclaveClient,
        ops: Vec<EnclaveDecryptOperation>,
    ) -> ApiResult<DecryptUncheckedResult> {
        let results = self
            .fn_decrypt_unchecked_raw(enclave_client, ops)
            .await?
            .map_to_piistrings()?;
        Ok(results)
    }

    /// Decrypts the requested DIs and applies the corresponding transforms WITHOUT checking
    /// decryption permissions.
    /// Returns either PiiBytes or PiiString for each entry
    #[tracing::instrument("VaultWrapper::fn_decrypt_unchecked_raw", skip_all)]
    pub async fn fn_decrypt_unchecked_raw(
        &self,
        enclave_client: &EnclaveClient,
        ops: Vec<EnclaveDecryptOperation>,
    ) -> ApiResult<DecryptUncheckedResult<Pii>> {
        // Fetch each DI's underlying data from the vault wrapper's in-memory state
        let datas = self
            .decrypt_requests(ops)
            .into_iter()
            // Use the unit type as the key for the hashmap, since we don't care about the key
            .map(|req| ((), req))
            .collect();
        let (_, results) = batch_execute_decrypt_requests(enclave_client, datas)
            .await?
            .into_iter()
            .next()
            .unwrap_or_default();
        Ok(results)
    }

    /// Util to decrypt a DataIdentifier WITHOUT checking permissions or making an access event.
    pub async fn decrypt_unchecked_single(
        &self,
        enclave_client: &EnclaveClient,
        id: DataIdentifier,
    ) -> ApiResult<Option<PiiString>> {
        let result = self
            .decrypt_unchecked(enclave_client, &[id])
            .await?
            .results
            .into_iter()
            .next()
            .map(|(_, pii)| pii);
        Ok(result)
    }

    pub(in crate::utils::vault_wrapper) fn decrypt_requests(
        &self,
        ops: Vec<EnclaveDecryptOperation>,
    ) -> Vec<VwDecryptRequest> {
        tracing::info!(dis=%Csv::from(ops.iter().map(|op| op.identifier.clone()).collect_vec()), "Decrypting DIs");

        // Fetch each DI's underlying data from the vault wrapper's in-memory state
        ops.into_iter()
            .flat_map(|op| {
                self.get_vaulted_data(op.identifier.clone())
                    .map(|d| VwDecryptRequest(&self.vault.e_private_key, op, d))
            })
            .collect_vec()
    }
}

pub(in crate::utils::vault_wrapper) struct VwDecryptRequest<'a>(
    &'a EncryptedVaultPrivateKey,
    EnclaveDecryptOperation,
    VaultedData<'a>,
);

const BATCH_DECRYPT_CHUNK_SIZE: usize = 500;

/// Executes a batch of decrypt requests for potentially multiple users, returning a hashmap of identifiers to their decrypted values
#[tracing::instrument("batch_execute_decrypt_requests", skip_all)]
pub(in crate::utils::vault_wrapper) async fn batch_execute_decrypt_requests<'a, T>(
    enclave_client: &EnclaveClient,
    data: Vec<(T, VwDecryptRequest<'a>)>,
) -> ApiResult<HashMap<T, DecryptUncheckedResult<Pii>>>
where
    T: std::hash::Hash + Eq + Clone,
{
    // Split data into p_data, e_data, e_large_data, as each have different "decryption" methods
    let (p_data, e_data): (Vec<_>, Vec<_>) =
        data.into_iter()
            .partition_map(|(id, VwDecryptRequest(e_private_key, op, d))| match d {
                VaultedData::NonPrivate(p_data) => Either::Left(((id, op), p_data)),
                VaultedData::Sealed(e_data) => Either::Right(Either::Left((
                    (id, op.clone()),
                    DecryptReq(e_private_key, e_data, op.transforms),
                ))),
                VaultedData::LargeSealed(s3_url, e_data_key) => {
                    Either::Right(Either::Right(((id, op), (e_private_key, e_data_key, s3_url))))
                }
            });
    let (e_data, e_large_data): (Vec<_>, Vec<_>) = e_data.into_iter().partition_map(|x| x);

    // Handle p_data
    let p_data = {
        p_data
            .into_iter()
            .map(|((id, op), p_data)| -> ApiResult<_> {
                // We apply the data transforms for p_data outside of the enclave here.
                let p_data = p_data.leak();
                let transformed = DataTransforms(op.transforms.clone()).apply_str::<PiiString>(p_data)?;
                Ok((id, (op, Pii::String(transformed))))
            })
            .collect::<ApiResult<Vec<_>>>()?
    };

    // Handle e_data
    let e_data = if e_data.is_empty() {
        vec![] // short-circuit to avoid network requests
    } else {
        let result_futs = e_data
            .into_iter()
            .chunks(BATCH_DECRYPT_CHUNK_SIZE)
            .into_iter()
            .map(|c| enclave_client.batch_decrypt_to_piistring(c.into_iter().collect()))
            .collect_vec();
        futures::stream::iter(result_futs)
            .buffer_unordered(4)
            .collect::<Vec<_>>()
            .await
            .into_iter()
            .collect::<Result<Vec<_>, EnclaveError>>()?
            .into_iter()
            .flatten()
            .map(|((id, op), d)| (id, (op, Pii::String(d))))
            .collect()
    };

    // Handle e_large_data
    let e_large_data = if e_large_data.is_empty() {
        vec![] // short-circuit to avoid network requests
    } else {
        let result_futs = e_large_data
            .into_iter()
            .chunks(BATCH_DECRYPT_CHUNK_SIZE)
            .into_iter()
            .map(|c| enclave_client.batch_decrypt_documents(c.into_iter().collect()))
            .collect_vec();
        futures::stream::iter(result_futs)
            .buffer_unordered(4)
            .collect::<Vec<_>>()
            .await
            .into_iter()
            .collect::<ApiResult<Vec<_>>>()?
            .into_iter()
            .flatten()
            .map(|((id, op), pii_bytes)| -> ApiResult<_> {
                // Apply the document transforms inline since we decrypt the document outside of
                // the enclave
                let transformed = DataTransforms(op.transforms.clone()).apply(pii_bytes.into_leak())?;
                let pii = Pii::Bytes(PiiBytes::new(transformed));
                Ok((id, (op, pii)))
            })
            .collect::<ApiResult<Vec<_>>>()?
    };

    // We don't want to make access events for the DIs that are already in plaintext - track which
    // DIs were decrypted per ID
    let mut decrypted_dis: HashMap<_, _> = e_data
        .iter()
        .chain(e_large_data.iter())
        .map(|(id, (op, _))| (id.clone(), op.clone()))
        .into_group_map();

    // Group all results by ID
    let results = p_data
        .into_iter()
        .chain(e_data.into_iter())
        .chain(e_large_data.into_iter())
        .into_group_map()
        .into_iter()
        .map(|(id, results)| {
            let decrypted_dis = decrypted_dis.remove(&id).unwrap_or_default();
            let results = DecryptUncheckedResult {
                results: results.into_iter().collect(),
                decrypted_dis,
            };
            (id, results)
        })
        .collect();

    Ok(results)
}
