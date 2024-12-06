use crate::decision::duplicates::DuplicateData;
use itertools::Itertools;
use newtypes::DupeKind;
use newtypes::FootprintReasonCode;
use newtypes::LabelKind;
use newtypes::ScopedVaultId;


const STRONG_DUPE_KINDS: [DupeKind; 5] = [
    DupeKind::DeviceId,
    DupeKind::CookieId,
    DupeKind::Ssn9,
    DupeKind::BankRoutingAccount,
    DupeKind::IdentityDocumentNumber,
];

const MEDIUM_DUPE_KINDS: [DupeKind; 3] = [DupeKind::NameDob, DupeKind::DobSsn4, DupeKind::NameSsn4];

#[derive(Debug, Clone, Hash, PartialEq, Eq)]
enum DupeConnectionKind {
    Strong,
    Medium,
}
impl DupeConnectionKind {
    fn from_dupe_kind(kind: DupeKind) -> Option<Self> {
        if STRONG_DUPE_KINDS.contains(&kind) {
            Some(DupeConnectionKind::Strong)
        } else if MEDIUM_DUPE_KINDS.contains(&kind) {
            Some(DupeConnectionKind::Medium)
        } else {
            None
        }
    }
}

trait Monoid {
    fn zero() -> Self;
    fn plus(l: Self, r: Self) -> Self;
}

#[derive(Default, PartialEq, Eq, Debug)]
struct DupeCounter {
    strong_fraud_count: i32,
    strong_active_count: i32,
    strong_offboard_other_count: i32,
    medium_fraud_count: i32,
    medium_active_count: i32,
    medium_offboard_other_count: i32,
}

impl DupeCounter {
    fn new(connection_kind: &DupeConnectionKind, label_kind: &LabelKind) -> Self {
        Self {
            strong_fraud_count: matches!((connection_kind, label_kind), (DupeConnectionKind::Strong, k) if k.is_fraud()).into(),
            strong_active_count: matches!((connection_kind, label_kind), (DupeConnectionKind::Strong, k) if k.is_active()).into(),
            strong_offboard_other_count: matches!((connection_kind, label_kind), (DupeConnectionKind::Strong, k) if k.is_offboard_non_fraud()).into(),
            medium_fraud_count: matches!((connection_kind, label_kind), (DupeConnectionKind::Medium, k) if k.is_fraud()).into(),
            medium_active_count: matches!((connection_kind, label_kind), (DupeConnectionKind::Medium, k) if k.is_active()).into(),
            medium_offboard_other_count: i32::from(
                matches!((connection_kind, label_kind), (DupeConnectionKind::Medium, k) if k.is_offboard_non_fraud()),
            ),
        }
    }

    fn has_fraud_dupes(&self, connection_kind: &DupeConnectionKind) -> bool {
        match connection_kind {
            DupeConnectionKind::Strong => self.strong_fraud_count > 0,
            DupeConnectionKind::Medium => self.medium_fraud_count > 0,
        }
    }

    fn has_active_dupes(&self, connection_kind: &DupeConnectionKind) -> bool {
        match connection_kind {
            DupeConnectionKind::Strong => self.strong_active_count > 0,
            DupeConnectionKind::Medium => self.medium_active_count > 0,
        }
    }

    fn has_offboard_other_dupes(&self, connection_kind: &DupeConnectionKind) -> bool {
        match connection_kind {
            DupeConnectionKind::Strong => self.strong_offboard_other_count > 0,
            DupeConnectionKind::Medium => self.medium_offboard_other_count > 0,
        }
    }
}

impl Monoid for DupeCounter {
    fn zero() -> Self {
        Self::default()
    }

    fn plus(l: DupeCounter, r: DupeCounter) -> DupeCounter {
        DupeCounter {
            strong_fraud_count: l.strong_fraud_count + r.strong_fraud_count,
            strong_active_count: l.strong_active_count + r.strong_active_count,
            strong_offboard_other_count: l.strong_offboard_other_count + r.strong_offboard_other_count,
            medium_fraud_count: l.medium_fraud_count + r.medium_fraud_count,
            medium_active_count: l.medium_active_count + r.medium_active_count,
            medium_offboard_other_count: l.medium_offboard_other_count + r.medium_offboard_other_count,
        }
    }
}

pub fn footprint_reason_codes(
    sv_id: &ScopedVaultId,
    duplicate_data: Vec<DuplicateData>,
) -> Vec<FootprintReasonCode> {
    let dupe_counts = create_counts(duplicate_data, sv_id);

    vec![
        dupe_counts
            .has_fraud_dupes(&DupeConnectionKind::Strong)
            .then_some(FootprintReasonCode::StrongConnectionToLabeledFraud),
        dupe_counts
            .has_fraud_dupes(&DupeConnectionKind::Medium)
            .then_some(FootprintReasonCode::MediumConnectionToLabeledFraud),
        dupe_counts
            .has_active_dupes(&DupeConnectionKind::Strong)
            .then_some(FootprintReasonCode::StrongConnectionToLabeledActive),
        dupe_counts
            .has_active_dupes(&DupeConnectionKind::Medium)
            .then_some(FootprintReasonCode::MediumConnectionToLabeledActive),
        dupe_counts
            .has_offboard_other_dupes(&DupeConnectionKind::Strong)
            .then_some(FootprintReasonCode::StrongConnectionToLabeledOffboardOther),
        dupe_counts
            .has_offboard_other_dupes(&DupeConnectionKind::Medium)
            .then_some(FootprintReasonCode::MediumConnectionToLabeledOffboardOther),
    ]
    .into_iter()
    .flatten()
    .unique()
    .collect()
}

fn create_counts(duplicate_data: Vec<DuplicateData>, sv_id: &ScopedVaultId) -> DupeCounter {
    let labeled_dupes = duplicate_data
        .iter()
        .filter_map(|dd| {
            // sanity check we don't have bug in the duplicate fetching code
            let sv_id_matches_input = &dd.sv_id == sv_id;
            if sv_id_matches_input {
                tracing::error!(
                    ?sv_id,
                    "duplicate query returning sv_ids of user that is onboarding"
                );
                None
            } else {
                dd.label
                    .and_then(|l| DupeConnectionKind::from_dupe_kind(dd.kind).map(|ck| (ck, l)))
            }
        })
        .collect_vec();

    labeled_dupes
        .iter()
        .map(|(ck, label)| DupeCounter::new(ck, label))
        .fold(DupeCounter::zero(), DupeCounter::plus)
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

    #[test_case(DupeKind::DeviceId, LabelKind::OffboardFraud, vec![FRC::StrongConnectionToLabeledFraud])]
    #[test_case(DupeKind::CookieId, LabelKind::OffboardFraud, vec![FRC::StrongConnectionToLabeledFraud])]
    #[test_case(DupeKind::Ssn9, LabelKind::OffboardFraud, vec![FRC::StrongConnectionToLabeledFraud])]
    #[test_case(DupeKind::BankRoutingAccount, LabelKind::OffboardFraud, vec![FRC::StrongConnectionToLabeledFraud])]
    #[test_case(DupeKind::IdentityDocumentNumber, LabelKind::OffboardFraud, vec![FRC::StrongConnectionToLabeledFraud])]
    #[test_case(DupeKind::NameDob, LabelKind::OffboardFraud, vec![FRC::MediumConnectionToLabeledFraud])]
    #[test_case(DupeKind::DobSsn4, LabelKind::OffboardFraud, vec![FRC::MediumConnectionToLabeledFraud])]
    #[test_case(DupeKind::NameSsn4, LabelKind::OffboardFraud, vec![FRC::MediumConnectionToLabeledFraud])]
    // Active
    #[test_case(DupeKind::DeviceId, LabelKind::Active, vec![FRC::StrongConnectionToLabeledActive])]
    #[test_case(DupeKind::CookieId, LabelKind::Active, vec![FRC::StrongConnectionToLabeledActive])]
    #[test_case(DupeKind::Ssn9, LabelKind::Active, vec![FRC::StrongConnectionToLabeledActive])]
    #[test_case(DupeKind::BankRoutingAccount, LabelKind::Active, vec![FRC::StrongConnectionToLabeledActive])]
    #[test_case(DupeKind::IdentityDocumentNumber, LabelKind::Active, vec![FRC::StrongConnectionToLabeledActive])]
    #[test_case(DupeKind::NameDob, LabelKind::Active, vec![FRC::MediumConnectionToLabeledActive])]
    #[test_case(DupeKind::DobSsn4, LabelKind::Active, vec![FRC::MediumConnectionToLabeledActive])]
    #[test_case(DupeKind::NameSsn4, LabelKind::Active, vec![FRC::MediumConnectionToLabeledActive])]
    // Offboard other
    #[test_case(DupeKind::DeviceId, LabelKind::OffboardOther, vec![FRC::StrongConnectionToLabeledOffboardOther])]
    #[test_case(DupeKind::CookieId, LabelKind::OffboardOther, vec![FRC::StrongConnectionToLabeledOffboardOther])]
    #[test_case(DupeKind::Ssn9, LabelKind::OffboardOther, vec![FRC::StrongConnectionToLabeledOffboardOther])]
    #[test_case(DupeKind::BankRoutingAccount, LabelKind::OffboardOther, vec![FRC::StrongConnectionToLabeledOffboardOther])]
    #[test_case(DupeKind::IdentityDocumentNumber, LabelKind::OffboardOther, vec![FRC::StrongConnectionToLabeledOffboardOther])]
    #[test_case(DupeKind::NameDob, LabelKind::OffboardOther, vec![FRC::MediumConnectionToLabeledOffboardOther])]
    #[test_case(DupeKind::DobSsn4, LabelKind::OffboardOther, vec![FRC::MediumConnectionToLabeledOffboardOther])]
    #[test_case(DupeKind::NameSsn4, LabelKind::OffboardOther, vec![FRC::MediumConnectionToLabeledOffboardOther])]
    fn test_dupes(kind: DupeKind, label: LabelKind, expected: Vec<FRC>) {
        let sv_id = ScopedVaultId::test_data("sv_1234".to_string());
        let dupe_sv_id = ScopedVaultId::test_data("sv_5678".to_string());
        let data = vec![make_duplicate_data(kind, Some(label), dupe_sv_id)];
        assert_have_same_elements(footprint_reason_codes(&sv_id, data), expected);
    }

    #[test_case(DupeKind::DeviceId, DupeKind::NameDob, vec![FRC::StrongConnectionToLabeledFraud, FRC::MediumConnectionToLabeledActive, FRC::MediumConnectionToLabeledOffboardOther])]
    #[test_case(DupeKind::Ssn9, DupeKind::DobSsn4, vec![FRC::StrongConnectionToLabeledFraud, FRC::MediumConnectionToLabeledActive, FRC::MediumConnectionToLabeledOffboardOther])]
    fn test_multiple_dupes(strong_kind: DupeKind, medium_kind: DupeKind, expected: Vec<FRC>) {
        let sv_id = ScopedVaultId::test_data("sv_1234".to_string());
        let dupe_sv_id = ScopedVaultId::test_data("sv_5678".to_string());
        let data = vec![
            make_duplicate_data(strong_kind, Some(LabelKind::OffboardFraud), dupe_sv_id.clone()),
            make_duplicate_data(medium_kind, Some(LabelKind::Active), dupe_sv_id.clone()),
            make_duplicate_data(medium_kind, Some(LabelKind::OffboardOther), dupe_sv_id),
        ];
        assert_have_same_elements(footprint_reason_codes(&sv_id, data), expected);
    }


    #[test_case(DupeKind::DeviceId, DupeKind::NameDob, LabelKind::OffboardFraud, vec![FRC::StrongConnectionToLabeledFraud])]
    #[test_case(DupeKind::Ssn9, DupeKind::DobSsn4, LabelKind::OffboardFraud, vec![FRC::StrongConnectionToLabeledFraud])]
    #[test_case(DupeKind::DeviceId, DupeKind::NameDob, LabelKind::Active, vec![FRC::StrongConnectionToLabeledActive])]
    #[test_case(DupeKind::Ssn9, DupeKind::DobSsn4, LabelKind::Active, vec![FRC::StrongConnectionToLabeledActive])]
    #[test_case(DupeKind::DeviceId, DupeKind::NameDob, LabelKind::OffboardOther, vec![FRC::StrongConnectionToLabeledOffboardOther])]
    #[test_case(DupeKind::Ssn9, DupeKind::DobSsn4, LabelKind::OffboardOther, vec![FRC::StrongConnectionToLabeledOffboardOther])]
    fn test_multiple_dupes_one_non_labeled(
        strong_kind: DupeKind,
        medium_kind: DupeKind,
        label: LabelKind,
        expected: Vec<FRC>,
    ) {
        let sv_id = ScopedVaultId::test_data("sv_1234".to_string());
        let dupe_sv_id = ScopedVaultId::test_data("sv_5678".to_string());
        let data = vec![
            make_duplicate_data(strong_kind, Some(label), dupe_sv_id.clone()),
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
        let data = vec![make_duplicate_data(kind, None, dupe_sv_id)];
        assert!(footprint_reason_codes(&sv_id, data).is_empty());
    }

    #[test]
    fn test_create_counts() {
        let sv_id = ScopedVaultId::test_data("sv_1234".to_string());
        let dupe_sv_id = ScopedVaultId::test_data("sv_5678".to_string());
        let data = vec![
            // not a dupe kind yet, filtered out
            make_duplicate_data(
                DupeKind::Selfie,
                Some(LabelKind::OffboardFraud),
                dupe_sv_id.clone(),
            ),
            make_duplicate_data(DupeKind::NameDob, Some(LabelKind::Active), dupe_sv_id.clone()),
            make_duplicate_data(
                DupeKind::NameDob,
                Some(LabelKind::OffboardFraud),
                dupe_sv_id.clone(),
            ),
            make_duplicate_data(
                DupeKind::DeviceId,
                Some(LabelKind::OffboardOther),
                dupe_sv_id.clone(),
            ),
            make_duplicate_data(
                DupeKind::NameSsn4,
                Some(LabelKind::OffboardFraud),
                dupe_sv_id.clone(),
            ),
            make_duplicate_data(
                DupeKind::BankRoutingAccount,
                Some(LabelKind::OffboardOther),
                dupe_sv_id.clone(),
            ),
            make_duplicate_data(DupeKind::DeviceId, Some(LabelKind::Active), dupe_sv_id),
        ];

        let expected = DupeCounter {
            strong_fraud_count: 0,
            strong_active_count: 1,
            strong_offboard_other_count: 2,
            medium_fraud_count: 2,
            medium_active_count: 1,
            medium_offboard_other_count: 0,
        };
        let counts = create_counts(data, &sv_id);
        assert_eq!(counts, expected);
    }
}
