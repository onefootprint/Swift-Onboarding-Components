use super::{Business, VaultWrapper};
use crate::enclave_client::EnclaveClient;
use crate::errors::business::BusinessError;
use crate::errors::user::UserError;
use crate::errors::{ApiError, ApiResult, AssertionError};
use crate::State;
use db::models::business_owner::{BusinessOwner, UserData};
use db::models::contact_info::ContactInfo;
use db::models::vault_data::VaultedData;
use db::DbPool;
use derive_more::{Deref, DerefMut};
use either::Either;
use enclave_proxy::DataTransform;
use itertools::Itertools;
use newtypes::{
    BusinessDataKind as BDK, BusinessOwnerData, BusinessOwnerKind, DataIdentifier, DocumentKind,
    IdentityDataKind as IDK, KycedBusinessOwnerData, ObConfigurationId, PhoneNumber, PiiBytes, PiiString,
    StorageType,
};
use std::collections::HashMap;

#[derive(Deref, DerefMut)]
pub struct DecryptUncheckedResult {
    #[deref]
    #[deref_mut]
    pub results: HashMap<DataIdentifier, PiiString>,
    pub decrypted_dis: Vec<DataIdentifier>,
}

impl DecryptUncheckedResult {
    pub fn rm<D: Into<DataIdentifier>>(&mut self, di: D) -> ApiResult<PiiString> {
        let di = di.into();
        self.results
            .remove(&di)
            .ok_or(ApiError::MissingRequiredEntityData(di))
    }
}

impl<Type> VaultWrapper<Type> {
    /// Util to decrypt a list of DataIdentifiers WITHOUT checking permissions or making an access
    /// event.
    ///
    /// Returns a hashmap of identifiers to their decrypted PiiString.
    /// Note: a provided id may not be included as a key in the resulting hashmap if the identifier
    /// doesn't exist in the UVW.
    pub async fn decrypt_unchecked(
        &self,
        enclave_client: &EnclaveClient,
        ids: &[DataIdentifier],
    ) -> ApiResult<DecryptUncheckedResult> {
        if ids.is_empty() {
            // Short-circuit so no network requests
            return Ok(DecryptUncheckedResult {
                results: HashMap::new(),
                decrypted_dis: vec![],
            });
        }

        // Split data identifiers by (document kinds, e_data kinds, p_data kinds)
        let (documents_kinds, remaining_dis): (Vec<_>, Vec<_>) = ids.iter().partition_map(|di| match di {
            DataIdentifier::Document(kind) if matches!(kind.storage_type(), StorageType::DocumentData) => {
                either::Either::Left(kind)
            }
            DataIdentifier::Document(DocumentKind::MimeType(doc_kind, side)) => {
                let doc_di = DocumentKind::from_id_doc_kind(*doc_kind, *side);
                let mime_type = self
                    .get_document(doc_di)
                    .map(|data| PiiString::from(&data.mime_type))
                    .map(|mt| Either::Right((di.clone(), mt)));
                either::Either::Right(mime_type)
            }
            _ => either::Either::Right(self.get_data(di.clone()).map(|data| match data {
                VaultedData::Sealed(e_data) => Either::Left((di.clone(), e_data)),
                VaultedData::NonPrivate(p_data) => Either::Right((di.clone(), p_data.clone())),
            })),
        });
        let (e_data, p_data): (_, Vec<_>) = remaining_dis.into_iter().flatten().partition_map(|x| x);

        // special case decrypt documents
        let documents: HashMap<DataIdentifier, PiiString> = {
            let (document_kinds, document_datas): (Vec<_>, _) = documents_kinds
                .into_iter()
                .filter_map(|kind| self.get_document(kind))
                .map(|doc| (doc.kind, (&doc.e_data_key, &doc.s3_url)))
                .unzip();

            let decrypted_documents: Vec<PiiString> = enclave_client
                .batch_decrypt_documents(&self.vault.e_private_key, document_datas)
                .await?
                .into_iter()
                .map(PiiBytes::into_leak_base64_pii)
                .collect();

            document_kinds
                .into_iter()
                .map(DataIdentifier::Document)
                .zip(decrypted_documents)
                .collect()
        };

        // decrypt remaining e_data
        let text = enclave_client
            .batch_decrypt_to_piistring(e_data, &self.vault.e_private_key, DataTransform::Identity)
            .await?;

        // TODO during our migration while we are moving sandbox_id to its own DI, re-add the suffix
        // back into the phone and email
        let text = if !self.vault.is_live {
            let sandbox_id = self
                .vault
                .sandbox_id
                .as_ref()
                .ok_or(AssertionError("Sandbox vault without sandbox id"))?;
            text.into_iter()
                .map(|(di, pii)| {
                    let pii = match di {
                        DataIdentifier::Id(IDK::PhoneNumber) | DataIdentifier::Id(IDK::Email) => {
                            PiiString::new(format!("{}#{}", pii.leak(), sandbox_id))
                        }
                        _ => pii,
                    };
                    (di, pii)
                })
                .collect()
        } else {
            text
        };

        // Don't make access events for the DIs that are already in plaintext
        let decrypted_dis = ids
            .iter()
            .filter(|di| !p_data.iter().any(|(d, _)| &d == di))
            .cloned()
            .collect();
        let results = documents
            .into_iter()
            .chain(text.into_iter())
            .chain(p_data.into_iter())
            .collect();

        let result = DecryptUncheckedResult {
            results,
            decrypted_dis,
        };
        // TODO add sandbox suffix to phone/email here
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
            .ok_or(ApiError::NoPhoneNumberForVault)?
            .lifetime_id
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
            .ok_or(ApiError::NoPhoneNumberForVault)?;
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
