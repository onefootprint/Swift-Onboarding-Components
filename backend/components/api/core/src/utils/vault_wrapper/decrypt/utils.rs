use super::super::Business;
use super::super::VaultWrapper;
use crate::utils::vault_wrapper::Any;
use crate::utils::vault_wrapper::TenantVw;
use crate::FpError;
use crate::FpResult;
use crate::State;
use api_errors::AssertionError;
use db::models::business_owner::BusinessOwner;
use db::models::scoped_vault::ScopedVault;
use db::DbError;
use itertools::iproduct;
use itertools::Itertools;
use newtypes::BusinessDataKind as BDK;
use newtypes::DataIdentifier as DI;
use newtypes::IdentityDataKind as IDK;
use newtypes::Iso3166TwoDigitCountryCode;
use newtypes::PiiString;
use std::collections::HashMap;
use std::str::FromStr;

impl<Type> VaultWrapper<Type> {
    pub async fn decrypt_unchecked_parse<T>(&self, state: &State, idk: IDK) -> FpResult<Option<T>>
    where
        T: FromStr,
        FpError: From<<T as FromStr>::Err>,
    {
        let di = DI::from(idk);
        if !self.has_field(&di) {
            return Ok(None);
        };

        let data = self
            .decrypt_unchecked_single(&state.enclave_client, di)
            .await?
            .ok_or(DbError::ObjectNotFound)?;
        let data = data.parse_into()?;
        Ok(Some(data))
    }

    pub async fn get_decrypted_country(&self, state: &State) -> FpResult<Option<Iso3166TwoDigitCountryCode>> {
        let result = self.decrypt_unchecked_parse(state, IDK::Country).await?;
        Ok(result)
    }
}

#[derive(Debug, Clone, derive_more::Deref)]
pub struct BusinessOwnerInfo {
    #[deref]
    pub bo: BusinessOwner,
    /// Only populated for users who have started onboarding their beneficial owner.
    /// When populated, all vault data comes from the linked scoped_user's vault.
    pub su: Option<ScopedVault>,
    /// Data for the provided beneficial owner. Includes at most id.phone_number, id.email,
    /// id.first_name, and id.last_name. Accessed only through util methods
    pub data: HashMap<DI, PiiString>,
}

impl BusinessOwnerInfo {
    pub const USER_DIS: &'static [DI; 4] = &[
        DI::Id(IDK::FirstName),
        DI::Id(IDK::LastName),
        DI::Id(IDK::PhoneNumber),
        DI::Id(IDK::Email),
    ];

    pub fn name(mut self) -> Option<(PiiString, PiiString)> {
        let first_name = self.data.remove(&IDK::FirstName.into());
        let last_name = self.data.remove(&IDK::LastName.into());
        first_name.zip(last_name)
    }

    pub fn email(&self) -> Option<&PiiString> {
        self.data.get(&IDK::Email.into())
    }

    pub fn phone_number(&self) -> Option<&PiiString> {
        self.data.get(&IDK::PhoneNumber.into())
    }
}

impl TenantVw<Business> {
    #[tracing::instrument(skip_all)]
    /// Every business owner is defined in the `business_owner` database table. A given BO's data
    /// may be stored either in the business's vault under the `business.beneficial_owners.*` DIs or
    /// in the underlying linked user's vault under the normal `id.*` DIs. This function decrypts
    /// all business owner data according to the above rules.
    pub async fn decrypt_business_owners(&self, state: &State) -> FpResult<Vec<BusinessOwnerInfo>> {
        let vid = self.vault().id.clone();
        let tid = self.scoped_vault.tenant_id.clone();
        let seqno = self.seqno;
        let (linked_bos, vws) = state
            .db_query(move |conn| -> FpResult<_> {
                let linked_bos = BusinessOwner::list_owners(conn, &vid, &tid)?;
                let vaults = linked_bos.iter().flat_map(|(_, x)| x.clone()).collect_vec();
                // Build VWs for each linked BO (at the same seqno that this VW was built at)
                let vws = VaultWrapper::<Any>::multi_get_for_tenant(conn, vaults, Some(seqno))?;
                Ok((linked_bos, vws))
            })
            .await?;

        let decrypt_futs = vws.into_iter().map(|(sv_id, vw)| async move {
            let decrypted = vw
                .decrypt_unchecked(&state.enclave_client, BusinessOwnerInfo::USER_DIS)
                .await?;
            let results = (decrypted.results)
                .into_iter()
                .map(|(k, v)| (k.identifier, v))
                .collect::<HashMap<_, _>>();
            Ok::<_, FpError>((sv_id, results))
        });
        let mut user_data = futures::future::join_all(decrypt_futs)
            .await
            .into_iter()
            .collect::<FpResult<HashMap<_, _>>>()?;

        let dis = iproduct!(linked_bos.iter(), BusinessOwnerInfo::USER_DIS)
            .map(|((bo, _), di)| BDK::bo_data(bo.link_id.clone(), di.clone()).into())
            .collect_vec();
        let biz_data = self.decrypt_unchecked(&state.enclave_client, &dis).await?;


        // For each beneficial owner, zip with the vault data either from the user vault or the business
        // vault
        let bos = linked_bos
            .into_iter()
            .map(|(bo, linked_user)| -> FpResult<_> {
                let (su, _) = linked_user.unzip();
                let data = if let Some(su) = su.as_ref() {
                    // There is a linked user, so all data should come from the vault directly
                    user_data.remove(&su.id).ok_or(AssertionError("Missing data"))?
                } else {
                    // There is no linked user, so we fall back to read the vault data on the business vault
                    biz_data
                        .iter()
                        .filter_map(|(op, v)| {
                            let DI::Business(BDK::BeneficialOwnerData(bo_l_id, di)) = &op.identifier else {
                                return None;
                            };
                            (bo_l_id == &bo.link_id).then_some(((**di).clone(), v.clone()))
                        })
                        .collect()
                };
                Ok(BusinessOwnerInfo { data, bo, su })
            })
            .collect::<FpResult<Vec<_>>>()?;

        Ok(bos)
    }
}
