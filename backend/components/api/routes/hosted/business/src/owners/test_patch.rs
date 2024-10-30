use super::patch::validate_collective_bos;
use super::patch::BatchRequest;
use api_core::utils::vault_wrapper::BusinessOwnerInfo;
use chrono::Utc;
use db::models::business_owner::BusinessOwner;
use itertools::Itertools;
use newtypes::BoId;
use newtypes::BoLinkId;
use newtypes::BusinessOwnerKind;
use newtypes::BusinessOwnerSource;
use newtypes::DataIdentifier as DI;
use newtypes::DataRequest;
use newtypes::IdentityDataKind as IDK;
use newtypes::PiiString;
use newtypes::Uuid;
use newtypes::ValidateArgs;
use newtypes::VaultId;
use std::collections::HashMap;
use test_case::test_case;

type UpdateOp<'a> = (BusinessOwnerKind, Option<Vec<(DI, &'a str)>>);

#[test_case(vec![(DI::Id(IDK::PhoneNumber), "+15555550100")], vec![
    (
        BusinessOwnerKind::Secondary,
        Some(vec![(DI::Id(IDK::PhoneNumber), "+15555550100")].into_iter().collect()),
    ),
], false => true; "can_have_repeat_in_sandbox")]
#[test_case(vec![(DI::Id(IDK::PhoneNumber), "+15555550100")], vec![
    (
        BusinessOwnerKind::Secondary,
        Some(vec![(DI::Id(IDK::PhoneNumber), "+15555550100")].into_iter().collect()),
    ),
], true => false; "cannot_have_repeat_phone_in_live")]
#[test_case(vec![(DI::Id(IDK::Email), "test@example.com")], vec![
    (
        BusinessOwnerKind::Secondary,
        Some(vec![(DI::Id(IDK::Email), "test@example.com")].into_iter().collect()),
    ),
], true => false; "cannot_have_repeat_email_in_live")]
#[test_case(vec![(DI::Id(IDK::Email), "unique_email@example.com")], vec![
    (
        BusinessOwnerKind::Primary,
        Some(vec![(DI::Id(IDK::Email), "test@example.com")].into_iter().collect()),
    ),
    (
        BusinessOwnerKind::Secondary,
        Some(vec![(DI::Id(IDK::Email), "test@example.com")].into_iter().collect()),
    ),
], true => false; "cannot_have_repeat_email_in_updates")]
#[test_case(vec![(DI::Id(IDK::Email), "test@example.com")], vec![
    (
        BusinessOwnerKind::Primary,
        Some(vec![(DI::Id(IDK::FirstName), "Flerp")].into_iter().collect()),
    ),
    (
        BusinessOwnerKind::Secondary,
        Some(vec![(DI::Id(IDK::Email), "test@example.com")].into_iter().collect()),
    ),
], true => false; "cannot_have_repeat_email_with_primary_update")]
#[test_case(vec![(DI::Id(IDK::Email), "test@example.com")], vec![
    (
        BusinessOwnerKind::Primary,
        None, // Delete this BO
    ),
    (
        BusinessOwnerKind::Secondary,
        Some(vec![(DI::Id(IDK::Email), "test@example.com")].into_iter().collect()),
    ),
], true => true; "delete_bo")]
#[allow(clippy::type_complexity)]
fn test_verify_unique_phones_and_emails(
    primary_data: Vec<(DI, &str)>,
    ops: Vec<UpdateOp>,
    is_live: bool,
) -> bool {
    let data = primary_data
        .into_iter()
        .map(|(k, v)| (k, PiiString::from(v)))
        .collect();
    let primary_uuid = Uuid::new_v4();
    let dbo = BusinessOwnerInfo {
        bo: BusinessOwner {
            id: BoId::test_data("Flerp".into()),
            uuid: primary_uuid,
            user_vault_id: None,
            business_vault_id: VaultId::test_data("Blerp".into()),
            kind: BusinessOwnerKind::Primary,
            link_id: BoLinkId::generate(BusinessOwnerKind::Primary),
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
        .map(|(bo_kind, data)| {
            let uuid = match bo_kind {
                BusinessOwnerKind::Primary => primary_uuid,
                BusinessOwnerKind::Secondary => Uuid::new_v4(),
            };
            let Some(data) = data else {
                return BatchRequest::Delete { uuid };
            };
            let data: HashMap<_, _> = data.into_iter().map(|(k, v)| (k, PiiString::from(v))).collect();
            let data = DataRequest::clean_and_validate_str(data, ValidateArgs::for_bifrost(is_live)).unwrap();
            if bo_kind == BusinessOwnerKind::Primary {
                BatchRequest::Update {
                    uuid,
                    ownership_stake: Some(10),
                    data,
                }
            } else {
                BatchRequest::Create {
                    uuid,
                    ownership_stake: Some(10),
                    data,
                }
            }
        })
        .collect_vec();
    validate_collective_bos(vec![dbo], &ops, is_live).is_ok()
}
