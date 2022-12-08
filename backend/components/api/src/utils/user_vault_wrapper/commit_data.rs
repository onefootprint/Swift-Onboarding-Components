use super::UserVaultWrapper;
use crate::errors::user::UserError;
use crate::errors::ApiResult;
use db::models::data_lifetime::DataLifetime;
use db::HasDataAttributeFields;
use db::TxnPgConnection;
use itertools::Itertools;
use newtypes::DataLifetimeSeqno;

impl UserVaultWrapper {
    /// Marks all speculative data
    /// speculative data and make it portable after it is verified by an approved onboarding.
    /// Intentionally consumes the UVW to prevent using a stale reference
    pub fn commit_data_for_tenant(self, conn: &mut TxnPgConnection) -> ApiResult<DataLifetimeSeqno> {
        // TODO how do we enforce this UVW was created inside the same `conn` we have here?
        self.assert_is_locked(conn)?;
        let scoped_user_id = self
            .scoped_user_id
            .as_ref()
            .ok_or(UserError::NotAllowedOutsideOnboarding)?;

        // Use the same seqno to deactivate old data and commit new data
        let seqno = DataLifetime::get_next_seqno(conn)?;

        //
        // Deactivate all existing, committed data that is about to be replaced by speculative data.
        //
        let about_to_commit_kinds = self.speculative.get_populated_fields();
        let kinds_to_deactivate = about_to_commit_kinds
            .into_iter()
            .flat_map(|k| k.kinds_to_clear())
            .unique();
        let lifetime_ids_to_deactivate: Vec<_> = kinds_to_deactivate
            // Gather the committed lifetime_ids for this set of DataAttribute kinds
            .flat_map(|k| self.committed.get(k).map(|o| o.lifetime_id().clone()))
            // Filter to only committed lifetimes - this should be every one
            // TODO turn this into an assertion rather than a filter
            .filter(|id| {
                self.committed
                    .lifetimes
                    .get(id)
                    .map(|lifetime| lifetime.committed_seqno.is_some()) == Some(true)
            })
            .collect();
        DataLifetime::bulk_deactivate(conn, lifetime_ids_to_deactivate, seqno)?;

        // Mark all speculative lifetimes as committed. This could commit data across any number
        // of tables.
        // Get the lifetimes of uncommitted data added by this scoped user. These are the lifetimes
        // that we will commit.
        let lifetime_ids_to_commit = self
            .speculative
            .lifetimes
            .values()
            // Just a sanity check filter that we don't commit other data - all results should match
            // this filter
            // TODO turn this into an assertion rather than a filter
            .filter(|lifetime| lifetime.scoped_user_id == self.scoped_user_id)
            .map(|lifetime| lifetime.id.clone())
            .collect();
        DataLifetime::bulk_commit_for_tenant(conn, lifetime_ids_to_commit, scoped_user_id.clone(), seqno)?;

        Ok(seqno)
    }
}
