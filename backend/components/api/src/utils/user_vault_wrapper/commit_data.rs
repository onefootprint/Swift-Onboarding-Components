use std::collections::HashSet;

use super::LockedUserVaultWrapper;
use crate::errors::user::UserError;
use crate::errors::ApiError;
use crate::errors::ApiResult;
use db::models::data_lifetime::DataLifetime;
use db::HasDataAttributeFields;
use db::TxnPgConnection;
use newtypes::CollectedDataOption;
use newtypes::DataLifetimeKind;
use newtypes::DataLifetimeSeqno;

type SepculativeKindsToCommit = HashSet<DataLifetimeKind>;
type SpeculativeKindsToDeactivate = HashSet<DataLifetimeKind>;

// I think this should speak in terms of CDO
fn decide_data_to_commit(
    speculative_kinds: Vec<DataLifetimeKind>,
    committed_kinds: Vec<DataLifetimeKind>,
) -> (SepculativeKindsToCommit, SpeculativeKindsToDeactivate) {
    let pairs = vec![
        (
            CollectedDataOption::PartialAddress,
            CollectedDataOption::FullAddress,
        ),
        (CollectedDataOption::Ssn4, CollectedDataOption::Ssn9),
    ];
    let set = |v: Vec<_>| HashSet::<DataLifetimeKind>::from_iter(v.into_iter());
    let speculative_kinds = set(speculative_kinds);
    let committed_kinds = set(committed_kinds);

    // Start committing all speculative data
    let mut speculative_kinds_to_commit = speculative_kinds.clone();
    let mut speculative_kinds_to_deactivate = HashSet::new();
    // For each pair of (partial, full) data options, don't commit the partial data if it would
    // overshadow full data
    for p in pairs {
        println!(
            "{:?}, {:?}",
            speculative_kinds_to_commit, speculative_kinds_to_deactivate
        );
        let (partial_kind, full_kind) = p;
        println!("partial_kind {:?}", partial_kind.required_attributes());
        println!("full_kind {:?}", full_kind.required_attributes());

        let full_attributes = set(full_kind.required_attributes());
        // If all of the (required) attributes are already on the
        let already_committed_full_data = committed_kinds.is_superset(&full_attributes);
        let committing_full_data = speculative_kinds.is_superset(&full_attributes);
        println!("already_committed_full_data {:?}", already_committed_full_data);
        println!("committing_full_data {:?}", committing_full_data);
        if already_committed_full_data && !committing_full_data {
            println!("match {}", partial_kind);
            for k in partial_kind.attributes() {
                speculative_kinds_to_commit.remove(&k);
                speculative_kinds_to_deactivate.insert(k);
            }
        }
    }
    (speculative_kinds_to_commit, speculative_kinds_to_deactivate)
}

impl LockedUserVaultWrapper {
    /// Marks all speculative data
    /// speculative data and make it portable after it is verified by an approved onboarding.
    /// Intentionally consumes the UVW to prevent using a stale reference
    pub fn commit_data_for_tenant(self, conn: &mut TxnPgConnection) -> ApiResult<DataLifetimeSeqno> {
        let uvw = self.into_inner();
        let scoped_user_id = uvw
            .scoped_user_id
            .as_ref()
            .ok_or(UserError::NotAllowedOutsideOnboarding)?;

        // Use the same seqno to deactivate old data and commit new data
        let seqno = DataLifetime::get_next_seqno(conn)?;

        // NOTE: this isn't committing identity documents since we never return IdentityDocument
        // from get_populated_fields
        let (speculative_kinds_to_commit, speculative_kinds_to_deactivate) = decide_data_to_commit(
            uvw.speculative.get_populated_fields(),
            uvw.committed.get_populated_fields(),
        );

        //
        // Deactivate all existing, committed data that is about to be replaced by speculative data.
        // Also deactivate speculative data that we don't want to keep.
        //
        let lifetime_ids_to_deactivate = {
            // For everything that we're about to commit, deactivate the old data if exists
            let committed_lifetimes_to_deactivate = uvw.committed.get_lifetimes(&speculative_kinds_to_commit);
            // TODO: map back to the kinds to deactivate
            // Ssn9 should deactivate Ssn4 and Ssn9
            // Or maybe if full address exists, every field is set.
            // Except for address line 2
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
            // For now, we only deactivate speculative data if committing it would otherwise
            // replace more full data on the user vault.
            let speculative_lifetimes_to_deactivate =
                uvw.speculative.get_lifetimes(&speculative_kinds_to_deactivate);
            // TODO log? if any speculative lifetimes to deactive maybe just warning, but show up in sentry
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

    use newtypes::DataLifetimeKind;
    use test_case::test_case;

    use super::decide_data_to_commit;
    use newtypes::CollectedDataOption;
    use CollectedDataOption::*;

    #[test_case(
        vec![Name.attributes()], vec![Name.attributes()],
        vec![Name.attributes()], vec![] => None
    )]
    #[test_case(
        vec![Name.attributes(), Ssn4.attributes()], vec![Name.attributes(), Ssn9.attributes()],
        // Deactivate partial ssn because we already have full ssn9
        vec![Name.attributes()], vec![Ssn4.attributes()] => None
    )]
    #[test_case(
        vec![PartialAddress.attributes()], vec![FullAddress.attributes()],
        // Deactivate partial address because we already have a full one
        vec![], vec![PartialAddress.attributes()] => None
    )]
    #[test_case(
        vec![PartialAddress.attributes()], vec![FullAddress.required_attributes()],
        // Deactivate partial address because we already have a full one, even without AddressLine2
        vec![], vec![PartialAddress.attributes()] => None
    )]
    #[test_case(
        vec![Dob.attributes(), Ssn9.attributes()], vec![Ssn9.attributes()],
        // Allow replacing Ssn9
        vec![Dob.attributes(), Ssn9.attributes()], vec![] => None
    )]
    #[test_case(
        vec![Dob.attributes(), Ssn9.attributes()], vec![Ssn4.attributes()],
        // Allow replacing Ssn4 with an Ssn9
        vec![Dob.attributes(), Ssn9.attributes()], vec![] => None
    )]
    #[test_case(
        vec![FullAddress.required_attributes()], vec![PartialAddress.attributes()],
        // Allow replacing address
        vec![FullAddress.required_attributes()], vec![] => None
    )]
    #[test_case(
        vec![FullAddress.required_attributes()], vec![FullAddress.attributes()],
        // Allow replacing address
        vec![FullAddress.required_attributes()], vec![] => None
    )]
    fn test_decide_data_to_commit(
        speculative: Vec<Vec<DataLifetimeKind>>,
        committed: Vec<Vec<DataLifetimeKind>>,
        expected_to_commit: Vec<Vec<DataLifetimeKind>>,
        expected_to_deactivate: Vec<Vec<DataLifetimeKind>>,
    ) -> Option<usize> {
        let (to_commit, to_deactivate) = decide_data_to_commit(
            speculative.into_iter().flatten().collect(),
            committed.into_iter().flatten().collect(),
        );
        assert_eq!(
            to_commit,
            HashSet::from_iter(expected_to_commit.into_iter().flatten())
        );
        assert_eq!(
            to_deactivate,
            HashSet::from_iter(expected_to_deactivate.into_iter().flatten())
        );
        None
    }
}
