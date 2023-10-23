use super::WriteableVw;
use crate::errors::ApiResult;
use crate::errors::AssertionError;
use crate::utils::vault_wrapper::Person;
use db::models::contact_info::ContactInfo;
use db::models::contact_info::VerificationLevel;
use db::models::data_lifetime::DataLifetime;
use db::models::fingerprint::Fingerprint;
use db::models::scoped_vault::ScopedVault;
use db::models::scoped_vault::ScopedVaultUpdate;
use db::models::user_timeline::UserTimeline;
use db::models::vault::Vault;
use db::TxnPgConn;
use either::Either;
use itertools::Itertools;
use newtypes::CollectedDataOption;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeSeqno;
use newtypes::DbUserTimelineEventKind;
use std::collections::HashMap;
use std::collections::HashSet;

struct CurrentData {
    speculative: HashSet<CollectedDataOption>,
    portable: HashSet<CollectedDataOption>,
}

struct DataToPortablize {
    to_portablize: HashSet<CollectedDataOption>,
    to_deactivate: HashSet<CollectedDataOption>,
}

/// Given the set of speculative CollectedDataOptions and portable CollectedDataOptions,
/// determines which speculative CDOs we will portablize and which we will deactivate.
/// Generally, we will portablize a speculative CDO if it is not replacing a portable CDO that
/// contains more information.
/// For example, we will not allow a speculative Ssn4 to replace a portable Ssn9. We will allow
/// a speculative Ssn9 to replace a portable Ssn9 or portable Ssn4, though.
fn decide_data_to_portablize(data: CurrentData) -> DataToPortablize {
    let CurrentData {
        speculative,
        portable,
    } = data;
    // Split the list of speculative CDOs based on whether they should be portable or not
    let (to_portablize, to_deactivate) = speculative.into_iter().partition(|speculative_cdo| {
        let full_cdo = speculative_cdo.full_variant();
        match full_cdo {
            // Only portablize this piece of speculative data if the full CDO isn't portable
            // NOTE: we'll rarely have a speculative partial CDO and a portable full CDO since
            // we normally block these updates from happening when the speculative data is added.
            // Could only happen due to a race condition. More context at
            // https://linear.app/footprint/issue/FP-2129/handle-onboarding-race-condition
            Some(full_cdo) => {
                let portable_has_full_variant = portable.contains(&full_cdo);
                if portable_has_full_variant {
                    tracing::info!(
                        "Trying to portablize partial CDO {} when full CDO {} is portable",
                        speculative_cdo,
                        full_cdo
                    );
                }
                !portable_has_full_variant
            }
            // Portablize!
            None => true,
        }
    });
    DataToPortablize {
        to_portablize,
        to_deactivate,
    }
}

// Can only portablize identity data
impl WriteableVw<Person> {
    /// Marks all speculative identity data data as portable in order to make it portable after
    /// it is verified by an approved onboarding.
    /// Intentionally consumes the UVW to prevent using a stale reference
    /// NOTE: this DOES NOT portablize custom data or identity documents since we haven't figured out
    /// the portability story for those types of data
    #[tracing::instrument("WriteableVw::portablize_identity_data", skip_all)]
    pub fn portablize_identity_data(self, conn: &mut TxnPgConn) -> ApiResult<DataLifetimeSeqno> {
        // TODO only portablize data collected by the ob config rather than all data
        // TODO also only portablize the _exact_ data that was sent off to be verified. It's possible
        // the data has been changed via API in between sending VReqs and now.
        let Self { uvw, scoped_vault_id } = self;
        // Use the same seqno to deactivate old data and portablize new data
        let seqno = DataLifetime::get_next_seqno(conn)?;

        if !uvw.vault.is_portable {
            // If the vault wasn't initially portable, mark it as portable now
            // TODO we might be able to remove is_portable as a flag since non-portable vaults
            // won't even have global fingerprints
            Vault::mark_portable(conn, &uvw.vault.id)?;
        }

        //
        // Compute what data we'll be committing and deactivating
        //
        // Note: speculative and portable could have overlapping DIs if a piece of speculative data
        // is replacing a piece of portable data
        let (speculative, portable): (HashMap<_, _>, HashMap<_, _>) = uvw
            .all_data
            .iter()
            .flat_map(|(di, datas)| datas.iter().map(|d| (di.clone(), d)))
            .partition_map(|(di, d)| {
                if d.is_portable() {
                    Either::Right((di, d))
                } else {
                    Either::Left((di, d))
                }
            });
        let d = decide_data_to_portablize(CurrentData {
            speculative: CollectedDataOption::list_from(speculative.keys().cloned().collect()),
            portable: CollectedDataOption::list_from(portable.keys().cloned().collect()),
        });
        let to_portablize: Vec<_> = d
            .to_portablize
            .into_iter()
            // Purposefully only take IDKs because we only want to portablize identity fields
            .flat_map(|o| o.data_identifiers().unwrap_or_default())
            .filter(|di| matches!(di, DataIdentifier::Id(_)))
            .collect();
        let to_deactivate: Vec<_> = d
            .to_deactivate
            .into_iter()
            // Purposefully only take IDKs because we only want to portablize identity fields
            .flat_map(|o| o.data_identifiers().unwrap_or_default())
            .filter(|di| matches!(di, DataIdentifier::Id(_)))
            .collect();

        //
        // Deactivate all existing, portable data that is about to be replaced by speculative data.
        // Also deactivate speculative data that we don't want to keep.
        //
        let to_deactivate = {
            // For everything that we're about to portablize, deactivate the old data if exists
            let portable_to_deactivate = to_portablize.iter().flat_map(|di| portable.get(di)).collect_vec();
            if !portable_to_deactivate.iter().all(|l| l.is_portable()) {
                // Everything we are deactivating should be portable already
                return Err(AssertionError("Lifetime to deactivate is not portable").into());
            }
            // And, grab the IDs of speculative data that we're deactivating.
            let spec_to_deactivate: Vec<_> =
                to_deactivate.iter().flat_map(|di| speculative.get(di)).collect();
            if !spec_to_deactivate.is_empty() {
                // For now, we only deactivate speculative data if portablizing it would otherwise
                // replace more full data on the user vault.
                // This only happens in an onboarding race condition - let's just track when it happens
                tracing::error!(
                    "Deactivating speculative data due to race condition: {:?}",
                    spec_to_deactivate.iter().map(|d| &d.lifetime.id).collect_vec()
                );
            }
            portable_to_deactivate
                .into_iter()
                .chain(spec_to_deactivate.into_iter())
                .map(|d| d.lifetime.id.clone())
                .collect()
        };
        DataLifetime::bulk_deactivate(conn, to_deactivate, seqno)?;

        //
        // Portablize speculative lifetimes.
        //
        // NOTE: this isn't portablizing identity documents.
        let to_portablize: Vec<_> = to_portablize.iter().flat_map(|di| speculative.get(di)).collect();
        let all_data_is_speculative_and_belongs_to_scoped_user = to_portablize
            .iter()
            .all(|d| d.is_speculative() && d.lifetime.scoped_vault_id == scoped_vault_id);
        if !all_data_is_speculative_and_belongs_to_scoped_user {
            // Just a sanity check filter that we don't portablize other data - all results should match
            // this filter
            return Err(AssertionError(
                "About to portablize data that is not speculative or does not belong to tenant",
            )
            .into());
        }

        let lifetime_ids_to_portablize = to_portablize.into_iter().map(|d| d.lifetime.id.clone()).collect();
        DataLifetime::bulk_portablize_for_tenant(conn, lifetime_ids_to_portablize, &scoped_vault_id, seqno)?;

        // Portablize any data collection timeline events from the duration of this onboarding.
        // NOTE: this may include data collection events for fields that we deactivated... It is
        // tricky to locate the exact timeline events corresponding to each piece of data. Not
        // worth it for now since we only deactivate speculative data in the rare condition that
        // there is a race across onboarding onto two tenants
        UserTimeline::bulk_portablize(conn, &scoped_vault_id, DbUserTimelineEventKind::DataCollected)?;

        Ok(seqno)
    }

    /// Mark the provided CI as verified.
    pub fn on_otp_verified(self, conn: &mut TxnPgConn, di: DataIdentifier) -> ApiResult<()> {
        let lifetime = self
            .get_lifetime(di.clone())
            .ok_or(AssertionError("No lifetime for CI"))?;
        let ci = ContactInfo::get(conn, &lifetime.id)?;
        if !ci.is_otp_verified {
            ContactInfo::mark_verified(conn, &ci.id, VerificationLevel::OtpVerified)?;
            let seqno = DataLifetime::get_next_seqno(conn)?;
            DataLifetime::portablize(conn, &ci.lifetime_id, seqno)?;

            // Don't make sandbox fingerprints unique since one phone number can be used
            // to make multiple sandbox vaults.
            if self.vault.is_live && di.globally_unique() {
                // Mark the global fingerprint as unique.
                Fingerprint::mark_global_unique(conn, &ci.lifetime_id)?;
            }
        }
        let update = ScopedVaultUpdate {
            show_in_search: Some(true),
            ..ScopedVaultUpdate::default()
        };
        ScopedVault::update(conn, &self.scoped_vault_id, update)?;
        Ok(())
    }
}

#[cfg(test)]
mod test {
    use super::decide_data_to_portablize;
    use super::CurrentData;
    use newtypes::CollectedDataOption;
    use std::collections::HashSet;
    use test_case::test_case;
    use CollectedDataOption::*;

    #[test_case(
        vec![Name], vec![Name],
        vec![Name], vec![] => None
    )]
    #[test_case(
        vec![Name, Ssn4], vec![Name, Ssn9],
        // Deactivate partial ssn because we already have full ssn9
        vec![Name], vec![Ssn4] => None
    )]
    #[test_case(
        vec![Dob, Ssn9], vec![Ssn9],
        // Allow replacing Ssn9
        vec![Dob, Ssn9], vec![] => None
    )]
    #[test_case(
        vec![Dob, Ssn9], vec![Ssn4],
        // Allow replacing Ssn4 with an Ssn9
        vec![Dob, Ssn9], vec![] => None
    )]
    #[test_case(
        vec![FullAddress], vec![FullAddress],
        // Allow replacing full address
        vec![FullAddress], vec![] => None
    )]
    fn test_decide_data_to_portablize(
        speculative: Vec<CollectedDataOption>,
        portable: Vec<CollectedDataOption>,
        expected_to_portablize: Vec<CollectedDataOption>,
        expected_to_deactivate: Vec<CollectedDataOption>,
    ) -> Option<usize> {
        let current_data = CurrentData {
            speculative: speculative.into_iter().collect(),
            portable: portable.into_iter().collect(),
        };
        let data = decide_data_to_portablize(current_data);
        assert_eq!(
            data.to_portablize,
            HashSet::from_iter(expected_to_portablize.into_iter())
        );
        assert_eq!(
            data.to_deactivate,
            HashSet::from_iter(expected_to_deactivate.into_iter())
        );
        None
    }
}
