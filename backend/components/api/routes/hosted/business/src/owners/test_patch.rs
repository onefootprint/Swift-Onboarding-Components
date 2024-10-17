use super::patch::verify_unique_phones_and_emails;
use super::patch::BatchRequest;
use api_core::utils::vault_wrapper::BusinessOwnerInfo;
use api_core::utils::vault_wrapper::FingerprintedDataRequest;
use chrono::Utc;
use db::models::business_owner::BusinessOwner;
use itertools::Itertools;
use newtypes::put_data_request::PatchDataRequest;
use newtypes::BoId;
use newtypes::BoLinkId;
use newtypes::BusinessDataKind as BDK;
use newtypes::BusinessOwnerKind;
use newtypes::BusinessOwnerSource;
use newtypes::DataIdentifier as DI;
use newtypes::IdentityDataKind as IDK;
use newtypes::PiiJsonValue;
use newtypes::PiiString;
use newtypes::ValidateArgs;
use newtypes::VaultId;
use std::collections::HashMap;
use test_case::test_case;

#[test_case(vec![(DI::Id(IDK::PhoneNumber), "+15555550100")], vec![
    (
        BoLinkId::generate(BusinessOwnerKind::Secondary),
        vec![(DI::Id(IDK::PhoneNumber), "+15555550100")].into_iter().collect(),
    ),
], false => true; "can_have_repeat_in_sandbox")]
#[test_case(vec![(DI::Id(IDK::PhoneNumber), "+15555550100")], vec![
    (
        BoLinkId::generate(BusinessOwnerKind::Secondary),
        vec![(DI::Id(IDK::PhoneNumber), "+15555550100")].into_iter().collect(),
    ),
], true => false; "cannot_have_repeat_phone_in_live")]
#[test_case(vec![(DI::Id(IDK::Email), "test@example.com")], vec![
    (
        BoLinkId::generate(BusinessOwnerKind::Secondary),
        vec![(DI::Id(IDK::Email), "test@example.com")].into_iter().collect(),
    ),
], true => false; "cannot_have_repeat_email_in_live")]
#[test_case(vec![(DI::Id(IDK::Email), "unique_email@example.com")], vec![
    (
        BoLinkId::generate(BusinessOwnerKind::Primary),
        vec![(DI::Id(IDK::Email), "test@example.com")].into_iter().collect(),
    ),
    (
        BoLinkId::generate(BusinessOwnerKind::Secondary),
        vec![(DI::Id(IDK::Email), "test@example.com")].into_iter().collect(),
    ),
], true => false; "cannot_have_repeat_email_in_updates")]
#[test_case(vec![(DI::Id(IDK::Email), "test@example.com")], vec![
    (
        BoLinkId::generate(BusinessOwnerKind::Primary),
        vec![(DI::Id(IDK::FirstName), "Flerp")].into_iter().collect(),
    ),
    (
        BoLinkId::generate(BusinessOwnerKind::Secondary),
        vec![(DI::Id(IDK::Email), "test@example.com")].into_iter().collect(),
    ),
], true => false; "cannot_have_repeat_email_with_primary_update")]
fn test_verify_unique_phones_and_emails(
    primary_data: Vec<(DI, &str)>,
    ops: Vec<(BoLinkId, Vec<(DI, &str)>)>,
    is_live: bool,
) -> bool {
    let primary_link_id = BoLinkId::generate(BusinessOwnerKind::Primary);
    let data = primary_data
        .into_iter()
        .map(|(k, v)| (k, PiiString::from(v)))
        .collect();
    let dbo = BusinessOwnerInfo {
        bo: BusinessOwner {
            id: BoId::test_data("Flerp".into()),
            user_vault_id: None,
            business_vault_id: VaultId::test_data("Blerp".into()),
            kind: BusinessOwnerKind::Primary,
            link_id: primary_link_id.clone(),
            _created_at: Utc::now(),
            _updated_at: Utc::now(),
            created_at: Utc::now(),
            source: BusinessOwnerSource::Hosted,
            ownership_stake: Some(20),
            deactivated_at: None,
        },
        su: None,
        data,
    };
    let ops = ops
        .into_iter()
        .map(|(link_id, data)| {
            let data: HashMap<_, _> = data
                .into_iter()
                .map(|(k, v)| (BDK::bo_data(link_id.clone(), k).into(), PiiJsonValue::string(v)))
                .collect();
            let data =
                PatchDataRequest::clean_and_validate(data, ValidateArgs::for_bifrost(is_live)).unwrap();
            let data = FingerprintedDataRequest::manual_fingerprints(data.updates, vec![]);
            if link_id == primary_link_id {
                BatchRequest::Update {
                    link_id,
                    ownership_stake: Some(10),
                    data,
                }
            } else {
                BatchRequest::Create {
                    link_id,
                    ownership_stake: 10,
                    data,
                }
            }
        })
        .collect_vec();
    verify_unique_phones_and_emails(vec![dbo], &ops, is_live).is_ok()
}
