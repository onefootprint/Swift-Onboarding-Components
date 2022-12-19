use std::collections::HashSet;

use super::LockedUserVaultWrapper;
use crate::errors::user::UserError;
use crate::errors::ApiError;
use crate::errors::ApiResult;
use db::models::data_lifetime::DataLifetime;
use db::HasDataAttributeFields;
use db::TxnPgConnection;
use newtypes::CollectedDataOption;
use newtypes::DataLifetimeSeqno;

struct CurrentData {
    speculative: HashSet<CollectedDataOption>,
    committed: HashSet<CollectedDataOption>,
}

struct DataToCommit {
    to_commit: HashSet<CollectedDataOption>,
    to_deactivate: HashSet<CollectedDataOption>,
}

/// Given the set of speculative CollectedDataOptions and committed CollectedDataOptions,
/// determines which speculative CDOs we will commit and which we will deactivate.
/// Generally, we will commit a speculative CDO if it is not replacing a committed CDO that
/// contains more information.
/// For example, we will not allow a speculative Ssn4 to replace a committed Ssn9. We will allow
/// a speculative Ssn9 to replace a committed Ssn9 or committed Ssn4, though.
fn decide_data_to_commit(data: CurrentData) -> DataToCommit {
    let CurrentData {
        speculative,
        committed,
    } = data;
    // Split the list of speculative CDOs based on whether they should be committed or not
    let (to_commit, to_deactivate) = speculative.into_iter().partition(|speculative_cdo| {
        let full_cdo = speculative_cdo.full_variant();
        match full_cdo {
            // Only commit this piece of speculative data if the full CDO isn't committed
            // NOTE: we'll rarely have a speculative partial CDO and a committed full CDO since
            // we normally block these updates from happening when the speculative data is added.
            // Could only happen due to a race condition. More context at
            // https://linear.app/footprint/issue/FP-2129/handle-onboarding-race-condition
            Some(full_cdo) => {
                let committed_has_full_variant = committed.contains(&full_cdo);
                if committed_has_full_variant {
                    log::info!(
                        "Trying to commit partial CDO {} when full CDO {} is committed",
                        speculative_cdo,
                        full_cdo
                    );
                }
                !committed_has_full_variant
            }
            // Commit!
            None => true,
        }
    });
    DataToCommit {
        to_commit,
        to_deactivate,
    }
}

impl LockedUserVaultWrapper {
    /// Marks all speculative data
    /// speculative data and make it portable after it is verified by an approved onboarding.
    /// Intentionally consumes the UVW to prevent using a stale reference
    pub fn commit_data_for_tenant(self, conn: &mut TxnPgConnection) -> ApiResult<DataLifetimeSeqno> {
        // TODO unit tests. Fun case: have a committed FullAddress with StreetAddress2, then try to
        // commit a speculative FullAddress without StreetAddress2
        let uvw = self.into_inner();
        let scoped_user_id = uvw
            .scoped_user_id
            .as_ref()
            .ok_or(UserError::NotAllowedOutsideOnboarding)?;

        // Use the same seqno to deactivate old data and commit new data
        let seqno = DataLifetime::get_next_seqno(conn)?;

        let d = decide_data_to_commit(CurrentData {
            speculative: CollectedDataOption::list_from(uvw.speculative.get_populated_fields()),
            committed: CollectedDataOption::list_from(uvw.committed.get_populated_fields()),
        });
        let speculative_kinds_to_commit: Vec<_> =
            d.to_commit.into_iter().flat_map(|o| o.attributes()).collect();
        let speculative_kinds_to_deactivate: Vec<_> =
            d.to_deactivate.into_iter().flat_map(|o| o.attributes()).collect();

        //
        // Deactivate all existing, committed data that is about to be replaced by speculative data.
        // Also deactivate speculative data that we don't want to keep.
        //
        let lifetime_ids_to_deactivate = {
            // For everything that we're about to commit, deactivate the old data if exists
            let committed_lifetimes_to_deactivate = uvw.committed.get_lifetimes(&speculative_kinds_to_commit);
            let is_all_data_committed = committed_lifetimes_to_deactivate
                .iter()
                .all(|l| l.committed_seqno.is_some());
            if !is_all_data_committed {
                // Everything we are deactivating should be committed already
                return Err(ApiError::AssertionError(
                    "Lifetime to deactivate is not committed".to_owned(),
                ));
            }
            // And, grab the IDs of speculative data that we're deactivating.
            let speculative_lifetimes_to_deactivate =
                uvw.speculative.get_lifetimes(&speculative_kinds_to_deactivate);
            if !speculative_lifetimes_to_deactivate.is_empty() {
                // For now, we only deactivate speculative data if committing it would otherwise
                // replace more full data on the user vault.
                // This only happens in an onboarding race condition - let's just track when it happens
                let ids: Vec<_> = speculative_lifetimes_to_deactivate
                    .iter()
                    .map(|l| &l.id)
                    .collect();
                log::error!("Deactivating speculative data due to race condition: {:?}", ids,);
            }
            committed_lifetimes_to_deactivate
                .into_iter()
                .chain(speculative_lifetimes_to_deactivate.into_iter())
                .map(|l| l.id.clone())
                .collect()
        };
        DataLifetime::bulk_deactivate(conn, lifetime_ids_to_deactivate, seqno)?;

        //
        // Commit speculative lifetimes. This could commit data across any number of tables.
        //
        // NOTE: this isn't committing identity documents since we never return IdentityDocument
        // from get_populated_fields
        let lifetime_ids_to_commit = {
            let speculative_lifetimes_to_commit = uvw.speculative.get_lifetimes(&speculative_kinds_to_commit);
            let all_data_is_speculative_and_belongs_to_scoped_user = speculative_lifetimes_to_commit
                .iter()
                .all(|l| l.committed_seqno.is_none() && l.scoped_user_id == uvw.scoped_user_id);
            if !all_data_is_speculative_and_belongs_to_scoped_user {
                // Just a sanity check filter that we don't commit other data - all results should match
                // this filter
                return Err(ApiError::AssertionError(
                    "About to commit data that is not speculative or does not belong to tenant".to_owned(),
                ));
            }
            speculative_lifetimes_to_commit
                .into_iter()
                .map(|l| l.id.clone())
                .collect()
        };
        DataLifetime::bulk_commit_for_tenant(conn, lifetime_ids_to_commit, scoped_user_id.clone(), seqno)?;

        Ok(seqno)
    }
}

#[cfg(test)]
mod test {
    use std::collections::HashSet;

    use test_case::test_case;

    use crate::utils::user_vault_wrapper::commit_data::CurrentData;

    use super::decide_data_to_commit;
    use newtypes::CollectedDataOption;
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
        vec![PartialAddress], vec![FullAddress],
        // Deactivate partial address because we already have a full one
        vec![], vec![PartialAddress] => None
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
        vec![FullAddress], vec![PartialAddress],
        // Allow replacing existing partial address
        vec![FullAddress], vec![] => None
    )]
    #[test_case(
        vec![FullAddress], vec![FullAddress],
        // Allow replacing full address
        vec![FullAddress], vec![] => None
    )]
    fn test_decide_data_to_commit(
        speculative: Vec<CollectedDataOption>,
        committed: Vec<CollectedDataOption>,
        expected_to_commit: Vec<CollectedDataOption>,
        expected_to_deactivate: Vec<CollectedDataOption>,
    ) -> Option<usize> {
        let current_data = CurrentData {
            speculative: speculative.into_iter().collect(),
            committed: committed.into_iter().collect(),
        };
        let data = decide_data_to_commit(current_data);
        assert_eq!(data.to_commit, HashSet::from_iter(expected_to_commit.into_iter()));
        assert_eq!(
            data.to_deactivate,
            HashSet::from_iter(expected_to_deactivate.into_iter())
        );
        None
    }
}
