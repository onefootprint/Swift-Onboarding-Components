use crate::decision::duplicates::DuplicateData;
use itertools::Itertools;
use newtypes::DupeKind;
use newtypes::FootprintReasonCode;
use newtypes::ScopedVaultId;


// These are debatable at scale
const STRONG_DUPE_KINDS: [DupeKind; 5] = [
    DupeKind::DeviceId,
    DupeKind::CookieId,
    DupeKind::Ssn9,
    DupeKind::BankRoutingAccount,
    DupeKind::IdentityDocumentNumber,
];

const MEDIUM_DUPE_KINDS: [DupeKind; 3] = [DupeKind::NameDob, DupeKind::DobSsn4, DupeKind::NameSsn4];

pub fn footprint_reason_codes(
    sv_id: &ScopedVaultId,
    duplicate_data: Vec<DuplicateData>,
) -> Vec<FootprintReasonCode> {
    let duplicates_labeled_fraud = duplicate_data
        .iter()
        .filter(|dd| {
            // sanity check we don't have bug in the duplicate fetching code
            let sv_id_matches_input = &dd.sv_id == sv_id;
            if sv_id_matches_input {
                tracing::error!(
                    ?sv_id,
                    "duplicate query returning sv_ids of user that is onboarding"
                );
            }

            !sv_id_matches_input && dd.label.is_some_and(|l| l.is_fraud())
        })
        .collect_vec();

    let exist_strong_dupes = duplicates_labeled_fraud
        .iter()
        .any(|dd| STRONG_DUPE_KINDS.contains(&dd.kind));


    let exist_medium_dupes = duplicates_labeled_fraud
        .iter()
        .any(|dd| MEDIUM_DUPE_KINDS.contains(&dd.kind));

    vec![
        exist_strong_dupes.then_some(FootprintReasonCode::StrongConnectionToLabeledFraud),
        exist_medium_dupes.then_some(FootprintReasonCode::MediumConnectionToLabeledFraud),
    ]
    .into_iter()
    .flatten()
    .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use db::test_helpers::assert_have_same_elements;
    use newtypes::FpId;
    use newtypes::LabelKind;
    use newtypes::ScopedVaultId;
    use test_case::test_case;
    use FootprintReasonCode as FRC;

    fn make_duplicate_data(kind: DupeKind, label: Option<LabelKind>, sv_id: ScopedVaultId) -> DuplicateData {
        DuplicateData {
            fp_id: FpId::test_data("fp_123".to_string()), // doesn't matter
            sv_id,
            kind,
            label,
            tags: vec![],
        }
    }

    #[test_case(DupeKind::DeviceId, vec![FRC::StrongConnectionToLabeledFraud])]
    #[test_case(DupeKind::CookieId, vec![FRC::StrongConnectionToLabeledFraud])]
    #[test_case(DupeKind::Ssn9, vec![FRC::StrongConnectionToLabeledFraud])]
    #[test_case(DupeKind::BankRoutingAccount, vec![FRC::StrongConnectionToLabeledFraud])]
    #[test_case(DupeKind::IdentityDocumentNumber, vec![FRC::StrongConnectionToLabeledFraud])]
    #[test_case(DupeKind::NameDob, vec![FRC::MediumConnectionToLabeledFraud])]
    #[test_case(DupeKind::DobSsn4, vec![FRC::MediumConnectionToLabeledFraud])]
    #[test_case(DupeKind::NameSsn4, vec![FRC::MediumConnectionToLabeledFraud])]
    fn test_dupes(kind: DupeKind, expected: Vec<FRC>) {
        let sv_id = ScopedVaultId::test_data("sv_1234".to_string());
        let dupe_sv_id = ScopedVaultId::test_data("sv_5678".to_string());
        let data = vec![make_duplicate_data(
            kind,
            Some(LabelKind::OffboardFraud),
            dupe_sv_id,
        )];
        assert_have_same_elements(footprint_reason_codes(&sv_id, data), expected);
    }

    #[test_case(DupeKind::DeviceId, DupeKind::NameDob, vec![FRC::StrongConnectionToLabeledFraud, FRC::MediumConnectionToLabeledFraud])]
    #[test_case(DupeKind::Ssn9, DupeKind::DobSsn4, vec![FRC::StrongConnectionToLabeledFraud, FRC::MediumConnectionToLabeledFraud])]
    fn test_multiple_dupes(strong_kind: DupeKind, medium_kind: DupeKind, expected: Vec<FRC>) {
        let sv_id = ScopedVaultId::test_data("sv_1234".to_string());
        let dupe_sv_id = ScopedVaultId::test_data("sv_5678".to_string());
        let data = vec![
            make_duplicate_data(strong_kind, Some(LabelKind::OffboardFraud), dupe_sv_id.clone()),
            make_duplicate_data(medium_kind, Some(LabelKind::OffboardFraud), dupe_sv_id),
        ];
        assert_have_same_elements(footprint_reason_codes(&sv_id, data), expected);
    }


    #[test_case(DupeKind::DeviceId, DupeKind::NameDob, vec![FRC::StrongConnectionToLabeledFraud])]
    #[test_case(DupeKind::Ssn9, DupeKind::DobSsn4, vec![FRC::StrongConnectionToLabeledFraud])]
    fn test_multiple_dupes_one_non_fraud(strong_kind: DupeKind, medium_kind: DupeKind, expected: Vec<FRC>) {
        let sv_id = ScopedVaultId::test_data("sv_1234".to_string());
        let dupe_sv_id = ScopedVaultId::test_data("sv_5678".to_string());
        let data = vec![
            make_duplicate_data(strong_kind, Some(LabelKind::OffboardFraud), dupe_sv_id.clone()),
            make_duplicate_data(medium_kind, None, dupe_sv_id),
        ];
        assert_have_same_elements(footprint_reason_codes(&sv_id, data), expected);
    }

    #[test]
    fn test_bug_in_duplicate_fetching() {
        let sv_id = ScopedVaultId::test_data("sv_1234".to_string());
        let data = vec![make_duplicate_data(
            DupeKind::DeviceId,
            Some(LabelKind::OffboardFraud),
            sv_id.clone(),
        )];
        assert!(footprint_reason_codes(&sv_id, data).is_empty());
    }

    #[test_case(DupeKind::DeviceId)]
    #[test_case(DupeKind::CookieId)]
    #[test_case(DupeKind::Ssn9)]
    #[test_case(DupeKind::BankRoutingAccount)]
    #[test_case(DupeKind::IdentityDocumentNumber)]
    #[test_case(DupeKind::NameDob)]
    #[test_case(DupeKind::DobSsn4)]
    #[test_case(DupeKind::NameSsn4)]
    fn test_non_fraud_dupes(kind: DupeKind) {
        let sv_id = ScopedVaultId::test_data("sv_1234".to_string());
        let dupe_sv_id = ScopedVaultId::test_data("sv_5678".to_string());
        let data = vec![
            make_duplicate_data(kind, Some(LabelKind::Active), dupe_sv_id.clone()),
            make_duplicate_data(kind, Some(LabelKind::OffboardOther), dupe_sv_id.clone()),
            make_duplicate_data(kind, None, dupe_sv_id),
        ];
        assert!(footprint_reason_codes(&sv_id, data).is_empty());
    }
}
