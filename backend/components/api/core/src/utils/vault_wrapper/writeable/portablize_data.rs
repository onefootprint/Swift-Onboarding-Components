use super::WriteableVw;
use crate::utils::vault_wrapper::Person;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::FpResult;
use db::models::data_lifetime::DataLifetime;
use db::models::vault::Vault;
use db::TxnPgConn;
use newtypes::CollectedDataOption;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeSeqno;
use std::collections::HashMap;
use std::collections::HashSet;

struct CurrentData {
    speculative: HashSet<CollectedDataOption>,
    portable: HashSet<CollectedDataOption>,
}

/// Given the set of speculative CollectedDataOptions and portable CollectedDataOptions,
/// determines which speculative CDOs we will portablize.
/// Generally, we will portablize a speculative CDO if it is not replacing a portable CDO that
/// contains more information.
/// For example, we will not allow a speculative Ssn4 to replace a portable Ssn9. We will allow
/// a speculative Ssn9 to replace a portable Ssn9 or portable Ssn4, though.
fn decide_data_to_portablize(data: CurrentData) -> HashSet<CollectedDataOption> {
    let CurrentData {
        speculative,
        portable,
    } = data;
    // Split the list of speculative CDOs based on whether they should be portable or not
    speculative
        .into_iter()
        .filter(|speculative_cdo| {
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
        })
        .collect()
}

// Can only portablize identity data
impl WriteableVw<Person> {
    /// Marks all speculative identity data data as portable.
    /// This makes the data available for prefill to future onboardings for this vault.
    /// Intentionally consumes the UVW to prevent using a stale reference.
    /// NOTE: this DOES NOT portablize custom data or identity documents since we haven't figured
    /// out the portability story for those types of data.
    #[tracing::instrument("WriteableVw::portablize_identity_data", skip_all)]
    pub fn portablize_identity_data(self, conn: &mut TxnPgConn) -> FpResult<DataLifetimeSeqno> {
        // TODO only portablize data collected by the ob config rather than all data
        // TODO also only portablize the _exact_ data that was sent off to be verified. It's possible
        // the data has been changed via API in between sending VReqs and now.
        let Self { uvw, sv } = self;
        // Use the same seqno to deactivate old data and portablize new data
        let seqno = DataLifetime::get_next_seqno(conn, &sv)?;

        if !uvw.vault.is_portable {
            Vault::mark_portable(conn, &uvw.vault.id)?;
        }

        // Compute the portable VW view to see what data is already portable
        let portable_vw = VaultWrapper::<Person>::build_portable(conn, &uvw.vault.id)?;
        let portable = portable_vw.populated_dis();

        // Compute the set of data that was added during this onboarding and is not yet portable
        let mut speculative: HashMap<_, _> = uvw
            .populated_dis()
            .into_iter()
            .filter_map(|di| uvw.data(&di))
            // Don't portablize data that was prefilled into this vault from another
            .filter(|d| d.lifetime.origin_id.is_none())
            .filter(|d| d.is_speculative())
            .map(|d| (d.lifetime.kind.clone(), d.lifetime.id.clone()))
            .collect();

        // Determine which CDOs we'll be portablizing, taking care to not portablize a partial CDO
        // when a full CDO is already portable
        let to_portablize_cdos = decide_data_to_portablize(CurrentData {
            speculative: CollectedDataOption::list_from(speculative.keys().cloned().collect()),
            portable: CollectedDataOption::list_from(portable),
        });
        let to_portablize_ids: Vec<_> = to_portablize_cdos
            .into_iter()
            // Purposefully only take IDKs because we only want to portablize identity fields
            .flat_map(|o| o.data_identifiers().unwrap_or_default())
            .filter(|di| matches!(di, DataIdentifier::Id(_)))
            .filter_map(|di| speculative.remove(&di))
            .collect();

        DataLifetime::bulk_portablize_for_tenant(conn, to_portablize_ids, &sv.id, seqno)?;

        Ok(seqno)
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
        vec![Name] => None
    )]
    #[test_case(
        vec![Name, Ssn4], vec![Name, Ssn9],
        // Don't portablize ssn4 because we already have ssn9
        vec![Name] => None
    )]
    #[test_case(
        vec![Dob, Ssn9], vec![Ssn9],
        // Allow replacing Ssn9
        vec![Dob, Ssn9] => None
    )]
    #[test_case(
        vec![Dob, Ssn9], vec![Ssn4],
        // Allow replacing Ssn4 with an Ssn9
        vec![Dob, Ssn9] => None
    )]
    #[test_case(
        vec![FullAddress], vec![FullAddress],
        // Allow replacing full address
        vec![FullAddress] => None
    )]
    fn test_decide_data_to_portablize(
        speculative: Vec<CollectedDataOption>,
        portable: Vec<CollectedDataOption>,
        expected_to_portablize: Vec<CollectedDataOption>,
    ) -> Option<usize> {
        let current_data = CurrentData {
            speculative: speculative.into_iter().collect(),
            portable: portable.into_iter().collect(),
        };
        let to_portablize = decide_data_to_portablize(current_data);
        assert_eq!(
            to_portablize,
            HashSet::from_iter(expected_to_portablize.into_iter())
        );
        None
    }
}
