use crate::errors::{ApiError, ApiResult};
use crate::ApiErrorKind;
use derive_more::{Deref, DerefMut};
use enclave_proxy::DataTransform;
use newtypes::output::Csv;
use newtypes::{DataIdentifier, PiiBytes, PiiString};
use std::collections::HashMap;

pub enum Pii {
    String(PiiString),
    Bytes(PiiBytes),
}

/// The operation perfomed by the enclave
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct EnclaveDecryptOperation {
    pub identifier: DataIdentifier,
    pub transforms: Vec<DataTransform>,
}

impl EnclaveDecryptOperation {
    pub fn is_identity_transform(&self) -> bool {
        self.transforms.is_empty() || self.transforms.iter().all(|t| t == &DataTransform::Identity)
    }
}

impl EnclaveDecryptOperation {
    pub fn new(identifier: DataIdentifier, transforms: Vec<DataTransform>) -> Self {
        EnclaveDecryptOperation {
            identifier,
            transforms,
        }
    }
}

#[derive(Deref, DerefMut)]
pub struct DecryptUncheckedResult<T = PiiString> {
    #[deref]
    #[deref_mut]
    pub results: HashMap<EnclaveDecryptOperation, T>,
    pub decrypted_dis: Vec<EnclaveDecryptOperation>,
}

impl<T> Default for DecryptUncheckedResult<T> {
    fn default() -> Self {
        DecryptUncheckedResult {
            results: HashMap::new(),
            decrypted_dis: vec![],
        }
    }
}

impl DecryptUncheckedResult {
    /// convenience method to ignore the transforms
    /// and just map results to DI <-> PII dictionary
    pub fn results_by_data_identifier(self) -> HashMap<DataIdentifier, PiiString> {
        self.results.into_iter().map(|(k, v)| (k.identifier, v)).collect()
    }
}

impl DecryptUncheckedResult<Pii> {
    pub(in crate::utils::vault_wrapper) fn map_to_piistrings(
        self,
    ) -> ApiResult<DecryptUncheckedResult<PiiString>> {
        let DecryptUncheckedResult {
            results,
            decrypted_dis,
        } = self;
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
}

impl<D: Into<DataIdentifier>> From<D> for EnclaveDecryptOperation {
    fn from(value: D) -> Self {
        EnclaveDecryptOperation {
            identifier: value.into(),
            transforms: vec![],
        }
    }
}

impl DecryptUncheckedResult {
    pub fn rm_di<D: Into<DataIdentifier>>(&mut self, di: D) -> ApiResult<PiiString> {
        self.rm(di, vec![])
    }

    fn rm<D: Into<DataIdentifier>>(&mut self, di: D, transforms: Vec<DataTransform>) -> ApiResult<PiiString> {
        let di = di.into();
        self.results
            .remove(&EnclaveDecryptOperation::new(di.clone(), transforms.clone()))
            .ok_or(ApiErrorKind::MissingRequiredEntityData(di, Csv(transforms)))
            .map_err(ApiError::from)
    }

    pub fn get_di<D: Into<DataIdentifier>>(&self, di: D) -> ApiResult<PiiString> {
        self.get(di, vec![])
    }

    fn get<D: Into<DataIdentifier>>(&self, di: D, transforms: Vec<DataTransform>) -> ApiResult<PiiString> {
        let di = di.into();
        self.results
            .get(&EnclaveDecryptOperation::new(di.clone(), transforms.clone()))
            .cloned()
            .ok_or(ApiErrorKind::MissingRequiredEntityData(di, Csv(transforms)))
            .map_err(ApiError::from)
    }
}
