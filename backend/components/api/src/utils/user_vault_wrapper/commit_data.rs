use super::LockedUserVaultWrapper;
use crate::errors::user::UserError;
use crate::errors::ApiError;
use crate::errors::ApiResult;
use db::models::data_lifetime::DataLifetime;
use db::HasDataAttributeFields;
use db::TxnPgConnection;
use itertools::Itertools;
use newtypes::DataLifetimeSeqno;

impl LockedUserVaultWrapper {
    /// Marks all speculative data
    /// speculative data and make it portable after it is verified by an approved onboarding.
    /// Intentionally consumes the UVW to prevent using a stale reference
    pub fn commit_data_for_tenant(self, conn: &mut TxnPgConnection) -> ApiResult<DataLifetimeSeqno> {
        // TODO how do we enforce this UVW was created inside the same `conn` we have here?
        let uvw = self.into_inner();
        let scoped_user_id = uvw
            .scoped_user_id
            .as_ref()
            .ok_or(UserError::NotAllowedOutsideOnboarding)?;

        // Use the same seqno to deactivate old data and commit new data
        let seqno = DataLifetime::get_next_seqno(conn)?;

        //
        // Deactivate all existing, committed data that is about to be replaced by speculative data.
        //
        let about_to_commit_kinds = uvw.speculative.get_populated_fields();
        let kinds_to_deactivate = about_to_commit_kinds
            .into_iter()
            .flat_map(|k| k.kinds_to_clear())
            .unique();
        let lifetime_ids_to_deactivate: Vec<_> = kinds_to_deactivate
            // Gather the committed lifetime_ids for this set of DataAttribute kinds
            .flat_map(|k| uvw.committed.get(k).map(|o| o.lifetime_id().clone()))
            .collect();

        let is_all_data_committed = lifetime_ids_to_deactivate.iter().all(|id| {
            uvw.committed
                .lifetimes
                .get(id)
                .map(|lifetime| lifetime.committed_seqno.is_some())
                == Some(true)
        });
        if !is_all_data_committed {
            // Everything we are deactivating should be committed already
            return Err(ApiError::AssertionError(
                "Lifetime to deactivate is not committed".to_owned(),
            ));
        }
        DataLifetime::bulk_deactivate(conn, lifetime_ids_to_deactivate, seqno)?;

        // Mark all speculative lifetimes as committed. This could commit data across any number
        // of tables.
        // Get the lifetimes of uncommitted data added by this scoped user. These are the lifetimes
        // that we will commit.
        // TODO if we have a speculative lifetime for a secondary email, we will commit it here.
        // But we won't deactivate anything above. Maybe we want a list of lifetime IDs for all
        // the data. Maybe store Lifetimes joined with underlying data to prevent having more
        // lifetimes than we have data on the speculative UvwData
        let lifetimes_to_commit: Vec<_> = uvw.speculative.lifetimes.values().collect();
        let all_data_belongs_to_scoped_user = lifetimes_to_commit
            .iter()
            .all(|l| l.scoped_user_id == uvw.scoped_user_id);
        if !all_data_belongs_to_scoped_user {
            // Just a sanity check filter that we don't commit other data - all results should match
            // this filter
            return Err(ApiError::AssertionError(
                "About to commit data not belonging to user".to_owned(),
            ));
        }
        let lifetime_ids_to_commit = lifetimes_to_commit.into_iter().map(|l| l.id.clone()).collect();
        DataLifetime::bulk_commit_for_tenant(conn, lifetime_ids_to_commit, scoped_user_id.clone(), seqno)?;

        Ok(seqno)
    }
}
