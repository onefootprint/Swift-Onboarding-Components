use super::super::VaultWrapper;
use super::{DecryptUncheckedResult, EnclaveDecryptOperation, Pii};
use crate::enclave_client::EnclaveClient;
use crate::errors::ApiResult;
use db::VaultedData;
use either::Either;
use enclave_proxy::DataTransform;
use enclave_proxy::{DataTransformer, DataTransforms};
use itertools::Itertools;
use newtypes::{DataIdentifier, DocumentKind, PiiBytes, PiiString};
use std::collections::HashMap;

impl<Type> VaultWrapper<Type> {
    /// Like `fn_decrypt_unchecked` but with no transform
    pub async fn decrypt_unchecked(
        &self,
        enclave_client: &EnclaveClient,
        ids: &[DataIdentifier],
    ) -> ApiResult<DecryptUncheckedResult> {
        let ids: Vec<_> = ids.iter().map(|di| (di.clone(), vec![])).collect();
        self.fn_decrypt_unchecked(enclave_client, ids).await
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
        ids: Vec<(DataIdentifier, Vec<DataTransform>)>,
    ) -> ApiResult<DecryptUncheckedResult> {
        let DecryptUncheckedResult {
            results,
            decrypted_dis,
        } = self.fn_decrypt_unchecked_raw(enclave_client, ids).await?;

        // Map the PiiBytes to PiiStrings
        let results = results
            .into_iter()
            .map(|(k, v)| -> ApiResult<_> {
                let pii = match v {
                    Pii::String(s) => s,
                    Pii::Bytes(b) => {
                        if k.is_identity_transform() {
                            b.into_leak_base64_pii()
                        } else {
                            PiiString::try_from(b)?
                        }
                    }
                };
                Ok((k, pii))
            })
            .collect::<ApiResult<_>>()?;

        let result = DecryptUncheckedResult {
            results,
            decrypted_dis,
        };
        Ok(result)
    }

    /// Decrypts the requested DIs and applies the corresponding transforms WITHOUT checking
    /// decryption permissions.
    /// Returns either PiiBytes or PiiString for each entry
    #[tracing::instrument("VaultWrapper::fn_decrypt_unchecked_raw", skip_all)]
    pub async fn fn_decrypt_unchecked_raw(
        &self,
        enclave_client: &EnclaveClient,
        ids: Vec<(DataIdentifier, Vec<DataTransform>)>,
    ) -> ApiResult<DecryptUncheckedResult<Pii>> {
        tracing::info!(dis=?ids.iter().map(|(di, _)| di.clone()).collect_vec(), "Decrypting DIs");

        // Fetch each DI's underlying data from the vault wrapper's in-memory state
        let datas = ids
            .clone()
            .into_iter()
            .flat_map(|(di, transform)| {
                self.get_vaulted_data(di.clone())
                    .map(|d| (d, EnclaveDecryptOperation::new(di, transform)))
            })
            .collect_vec();

        // Split data into p_data, e_data, e_large_data, as each have different "decryption" methods
        let (p_data, e_data): (Vec<_>, Vec<_>) = datas.into_iter().partition_map(|(d, op)| match d {
            VaultedData::NonPrivate(p_data) => Either::Left((p_data, op)),
            VaultedData::Sealed(e_data) => Either::Right(Either::Left((e_data, op))),
            VaultedData::LargeSealed(s3_url, e_data_key) => {
                Either::Right(Either::Right(((e_data_key, s3_url), op)))
            }
        });
        let (e_data, e_large_data): (Vec<_>, Vec<_>) = e_data.into_iter().partition_map(|x| x);

        // Handle p_data
        let p_data = {
            p_data
                .into_iter()
                .map(|(p_data, op)| -> ApiResult<_> {
                    // We apply the data transforms for p_data outside of the enclave here.
                    let p_data = p_data.leak();
                    let transformed = DataTransforms(op.transforms.clone()).apply_str::<PiiString>(p_data)?;
                    Ok((op, Pii::String(transformed)))
                })
                .collect::<ApiResult<Vec<_>>>()?
        };

        // Handle e_data
        let e_data: HashMap<_, _> = if e_data.is_empty() {
            HashMap::new() // short-circuit to avoid network requests
        } else {
            let data_to_decrypt = e_data
                .into_iter()
                .map(|(e_data, op)| (op.clone(), e_data, op.transforms))
                .collect();
            // decrypt remaining e_data
            enclave_client
                .batch_decrypt_to_piistring(data_to_decrypt, &self.vault.e_private_key)
                .await?
                .into_iter()
                .map(|(k, v)| (k, Pii::String(v)))
                .collect()
        };

        // Handle e_large_data
        let e_large_data = if e_large_data.is_empty() {
            HashMap::new() // short-circuit to avoid network requests
        } else {
            let (document_datas, operations): (Vec<_>, Vec<_>) = e_large_data.into_iter().unzip();
            let decrypted_documents: Vec<PiiBytes> = enclave_client
                .batch_decrypt_documents(&self.vault.e_private_key, document_datas)
                .await?;

            // Zip operations back with the decrypted documents, which are returned in order
            operations
                .into_iter()
                .zip(decrypted_documents)
                .map(|(op, pii_bytes)| -> ApiResult<_> {
                    // Apply the document transforms inline since we decrypt the document outside of
                    // the enclave
                    let transformed = DataTransforms(op.transforms.clone()).apply(pii_bytes.into_leak())?;
                    let pii = Pii::Bytes(PiiBytes::new(transformed));
                    Ok((op, pii))
                })
                .collect::<ApiResult<HashMap<_, _>>>()?
        };

        // We don't want to make access events for the DIs that are already in plaintext
        let decrypted_dis = e_data.keys().chain(e_large_data.keys()).cloned().collect();

        // Join all the different types of decrypted data into one HashMap
        let results = p_data
            .into_iter()
            .chain(e_data.into_iter())
            .chain(e_large_data.into_iter())
            .collect();
        let results = DecryptUncheckedResult {
            results,
            decrypted_dis,
        };
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
}
