use super::super::{
    Business,
    VaultWrapper,
};
use crate::errors::business::BusinessError;
use crate::errors::ApiResult;
use crate::utils::vault_wrapper::Any;
use crate::{
    ApiError,
    ApiErrorKind,
    State,
};
use db::models::business_owner::BusinessOwner;
use db::models::contact_info::ContactInfo;
use db::models::data_lifetime::DataLifetime;
use db::models::scoped_vault::ScopedVault;
use db::DbError;
use itertools::Itertools;
use newtypes::email::Email;
use newtypes::{
    BusinessDataKind as BDK,
    BusinessOwnerData,
    BusinessOwnerKind,
    ContactInfoKind,
    IdentityDataKind as IDK,
    Iso3166TwoDigitCountryCode,
    KycedBusinessOwnerData,
    PhoneNumber,
    PiiString,
    TenantId,
};
use std::collections::HashMap;
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

#[derive(Debug, Clone)]
pub struct BusinessOwnerInfo {
    pub first_name: Option<PiiString>,
    pub last_name: Option<PiiString>,
    /// Only populated for BOs in `business.kyced_beneficial_owners`
    pub phone_number: Option<PhoneNumber>,
    /// Only populated for BOs in `business.kyced_beneficial_owners`
    pub email: Option<Email>,
    /// Only populated for vaulted BOs
    pub ownership_stake: Option<u32>,
    /// Only populated for linked BOs
    pub linked_bo: Option<BusinessOwner>,
    pub scoped_user: Option<ScopedVault>,
    /// True if the user came from kyced_beneficial_owners
    pub from_kyced_beneficial_owners: bool,
    pub kind: BusinessOwnerKind,
}

impl VaultWrapper<Business> {
    #[tracing::instrument(skip_all)]
    /// A business owner may be defined either
    /// - In the vault under the `business.beneficial_owners` or `business.kyced_beneficial_owners`
    ///   DI (referred to as a "vaulted BO")
    /// - In the database in the `business_owner` table (referred to as a "linked BO") OR
    /// - Both
    /// This ties together any vaulted BO data with any linked BO data.
    /// NOTE: only vaults created via bifrost may have both vaulted and linked BOs. Vaults created
    /// via API may have only one or the other
    pub async fn decrypt_business_owners(
        &self,
        state: &State,
        tenant_id: &TenantId,
    ) -> ApiResult<Vec<BusinessOwnerInfo>> {
        let vid = self.vault().id.clone();
        let tid = tenant_id.clone();
        let seqno = self.seqno;
        let (linked_bos, vws) = state
            .db_pool
            .db_query(move |conn| -> ApiResult<_> {
                let linked_bos = BusinessOwner::list_all(conn, &vid, &tid)?;
                let vaults = linked_bos.iter().flat_map(|(_, x)| x.clone()).collect_vec();
                // Build VWs for each linked BO (at the same seqno that this VW was built at)
                let vws = VaultWrapper::<Any>::multi_get_for_tenant(conn, vaults, Some(seqno))?;
                Ok((linked_bos, vws))
            })
            .await?;

        let dis = &[BDK::BeneficialOwners.into(), BDK::KycedBeneficialOwners.into()];
        let mut decrypted = self.decrypt_unchecked(&state.enclave_client, dis).await?;

        let results = if let Some(vault_bos) = decrypted.remove(&BDK::BeneficialOwners.into()) {
            // Either bifrost-initiated flow or API-initiated flow. There will be at most one linked BO (for
            // bifrost)
            let vault_bos: Vec<BusinessOwnerData> = vault_bos.deserialize()?;
            if linked_bos.len() > 1 {
                return Err(BusinessError::TooManyBos.into());
            }
            // There should only be one linked BO maximum, the primary
            let (primary_bo, primary_bo_data) = linked_bos.into_iter().next().unzip();
            let primary_sv = primary_bo_data.flatten().map(|d| d.0);

            vault_bos
                .into_iter()
                .enumerate()
                .map(|(i, vault_bo)| {
                    let (kind, linked_bo, scoped_user) = if i == 0 {
                        (BusinessOwnerKind::Primary, primary_bo.clone(), primary_sv.clone())
                    } else {
                        (BusinessOwnerKind::Secondary, None, None)
                    };
                    (kind, linked_bo, scoped_user, vault_bo)
                })
                .map(|(kind, linked_bo, scoped_user, vault_bo)| BusinessOwnerInfo {
                    first_name: Some(vault_bo.first_name),
                    last_name: Some(vault_bo.last_name),
                    phone_number: None,
                    email: None,
                    ownership_stake: Some(vault_bo.ownership_stake),
                    // Implicitly, the first user in the vaulted BOs is the one linked to the business
                    linked_bo,
                    scoped_user,
                    from_kyced_beneficial_owners: false,
                    kind,
                })
                .collect_vec()
        } else if let Some(kyced_bos) = decrypted.remove(&BDK::KycedBeneficialOwners.into()) {
            // Bifrost-initiated flow. There should be a linked_bo for each vault_bo
            let kyced_bos: Vec<KycedBusinessOwnerData> = kyced_bos.deserialize()?;
            kyced_bos
                .into_iter()
                .map(|vault_bo| -> ApiResult<_> {
                    let linked_bo = linked_bos
                        .iter()
                        .find(|bo| bo.0.link_id == vault_bo.link_id)
                        .cloned()
                        .ok_or(BusinessError::LinkedBoNotFound)?;
                    Ok((vault_bo, linked_bo))
                })
                .map_ok(|(vault_bo, (linked_bo, linked_bo_data))| BusinessOwnerInfo {
                    // Vaulted BO fields
                    first_name: Some(vault_bo.first_name),
                    last_name: Some(vault_bo.last_name),
                    phone_number: vault_bo.phone_number,
                    email: vault_bo.email,
                    ownership_stake: Some(vault_bo.ownership_stake),
                    // Linked BO fields
                    kind: linked_bo.kind,
                    linked_bo: Some(linked_bo),
                    scoped_user: linked_bo_data.map(|(su, _)| su),
                    from_kyced_beneficial_owners: true,
                })
                .collect::<ApiResult<Vec<_>>>()?
        } else {
            // API-initiated flow with BOs linked via API, or bifrost-initiated flow with only primary BO
            // before the full list of BOs has been collected
            linked_bos
                .into_iter()
                .map(|(bo, bd)| BusinessOwnerInfo {
                    first_name: None,
                    last_name: None,
                    phone_number: None,
                    email: None,
                    ownership_stake: None,
                    kind: bo.kind,
                    linked_bo: Some(bo),
                    scoped_user: bd.map(|(su, _)| su),
                    // For now, we never allow initiating KYB via API on a playbook that requires KYCing BOs.
                    from_kyced_beneficial_owners: false,
                })
                .collect_vec()
        };

        // Augment the results with the decrypted name from the linked vault, if exist.
        let decrypt_futs = vws.into_values().map(|vw| async move {
            let dis = &[IDK::FirstName.into(), IDK::LastName.into()];
            let mut res = vw.decrypt_unchecked(&state.enclave_client, dis).await?;
            let first_name = res.remove(&IDK::FirstName.into());
            let last_name = res.remove(&IDK::LastName.into());
            Ok::<_, ApiError>((vw.scoped_vault.id, (first_name, last_name)))
        });
        // Future optimization would be to bulk decrypt multiple vaults data in one enclave call
        let bo_names = futures::future::join_all(decrypt_futs)
            .await
            .into_iter()
            .collect::<ApiResult<HashMap<_, _>>>()?;
        let results = results
            .into_iter()
            .map(|mut bo| {
                let su = bo.scoped_user.as_ref();
                if let Some((first_name, last_name)) = su.and_then(|su| bo_names.get(&su.id).cloned()) {
                    bo.first_name = first_name.or(bo.first_name);
                    bo.last_name = last_name.or(bo.last_name);
                }
                bo
            })
            .collect_vec();

        Ok(results)
    }
}
