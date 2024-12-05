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

#[derive(Default)]
struct DupeCounter {
    strong_fraud_count: i32,
    strong_active_count: i32,
    medium_fraud_count: i32,
    medium_active_count: i32,
}
impl DupeCounter {
    fn new() -> Self {
        Self::default()
    }

    fn add(&mut self, connection_kind: &DupeConnectionKind, label_kind: &LabelKind) {
        match (connection_kind, label_kind) {
            (DupeConnectionKind::Strong, _) if label_kind.is_fraud() => self.strong_fraud_count += 1,
            (DupeConnectionKind::Strong, _) if label_kind.is_active() => self.strong_active_count += 1,
            (DupeConnectionKind::Medium, _) if label_kind.is_fraud() => self.medium_fraud_count += 1,
            (DupeConnectionKind::Medium, _) if label_kind.is_active() => self.medium_active_count += 1,
            _ => (),
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
}
pub fn footprint_reason_codes(
    sv_id: &ScopedVaultId,
    duplicate_data: Vec<DuplicateData>,
) -> Vec<FootprintReasonCode> {
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
                dd.label.map(|l| (dd.kind, l))
            }
        })
        .collect_vec();

    let dupe_counter = labeled_dupes
        .iter()
        .fold(DupeCounter::new(), |mut acc, (kind, label)| {
            if let Some(connection_kind) = DupeConnectionKind::from_dupe_kind(*kind) {
                acc.add(&connection_kind, label);
            }
            acc
        });


    vec![
        dupe_counter
            .has_fraud_dupes(&DupeConnectionKind::Strong)
            .then_some(FootprintReasonCode::StrongConnectionToLabeledFraud),
        dupe_counter
            .has_fraud_dupes(&DupeConnectionKind::Medium)
            .then_some(FootprintReasonCode::MediumConnectionToLabeledFraud),
        dupe_counter
            .has_active_dupes(&DupeConnectionKind::Strong)
            .then_some(FootprintReasonCode::StrongConnectionToLabeledActive),
        dupe_counter
            .has_active_dupes(&DupeConnectionKind::Medium)
            .then_some(FootprintReasonCode::MediumConnectionToLabeledActive),
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
    fn test_dupes(kind: DupeKind, label: LabelKind, expected: Vec<FRC>) {
        let sv_id = ScopedVaultId::test_data("sv_1234".to_string());
        let dupe_sv_id = ScopedVaultId::test_data("sv_5678".to_string());
        let data = vec![make_duplicate_data(kind, Some(label), dupe_sv_id)];
        assert_have_same_elements(footprint_reason_codes(&sv_id, data), expected);
    }

    #[test_case(DupeKind::DeviceId, DupeKind::NameDob, vec![FRC::StrongConnectionToLabeledFraud, FRC::MediumConnectionToLabeledActive])]
    #[test_case(DupeKind::Ssn9, DupeKind::DobSsn4, vec![FRC::StrongConnectionToLabeledFraud, FRC::MediumConnectionToLabeledActive])]
    fn test_multiple_dupes(strong_kind: DupeKind, medium_kind: DupeKind, expected: Vec<FRC>) {
        let sv_id = ScopedVaultId::test_data("sv_1234".to_string());
        let dupe_sv_id = ScopedVaultId::test_data("sv_5678".to_string());
        let data = vec![
            make_duplicate_data(strong_kind, Some(LabelKind::OffboardFraud), dupe_sv_id.clone()),
            make_duplicate_data(medium_kind, Some(LabelKind::Active), dupe_sv_id),
        ];
        assert_have_same_elements(footprint_reason_codes(&sv_id, data), expected);
    }


    #[test_case(DupeKind::DeviceId, DupeKind::NameDob, LabelKind::OffboardFraud, vec![FRC::StrongConnectionToLabeledFraud])]
    #[test_case(DupeKind::Ssn9, DupeKind::DobSsn4, LabelKind::OffboardFraud, vec![FRC::StrongConnectionToLabeledFraud])]
    #[test_case(DupeKind::DeviceId, DupeKind::NameDob, LabelKind::Active, vec![FRC::StrongConnectionToLabeledActive])]
    #[test_case(DupeKind::Ssn9, DupeKind::DobSsn4, LabelKind::Active, vec![FRC::StrongConnectionToLabeledActive])]
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
        let data = vec![
            make_duplicate_data(kind, Some(LabelKind::OffboardOther), dupe_sv_id.clone()),
            make_duplicate_data(kind, None, dupe_sv_id),
        ];
        assert!(footprint_reason_codes(&sv_id, data).is_empty());
    }
}
