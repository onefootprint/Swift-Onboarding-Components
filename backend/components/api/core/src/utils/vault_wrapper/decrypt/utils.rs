use super::super::{Business, VaultWrapper};
use crate::enclave_client::EnclaveClient;
use crate::errors::business::BusinessError;
use crate::errors::user::UserError;
use crate::errors::ApiResult;
use crate::{ApiError, ApiErrorKind, State};
use db::models::business_owner::{BusinessOwner, UserData};
use db::models::contact_info::ContactInfo;
use db::{DbError, DbPool};
use newtypes::email::Email;
use newtypes::{
    BusinessDataKind as BDK, BusinessOwnerData, BusinessOwnerKind, ContactInfoKind, IdentityDataKind as IDK,
    Iso3166TwoDigitCountryCode, KycedBusinessOwnerData, PhoneNumber, PiiString, TenantId,
};
use std::str::FromStr;

impl<Type> VaultWrapper<Type> {
    pub async fn decrypt_contact_info(
        &self,
        state: &State,
        kind: ContactInfoKind,
    ) -> ApiResult<Option<(PiiString, ContactInfo)>> {
        if let Some(di_id) = self.get(IDK::from(kind)) {
            let di_id = di_id.lifetime_id().clone();
            let ci = state
                .db_pool
                .db_query(move |conn| ContactInfo::get(conn, &di_id))
                .await??;

            let data = self
                .decrypt_unchecked_single(&state.enclave_client, IDK::from(kind).into())
                .await?
                .ok_or(ApiError::from(DbError::ObjectNotFound))?;
            Ok(Some((data, ci)))
        } else {
            Ok(None)
        }
    }

    // TODO: can later have a function return whatever CI is available for the user and then have notification callsites support either
    async fn decrypt_verified_contact_info(
        &self,
        state: &State,
        kind: ContactInfoKind,
    ) -> ApiResult<PiiString> {
        let (data, ci) = self
            .decrypt_contact_info(state, kind)
            .await?
            .ok_or(ApiErrorKind::ContactInfoKindNotInVault(kind))?;

        // TODO we're moving away from needing to send things to verified contact info. Can we get
        // rid of this check for portable vaults too?
        if !self.vault.is_created_via_api && !ci.is_otp_verified {
            // Many of the communications we send out give either OTPs or links that allow authing
            // as the user. So, we want to make sure a tenant can't update the user's phone number/email
            // and then send themselves OTPs. First, check that the phone number/email is verified to
            // be owned by the user
            Err(UserError::ContactInfoKindNotVerified(kind).into())
        } else {
            Ok(data)
        }
    }

    pub async fn get_decrypted_verified_primary_phone(&self, state: &State) -> ApiResult<PhoneNumber> {
        self.decrypt_verified_contact_info(state, ContactInfoKind::Phone)
            .await
            .and_then(|p| PhoneNumber::parse(p).map_err(ApiError::from))
    }

    pub async fn get_decrypted_verified_email(&self, state: &State) -> ApiResult<Email> {
        self.decrypt_verified_contact_info(state, ContactInfoKind::Email)
            .await
            .and_then(|e| Email::from_str(e.leak()).map_err(ApiError::from))
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
    KybWithoutBos, // for Apiture we are introducing the concept of running KYB without any BO's
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
        tenant_id: &TenantId,
    ) -> ApiResult<DecryptedBusinessOwners> {
        let vid = self.vault().id.clone();
        let tid = tenant_id.clone();
        let mut bos = db_pool
            .db_query(move |conn| BusinessOwner::list(conn, &vid, &tid))
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
                let pbo = bos.pop();
                if let Some(pbo) = pbo {
                    let primary_bo = pbo.0;
                    let primary_bo_vault = pbo.1.ok_or(BusinessError::PrimaryBoHasNoVault)?;

                    Ok(DecryptedBusinessOwners::KYBStart {
                        primary_bo,
                        primary_bo_vault,
                    })
                } else {
                    Ok(DecryptedBusinessOwners::KybWithoutBos)
                }
            }
            (Some(_), Some(_)) => Err(BusinessError::KycedAndNonKycedBos.into()),
        }
    }
}
