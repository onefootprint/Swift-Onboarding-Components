use crate::errors::{ApiError, ApiResult};
use crate::ApiErrorKind;
use derive_more::{Deref, DerefMut};
use newtypes::output::Csv;
use newtypes::{DataIdentifier, FilterFunction, PiiBytes, PiiJsonValue, PiiString, VaultDataFormat};
use std::collections::HashMap;

pub enum Pii {
    Value(PiiJsonValue),
    Bytes(PiiBytes),
}

impl Pii {
    // TODO it would be nice if the input to this weren't a PiiString - a different newtypes
    // that represents the raw format of data from the vault
    pub fn format(v: PiiString, format: VaultDataFormat) -> Self {
        Pii::Value(v.str_or_json(format))
    }
}

/// The operation perfomed by the enclave
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct EnclaveDecryptOperation {
    pub identifier: DataIdentifier,
    pub transforms: Vec<FilterFunction>,
}

impl EnclaveDecryptOperation {
    pub fn is_identity_transform(&self) -> bool {
        self.transforms.is_empty()
    }
}

impl EnclaveDecryptOperation {
    pub fn new(identifier: DataIdentifier, transforms: Vec<FilterFunction>) -> Self {
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
                    // Since the value may be either JSON or a string, we map it into a string representation here
                    // One day, the callers of this may actually want the full PiiJsonValue - then we'll
                    // use the below map_to_piijsonvalues
                    Pii::Value(s) => s.to_piistring()?,
                    Pii::Bytes(b) => {
                        if k.is_identity_transform() {
                            b.into_base64_pii()
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

    pub(in crate::utils::vault_wrapper) fn map_to_piijsonvalues(
        self,
    ) -> ApiResult<DecryptUncheckedResult<PiiJsonValue>> {
        let DecryptUncheckedResult {
            results,
            decrypted_dis,
        } = self;
        // Map the PiiBytes to PiiJsonValues
        let results = results
            .into_iter()
            .map(|(k, v)| -> ApiResult<_> {
                let pii = match v {
                    Pii::Value(s) => s,
                    Pii::Bytes(b) => {
                        let v_string = if k.is_identity_transform() {
                            b.into_base64_pii()
                        } else {
                            PiiString::try_from(b)?
                        };
                        PiiJsonValue::from_piistring(v_string)
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

    fn rm<D: Into<DataIdentifier>>(
        &mut self,
        di: D,
        transforms: Vec<FilterFunction>,
    ) -> ApiResult<PiiString> {
        let di = di.into();
        self.results
            .remove(&EnclaveDecryptOperation::new(di.clone(), transforms.clone()))
            .ok_or(ApiErrorKind::MissingRequiredEntityData(di, Csv(transforms)))
            .map_err(ApiError::from)
    }

    pub fn get_di<D: Into<DataIdentifier>>(&self, di: D) -> ApiResult<PiiString> {
        self.get(di, vec![])
    }

    fn get<D: Into<DataIdentifier>>(&self, di: D, transforms: Vec<FilterFunction>) -> ApiResult<PiiString> {
        let di = di.into();
        self.results
            .get(&EnclaveDecryptOperation::new(di.clone(), transforms.clone()))
            .cloned()
            .ok_or(ApiErrorKind::MissingRequiredEntityData(di, Csv(transforms)))
            .map_err(ApiError::from)
    }
}
