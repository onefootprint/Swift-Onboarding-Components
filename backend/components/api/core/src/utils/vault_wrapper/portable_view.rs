use db::models::data_lifetime::DataLifetime;
use itertools::Itertools;
use std::collections::HashMap;

/// When data is replaced within a tenant, we'll deactivate any other fields that are
/// part of the CDO, even if not provided. For ex, adding a new address without a line2
/// will delete the old address's line2.
/// But, the portable view doesn't obey the `deactivated_seqno` on a DL, and we can't
/// deactivate other tenants' data.
/// So here, we omit all optional DIs if they are not the most recent for that CDO.
/// For ex, we'll omit an address line 2 DL if there's a newer address (without a line2)
/// from a different tenant
pub(super) fn filter_dls_for_portable_view(dls: Vec<DataLifetime>) -> Vec<DataLifetime> {
    // Assemble a map of DI to the most recently portablized for that DL.
    let latest_dls: HashMap<_, _> = dls
        .iter()
        .into_group_map_by(|dl| &dl.kind)
        .into_iter()
        .filter_map(|(_, dls)| {
            dls.into_iter()
                .filter(|dl| dl.portablized_seqno.is_some())
                .max_by_key(|dl| dl.portablized_seqno)
                .map(|dl| (dl.kind.clone(), dl.clone()))
        })
        .collect();
    dls.into_iter()
        .filter(|dl| {
            // Very custom logic to ignore AddressLine2 in some conditions to obey CDO rules
            // Only use optional DIs IF the required DIs for that CDO at that tenant are the latest
            let Some(parent_cd) = dl.kind.parent() else {
                // Some DIs don't have CDO, arbitrarily keep them.
                // In reality, we'll never really have portable data without a CDO
                return true;
            };
            // A DI is "optional" if it belongs to a CDO, but the CDO doesn't require it
            let is_optional = parent_cd
                .options()
                .iter()
                .all(|cdo| !cdo.required_data_identifiers().contains(&dl.kind));
            if !is_optional {
                // Keep all data that is required
                return true;
            }
            // Get the latest lifetime for a required DI in this CDO.
            // We'll include this optional DI if and only if the latest required DI was
            // added by this tenant and portablized at the same time
            parent_cd
                .options()
                .first()
                .and_then(|cdo| cdo.required_data_identifiers().into_iter().next())
                .and_then(|required_di_for_cdo| latest_dls.get(&required_di_for_cdo))
                .is_some_and(|latest_dl| {
                    latest_dl.scoped_vault_id == dl.scoped_vault_id
                        && latest_dl.portablized_seqno == dl.portablized_seqno
                })
        })
        .collect_vec()
}

#[cfg(test)]
mod test {
    use super::filter_dls_for_portable_view;
    use chrono::Utc;
    use db::models::data_lifetime::DataLifetime;
    use newtypes::{
        DataLifetimeId,
        DataLifetimeSeqno,
        DataLifetimeSource,
        IdentityDataKind as IDK,
        ScopedVaultId,
        VaultId,
    };
    use test_case::test_case;

    #[test_case(
        vec![
            // Tenant 1 adds address with line2
            ("sv_id1".into(), IDK::AddressLine1, 1),
            ("sv_id1".into(), IDK::AddressLine2, 1),
            ("sv_id1".into(), IDK::City, 1),
            ("sv_id1".into(), IDK::State, 1),
            ("sv_id1".into(), IDK::Zip, 1),
            ("sv_id1".into(), IDK::Country, 1),
        ] => vec![
            // Should see everything added
            ("sv_id1".into(), IDK::AddressLine1, 1),
            ("sv_id1".into(), IDK::AddressLine2, 1),
            ("sv_id1".into(), IDK::City, 1),
            ("sv_id1".into(), IDK::State, 1),
            ("sv_id1".into(), IDK::Zip, 1),
            ("sv_id1".into(), IDK::Country, 1),
        ];
        "simple-address"
    )]
    #[test_case(
        vec![
            // Tenant 1 adds address with line2
            ("sv_id1".into(), IDK::AddressLine1, 1),
            ("sv_id1".into(), IDK::AddressLine2, 1),
            ("sv_id1".into(), IDK::City, 1),
            ("sv_id1".into(), IDK::State, 1),
            ("sv_id1".into(), IDK::Zip, 1),
            ("sv_id1".into(), IDK::Country, 1),
            // Tenant 1 adds address without line2
            ("sv_id1".into(), IDK::AddressLine1, 2),
            ("sv_id1".into(), IDK::City, 2),
            ("sv_id1".into(), IDK::State, 2),
            ("sv_id1".into(), IDK::Zip, 2),
            ("sv_id1".into(), IDK::Country, 2),
            // For good measure, another CDO
            ("sv_id2".into(), IDK::Dob, 3),
        ] => vec![
            // Everything from first address EXCEPT the line 2
            ("sv_id1".into(), IDK::AddressLine1, 1),
            // Filtered out the AddressLine2 here.
            // Also City, State, and Zip just because they're optional for international addresses.
            // Won't affect the reads because we have the full address added at seqno2
            ("sv_id1".into(), IDK::Country, 1),
            // Everything from second address
            ("sv_id1".into(), IDK::AddressLine1, 2),
            ("sv_id1".into(), IDK::City, 2),
            ("sv_id1".into(), IDK::State, 2),
            ("sv_id1".into(), IDK::Zip, 2),
            ("sv_id1".into(), IDK::Country, 2),
            // + Dob
            ("sv_id2".into(), IDK::Dob, 3),
        ];
        "omit address line2"
    )]
    #[test_case(
        vec![
            // Tenant 1 adds us legal status
            ("sv_id1".into(), IDK::UsLegalStatus, 1),
            ("sv_id1".into(), IDK::Nationality, 1),
            ("sv_id1".into(), IDK::VisaKind, 1),
            ("sv_id1".into(), IDK::VisaExpirationDate, 1),
            ("sv_id1".into(), IDK::Citizenships, 1),
            // Tenant 2 adds us legal status
            ("sv_id2".into(), IDK::UsLegalStatus, 2),
        ] => vec![
            // Hide all the optional legal status fields from tenant 1
            ("sv_id1".into(), IDK::UsLegalStatus, 1),
            ("sv_id2".into(), IDK::UsLegalStatus, 2),
        ];
        "us legal status"
    )]
    #[test_case(
        vec![
            // Tenant 1 adds ssn4
            ("sv_id1".into(), IDK::Ssn4, 1),
            // Tenant 2 adds ssn9
            ("sv_id2".into(), IDK::Ssn4, 2),
            ("sv_id2".into(), IDK::Ssn9, 2),
        ] => vec![
            // See everything
            ("sv_id1".into(), IDK::Ssn4, 1),
            ("sv_id2".into(), IDK::Ssn4, 2),
            ("sv_id2".into(), IDK::Ssn9, 2),
        ];
        "simple ssn"
    )]
    fn test_filter_dls_for_portable_view(dls: Vec<(String, IDK, i64)>) -> Vec<(String, IDK, i64)> {
        let dls = dls
            .into_iter()
            .map(|(sv_id, kind, portablized)| DataLifetime {
                scoped_vault_id: ScopedVaultId::from(sv_id),
                kind: kind.into(),
                portablized_seqno: Some(DataLifetimeSeqno::from(portablized)),
                // Unused
                id: DataLifetimeId::test_data("dl_x".into()),
                vault_id: VaultId::test_data("v_id".into()),
                created_seqno: DataLifetimeSeqno::from(0),
                // Should ignore deactivated seqno
                deactivated_seqno: Some(DataLifetimeSeqno::from(1)),
                created_at: Utc::now(),
                portablized_at: None,
                deactivated_at: None,
                _created_at: Utc::now(),
                _updated_at: Utc::now(),
                source: DataLifetimeSource::LikelyHosted,
                actor: None,
                origin_id: None,
            })
            .collect();
        let results = filter_dls_for_portable_view(dls);
        results
            .into_iter()
            .map(|dl| {
                (
                    dl.scoped_vault_id.to_string(),
                    IDK::try_from(dl.kind).unwrap(),
                    dl.portablized_seqno.unwrap().into(),
                )
            })
            .collect()
    }
}
