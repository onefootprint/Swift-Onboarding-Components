use super::{Business, VaultWrapper};
use crate::enclave_client::EnclaveClient;
use crate::errors::business::BusinessError;
use crate::errors::user::UserError;
use crate::errors::{ApiError, ApiResult};
use crate::{ApiErrorKind, State};
use db::models::business_owner::{BusinessOwner, UserData};
use db::models::contact_info::ContactInfo;
use db::{DbPool, VaultedData};
use derive_more::{Deref, DerefMut};
use either::Either;
use enclave_proxy::DataTransform;
use enclave_proxy::{DataTransformer, DataTransforms};
use itertools::Itertools;
use newtypes::output::Csv;
use newtypes::{
    BusinessDataKind as BDK, BusinessOwnerData, BusinessOwnerKind, DataIdentifier, DocumentKind,
    IdentityDataKind as IDK, KycedBusinessOwnerData, ObConfigurationId, PhoneNumber, PiiBytes, PiiString,
};
use std::collections::HashMap;

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
pub struct DecryptUncheckedResult {
    #[deref]
    #[deref_mut]
    pub results: HashMap<EnclaveDecryptOperation, PiiString>,
    pub decrypted_dis: Vec<EnclaveDecryptOperation>,
}

impl DecryptUncheckedResult {
    /// convenience method to ignore the transforms
    /// and just map results to DI <-> PII dictionary
    pub fn results_by_data_identifier(self) -> HashMap<DataIdentifier, PiiString> {
        self.results.into_iter().map(|(k, v)| (k.identifier, v)).collect()
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

    pub fn rm<D: Into<DataIdentifier>>(
        &mut self,
        di: D,
        transforms: Vec<DataTransform>,
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

    pub fn get<D: Into<DataIdentifier>>(
        &self,
        di: D,
        transforms: Vec<DataTransform>,
    ) -> ApiResult<PiiString> {
        let di = di.into();
        self.results
            .get(&EnclaveDecryptOperation::new(di.clone(), transforms.clone()))
            .cloned()
            .ok_or(ApiErrorKind::MissingRequiredEntityData(di, Csv(transforms)))
            .map_err(ApiError::from)
    }
}

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
        if ids.is_empty() {
            // Short-circuit so no network requests
            return Ok(DecryptUncheckedResult {
                results: HashMap::new(),
                decrypted_dis: vec![],
            });
        }
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
                    Ok((op, transformed))
                })
                .collect::<ApiResult<Vec<_>>>()?
        };

        // Handle e_data
        let e_data = {
            let data_to_decrypt = e_data
                .into_iter()
                .map(|(e_data, op)| (op.clone(), e_data, op.transforms))
                .collect();
            // decrypt remaining e_data
            enclave_client
                .batch_decrypt_to_piistring(data_to_decrypt, &self.vault.e_private_key)
                .await?
        };

        // Handle e_large_data
        let e_large_data = {
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

                    // large objects by default may be binary so we always base64 encode them!
                    // UNLESS we apply a transform, then we take the result of the transform in any
                    // form it gives us as long as we can convert it to a string
                    let pii_string = if op.is_identity_transform() {
                        PiiBytes::new(transformed).into_leak_base64_pii()
                    } else {
                        PiiString::try_from(PiiBytes::new(transformed))?
                    };
                    Ok((op, pii_string))
                })
                .collect::<ApiResult<HashMap<_, _>>>()?
        };

        // Don't make access events for the DIs that are already in plaintext
        let decrypted_dis = e_data.keys().chain(e_large_data.keys()).cloned().collect();
        // Join all the different types of decrypted data into one HashMap
        let results = p_data
            .into_iter()
            .chain(e_data.into_iter())
            .chain(e_large_data.into_iter())
            .collect();

        let result = DecryptUncheckedResult {
            results,
            decrypted_dis,
        };
        Ok(result)
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

// TODO should we gate these permissions somehow? Make access events in these?
impl<Type> VaultWrapper<Type> {
    pub async fn get_decrypted_primary_phone(&self, state: &State) -> Result<PhoneNumber, ApiError> {
        let phone_lifetime_id = self
            .get(IDK::PhoneNumber)
            .ok_or(ApiErrorKind::NoPhoneNumberForVault)?
            .lifetime_id()
            .clone();
        let ci = state
            .db_pool
            .db_query(move |conn| ContactInfo::get(conn, &phone_lifetime_id))
            .await??;
        if !ci.is_verified {
            // Many of the communications we send out give either OTPs or links that allow authing
            // as the user. So, we want to make sure a tenant can't update the user's phonen number
            // and then send themselves OTPs. First, check that the phone number is verified to
            // be owned by the user
            return Err(UserError::PhoneNumberNotVerified.into());
        }

        let e164 = self
            .decrypt_unchecked_single(&state.enclave_client, IDK::PhoneNumber.into())
            .await?
            .ok_or(ApiErrorKind::NoPhoneNumberForVault)?;
        let phone_number = PhoneNumber::parse(e164)?;
        Ok(phone_number)
    }
}

#[allow(clippy::large_enum_variant)]
pub enum DecryptedBusinessOwners {
    // Either a Single-KYC or Multi-KYC KYB flow was started and a new Business Vault was created and a BusinessOwner and Person Vault/ScopedVault/Onboarding was created for the Primary BO
    // However, they dropped off before they submitted the BO's information so we have no BO VaultData for either the Primary or potential Secondary BO's
    KYBStart {
        primary_bo: BusinessOwner,
        primary_bo_vault: UserData,
    },
    // Single-KYC KYB flow after BO's information has been submitted. There is BDK::BeneficialOwners VaultData for both the Primary BO and the Secondary BO's
    SingleKYC {
        primary_bo: BusinessOwner,
        primary_bo_vault: UserData,
        primary_bo_data: BusinessOwnerData,
        secondary_bos: Vec<BusinessOwnerData>,
    },
    // Multi-KYC KYB flow after BO's information has been submitted. There is BDK::KycedBeneficialOwners VaultData for both the Primary BO and the Secondary BO's
    // There are also BusinessOwner's for every Secondary BO. For Secondary BO's that have started Bifrost, we will have a Person Vault/ScopedVault/Onboarding.
    MultiKYC {
        primary_bo: BusinessOwner,
        primary_bo_vault: UserData,
        primary_bo_data: KycedBusinessOwnerData,
        secondary_bos: Vec<(KycedBusinessOwnerData, BusinessOwner, Option<UserData>)>,
    },
}

impl VaultWrapper<Business> {
    pub async fn decrypt_business_owners(
        &self,
        db_pool: &DbPool,
        enclave_client: &EnclaveClient,
        ob_configuration_id: Option<ObConfigurationId>,
    ) -> ApiResult<DecryptedBusinessOwners> {
        let vid = self.vault().id.clone();
        let mut bos = db_pool
            .db_query(move |conn| -> ApiResult<_> {
                let bos = ob_configuration_id
                    .as_ref()
                // Non-portable vaults don't have any BOs
                .map(|ob_config_id| BusinessOwner::list(conn, &vid, ob_config_id))
                .transpose()?
                .unwrap_or_default();
                Ok(bos)
            })
            .await??;

        let dis = &[BDK::BeneficialOwners.into(), BDK::KycedBeneficialOwners.into()];
        let mut decrypted = self.decrypt_unchecked(enclave_client, dis).await?;
        let vault_bos = decrypted.remove(&BDK::BeneficialOwners.into());
        let vault_kyced_bos = decrypted.remove(&BDK::KycedBeneficialOwners.into());

        // Zip the "vault" and "DB" BOs depending on which kind of "vault" BOs exist
        match (vault_bos, vault_kyced_bos) {
            // Non-kyced BOs in the vault
            (Some(vault_bos), None) => {
                if bos.len() > 1 {
                    return Err(BusinessError::TooManyBos.into());
                }
                let pbo = bos.pop().ok_or(BusinessError::BoNotFound)?;
                let primary_bo = pbo.0;
                let primary_bo_vault = pbo.1.ok_or(BusinessError::PrimaryBoHasNoVault)?;
                let mut vault_bos: Vec<BusinessOwnerData> = vault_bos.deserialize()?;
                if vault_bos.is_empty() {
                    return Err(BusinessError::NoBos.into());
                }
                let primary_bo_data = vault_bos.remove(0);

                Ok(DecryptedBusinessOwners::SingleKYC {
                    primary_bo,
                    primary_bo_vault,
                    primary_bo_data,
                    secondary_bos: vault_bos,
                })
            }
            // KYCed BOs in the vault
            (None, Some(kyced_bos)) => {
                let kyced_bos: Vec<KycedBusinessOwnerData> = kyced_bos.deserialize()?;

                let mut bos: Vec<(KycedBusinessOwnerData, BusinessOwner, Option<UserData>)> = kyced_bos
                    .into_iter()
                    .map(|vault_bo| {
                        let bo = bos
                            .iter()
                            .find(|bo| bo.0.link_id == vault_bo.link_id)
                            .cloned()
                            .ok_or(BusinessError::BoNotFound)?;
                        Ok((vault_bo, bo.0, bo.1))
                    })
                    .collect::<Result<Vec<_>, BusinessError>>()?;

                let idx = bos
                    .iter()
                    .position(|b| b.1.kind == BusinessOwnerKind::Primary)
                    .ok_or(BusinessError::PrimaryBoNotFound)?;

                let pbo = bos.remove(idx);

                let primary_bo_data = pbo.0;
                let primary_bo = pbo.1;
                let primary_bo_vault = pbo.2.ok_or(BusinessError::PrimaryBoHasNoVault)?;

                Ok(DecryptedBusinessOwners::MultiKYC {
                    primary_bo,
                    primary_bo_vault,
                    primary_bo_data,
                    secondary_bos: bos,
                })
            }
            // No BOs in the vault - this only happens for incomplete onboardings where the BO in the DB
            // exists but the user abandoned before providing info on each BO in the vault
            (None, None) => {
                if bos.len() > 1 {
                    return Err(BusinessError::TooManyBos.into());
                }
                let pbo = bos.pop().ok_or(BusinessError::BoNotFound)?;
                let primary_bo = pbo.0;
                let primary_bo_vault = pbo.1.ok_or(BusinessError::PrimaryBoHasNoVault)?;

                Ok(DecryptedBusinessOwners::KYBStart {
                    primary_bo,
                    primary_bo_vault,
                })
            }
            (Some(_), Some(_)) => Err(BusinessError::KycedAndNonKycedBos.into()),
        }
    }
}
