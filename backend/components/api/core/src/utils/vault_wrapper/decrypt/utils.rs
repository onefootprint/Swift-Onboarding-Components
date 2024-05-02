use super::super::{Business, VaultWrapper};
use crate::{
    enclave_client::EnclaveClient,
    errors::{business::BusinessError, ApiResult},
    ApiError, ApiErrorKind, State,
};
use db::{
    models::{
        business_owner::{BusinessOwner, UserData},
        contact_info::ContactInfo,
        data_lifetime::DataLifetime,
    },
    DbError, DbPool,
};
use newtypes::{
    email::Email, BusinessDataKind as BDK, BusinessOwnerData, BusinessOwnerKind, ContactInfoKind,
    IdentityDataKind as IDK, Iso3166TwoDigitCountryCode, KycedBusinessOwnerData, PhoneNumber, PiiString,
    TenantId,
};
use std::str::FromStr;

impl<Type> VaultWrapper<Type> {
    pub async fn decrypt_contact_info(
        &self,
        state: &State,
        kind: ContactInfoKind,
    ) -> ApiResult<Option<(PiiString, ContactInfo, DataLifetime)>> {
        if let Some(dl) = self.get_lifetime(&kind.into()) {
            let dl_id = dl.id.clone();
            let ci = state
                .db_pool
                .db_query(move |conn| ContactInfo::get(conn, &dl_id))
                .await?;

            let data = self
                .decrypt_unchecked_single(&state.enclave_client, kind.into())
                .await?
                .ok_or(ApiError::from(DbError::ObjectNotFound))?;
            Ok(Some((data, ci, dl.clone())))
        } else {
            Ok(None)
        }
    }

    pub async fn get_decrypted_phone(&self, state: &State) -> ApiResult<PhoneNumber> {
        let (data, _, _) = self
            .decrypt_contact_info(state, ContactInfoKind::Phone)
            .await?
            .ok_or(ApiErrorKind::ContactInfoKindNotInVault(ContactInfoKind::Phone))?;
        PhoneNumber::parse(data).map_err(ApiError::from)
    }

    pub async fn get_decrypted_email(&self, state: &State) -> ApiResult<Email> {
        let (data, _, _) = self
            .decrypt_contact_info(state, ContactInfoKind::Email)
            .await?
            .ok_or(ApiErrorKind::ContactInfoKindNotInVault(ContactInfoKind::Email))?;
        Email::from_str(data.leak()).map_err(ApiError::from)
    }

    pub async fn get_decrypted_country(
        &self,
        state: &State,
    ) -> ApiResult<Option<Iso3166TwoDigitCountryCode>> {
        let decrypted_values = self
            .decrypt_unchecked(&state.enclave_client, &[IDK::Country.into()])
            .await?;
        Ok(decrypted_values
            .get(&IDK::Country.into())
            .and_then(|a| a.parse_into::<Iso3166TwoDigitCountryCode>().ok()))
    }
}

#[allow(clippy::large_enum_variant)]
#[derive(Debug)]
pub enum DecryptedBusinessOwners {
    /// This business was created via API and doesn't even have a user linked via bifrost
    NoVaultedOrLinkedBos,
    /// There isn't yet any vaulted business owner information for this business.
    /// This could happen because the playbook isn't collecting information.
    /// Or this could happen if the user just hasn't filled out BO information yet.
    NoVaultedBos {
        primary_bo: BusinessOwner,
        primary_bo_vault: UserData,
    },
    /// Single-KYC KYB flow after BO's information has been submitted. There is BDK::BeneficialOwners VaultData for both the Primary BO and the Secondary BO's
    SingleKyc {
        primary_bo: BusinessOwner,
        primary_bo_vault: UserData,
        primary_bo_data: BusinessOwnerData,
        secondary_bos: Vec<BusinessOwnerData>,
    },
    /// Multi-KYC KYB flow after BO's information has been submitted. There is BDK::KycedBeneficialOwners VaultData for both the Primary BO and the Secondary BO's
    /// There are also BusinessOwner's for every Secondary BO. For Secondary BO's that have started Bifrost, we will have a Person Vault/ScopedVault/Onboarding.
    MultiKyc {
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
        tenant_id: &TenantId,
    ) -> ApiResult<DecryptedBusinessOwners> {
        let vid = self.vault().id.clone();
        let tid = tenant_id.clone();
        let mut bos = db_pool
            .db_query(move |conn| BusinessOwner::list(conn, &vid, &tid))
            .await?;

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

                Ok(DecryptedBusinessOwners::SingleKyc {
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

                Ok(DecryptedBusinessOwners::MultiKyc {
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
                let pbo = bos.pop();
                // Should we even distinguish between these two cases here? or just let the caller
                if let Some(pbo) = pbo {
                    let primary_bo = pbo.0;
                    let primary_bo_vault = pbo.1.ok_or(BusinessError::PrimaryBoHasNoVault)?;

                    // NoVaultedBos
                    Ok(DecryptedBusinessOwners::NoVaultedBos {
                        primary_bo,
                        primary_bo_vault,
                    })
                } else {
                    // NoVaultedOrLinkedBos
                    Ok(DecryptedBusinessOwners::NoVaultedOrLinkedBos)
                }
            }
            (Some(_), Some(_)) => Err(BusinessError::KycedAndNonKycedBos.into()),
        }
    }
}
