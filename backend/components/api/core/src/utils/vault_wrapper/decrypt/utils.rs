use super::super::{Business, VaultWrapper};
use crate::enclave_client::EnclaveClient;
use crate::errors::business::BusinessError;
use crate::errors::user::UserError;
use crate::errors::ApiResult;
use crate::{ApiErrorKind, State};
use db::models::business_owner::{BusinessOwner, UserData};
use db::models::contact_info::ContactInfo;
use db::DbPool;
use newtypes::{
    BusinessDataKind as BDK, BusinessOwnerData, BusinessOwnerKind, IdentityDataKind as IDK,
    KycedBusinessOwnerData, ObConfigurationId, PhoneNumber,
};

impl<Type> VaultWrapper<Type> {
    pub async fn get_decrypted_primary_phone(&self, state: &State) -> ApiResult<PhoneNumber> {
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
