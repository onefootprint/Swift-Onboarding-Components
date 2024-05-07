use super::{super::VaultWrapper, DecryptUncheckedResult, EnclaveDecryptOperation, Pii};
use crate::{
    enclave_client::{DecryptReq, EnclaveClient},
    errors::{enclave::EnclaveError, ApiResult},
    proxy::get_transformer,
};
use db::VaultedData;
use either::Either;
use enclave_proxy::DataTransformer;
use futures_util::StreamExt;
use itertools::Itertools;
use newtypes::{
    output::Csv, DataIdentifier, DocumentDiKind, EncryptedVaultPrivateKey, PiiBytes, PiiJsonValue, PiiString,
    VaultDataFormat,
};
use std::collections::HashMap;

impl<Type> VaultWrapper<Type> {
    /// Util to transform decrypt a list of DataIdentifiers WITHOUT checking permissions or making an access
    /// event.
    ///
    /// Returns a hashmap of identifiers to their decrypted PiiString.
    /// Note: a provided id may not be included as a key in the resulting hashmap if the identifier
    /// doesn't exist in the UVW.
    pub async fn decrypt_unchecked(
        &self,
        enclave_client: &EnclaveClient,
        ops: &[DataIdentifier],
    ) -> ApiResult<DecryptUncheckedResult> {
        let results = self
            ._decrypt_unchecked_raw(enclave_client, ops)
            .await?
            .map_to_piistrings()?;
        Ok(results)
    }

    /// Same as decrypt_unchecked, but more modern version that returns PiiJsonValues instead of PiiStrings
    pub async fn decrypt_unchecked_value(
        &self,
        enclave_client: &EnclaveClient,
        ops: &[DataIdentifier],
    ) -> ApiResult<DecryptUncheckedResult<PiiJsonValue>> {
        let results = self
            ._decrypt_unchecked_raw(enclave_client, ops)
            .await?
            .map_to_piijsonvalues()?;
        Ok(results)
    }

    async fn _decrypt_unchecked_raw(
        &self,
        enclave_client: &EnclaveClient,
        ops: &[DataIdentifier],
    ) -> ApiResult<DecryptUncheckedResult<Pii>> {
        let ops: Vec<_> = ops.iter().map(|di| di.clone().into()).collect();
        let results = self.fn_decrypt_unchecked_raw(enclave_client, ops).await?;
        Ok(results)
    }

    /// Get the VaultedData for the provided id, if exists. This also includes strange logic to
    /// get the mime type
    fn get_vaulted_data(&self, di: &DataIdentifier) -> Option<VaultedData> {
        // This is weird - get the mime type from the document row
        if let &DataIdentifier::Document(DocumentDiKind::MimeType(doc_kind, side)) = di {
            let di: DataIdentifier = DocumentDiKind::from_id_doc_kind(doc_kind, side).into();
            let document = self.data(&di)?.doc()?;
            return Some(VaultedData::NonPrivate(
                &document.mime_type,
                VaultDataFormat::String,
            ));
        }
        self.get(di).map(|v| v.data())
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
        tracing::info!(dis=?Csv::from(ops.clone()), "Decrypting DIs");

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
        // Fetch each DI's underlying data from the vault wrapper's in-memory state
        ops.into_iter()
            .flat_map(|op| {
                self.get_vaulted_data(&op.identifier)
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
                VaultedData::NonPrivate(p_data, format) => Either::Left(((id, op, format), p_data)),
                VaultedData::Sealed(e_data, format) => Either::Right(Either::Left((
                    (id, op.clone(), format),
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
            .map(|((id, op, format), p_data)| -> ApiResult<_> {
                // We apply the data transforms for p_data outside of the enclave here.
                let p_data = p_data.leak();
                let transformed = get_transformer(&op.transforms).apply_str::<PiiString>(p_data)?;
                Ok((id, (op, Pii::format(transformed, format))))
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
            .map(|((id, op, format), d)| (id, (op, Pii::format(d, format))))
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
                let transformed = get_transformer(&op.transforms).apply(pii_bytes.into_leak())?;
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
