use crate::utils::vault_wrapper::Any;
use crate::utils::vault_wrapper::DataLifetimeSources;
use crate::utils::vault_wrapper::FingerprintedDataRequest;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::FpResult;
use crate::State;
use db::models::fingerprint::Fingerprint;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::test_helpers::assert_have_same_elements;
use db::tests::fixtures;
use itertools::Itertools;
use macros::test_state_case;
use newtypes::put_data_request::PatchDataRequest;
use newtypes::put_data_request::RawDataRequest;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeSource;
use newtypes::DupeKind as DK;
use newtypes::IdentityDataKind as IDK;
use newtypes::PiiJsonValue;
use newtypes::ValidateArgs;
use newtypes::VaultId;
use serde_json::json;
use std::collections::HashMap;
use strum::IntoEnumIterator;
use strum_macros::EnumIter;

#[derive(Debug, Clone, EnumIter, Hash, PartialEq, Eq)]
enum T {
    T1,
    T2,
    T3,
    T4,
}

#[derive(Debug, Clone, EnumIter, Hash, PartialEq, Eq)]
enum V {
    V1,
    V2,
    V3,
    V4,
    V5,
}

#[derive(Debug, Clone)]
struct ExpectedDupes {
    same_tenant: Vec<(V, T, Vec<DK>)>,
    num_other_tenants: i64,
    num_other_tenant_matches: i64,
}

type InputData = (V, T, Vec<(IDK, &'static str)>);

#[test_state_case(vec![
        (V::V1, T::T1, vec![(IDK::Ssn9, "123456789")]),
    ], ExpectedDupes {
        same_tenant: vec![],
        num_other_tenant_matches: 0,
        num_other_tenants: 0
    }; "no other vaults")]
#[test_state_case(vec![
        (V::V1, T::T1, vec![(IDK::Ssn9, "123456789")]),
        (V::V2, T::T1, vec![(IDK::Ssn9, "223456789")]),
        (V::V3, T::T1, vec![(IDK::Ssn9, "323456789")]),
    ], ExpectedDupes {
        same_tenant: vec![],
        num_other_tenant_matches: 0,
        num_other_tenants: 0
    }; "no matching vaults")]
#[test_state_case(vec![
        (V::V1, T::T1, vec![(IDK::Ssn9, "123456789")]),
        (V::V2, T::T1, vec![(IDK::Ssn9, "123456789")]),
    ], ExpectedDupes {
        same_tenant: vec![(V::V2, T::T1, vec![DK::Ssn9])],
        num_other_tenant_matches: 0,
        num_other_tenants: 0
    }; "one matching vault, same tenant")]
#[test_state_case(vec![
        (V::V1, T::T1, vec![(IDK::Ssn9, "123456789")]),
        (V::V2, T::T2, vec![(IDK::Ssn9, "123456789")]),
    ], ExpectedDupes {
        same_tenant: vec![],
        num_other_tenant_matches: 1,
        num_other_tenants: 1
    }; "one matching vault, different tenant")]
#[test_state_case(vec![
        (V::V1, T::T1, vec![(IDK::Ssn9, "123456789")]),
        (V::V2, T::T1, vec![(IDK::Ssn9, "123456789")]),
        (V::V3, T::T1, vec![(IDK::Ssn9, "123456789")]),
    ], ExpectedDupes {
        same_tenant: vec![(V::V3, T::T1, vec![DK::Ssn9]), (V::V2, T::T1, vec![DK::Ssn9])],
        num_other_tenant_matches: 0,
        num_other_tenants: 0
    }; "two matching vaults, same tenant")]
#[test_state_case(vec![
        (V::V1, T::T1, vec![(IDK::Ssn9, "123456789")]),
        (V::V2, T::T2, vec![(IDK::Ssn9, "123456789")]),
        (V::V3, T::T2, vec![(IDK::Ssn9, "123456789")]),
    ], ExpectedDupes {
        same_tenant: vec![],
        num_other_tenant_matches: 2,
        num_other_tenants: 1
    }; "two matching vaults, different tenants")]
#[test_state_case(vec![
        (V::V1, T::T1, vec![(IDK::Ssn9, "123456789")]),
        (V::V2, T::T1, vec![(IDK::Ssn9, "123456789")]),
        (V::V3, T::T2, vec![(IDK::Ssn9, "123456789")]),
    ], ExpectedDupes {
        same_tenant: vec![(V::V2, T::T1, vec![DK::Ssn9])],
        num_other_tenant_matches: 1,
        num_other_tenants: 1
    }; "two matching vaults, same and different tenants")]
#[test_state_case(vec![
        (V::V1, T::T1, vec![(IDK::Ssn9, "123456789"), (IDK::Email, "bob@boberto.com")]),
        (V::V2, T::T1, vec![(IDK::Ssn9, "123456789"), (IDK::Email, "bob@boberto.com")]),
    ], ExpectedDupes {
        same_tenant: vec![(V::V2, T::T1, vec![DK::Ssn9, DK::Email])],
        num_other_tenant_matches: 0,
        num_other_tenants: 0
    }; "one matching vault, same tenant, multiple kinds")]
#[test_state_case(vec![
        (V::V1, T::T1, vec![(IDK::Ssn9, "123456789"), (IDK::Email, "bob@boberto.com")]),
        (V::V2, T::T1, vec![(IDK::Ssn9, "123456789"), (IDK::Email, "bob@boberto.com")]),
        (V::V3, T::T1, vec![(IDK::Ssn9, "222222222"), (IDK::Email, "bob@boberto.com")]),
        (V::V4, T::T2, vec![(IDK::Ssn9, "123456789"), (IDK::Email, "alice@boberto.com")]),
        (V::V5, T::T2, vec![(IDK::Ssn9, "123456789"), (IDK::Email, "bob@boberto.com")]),
    ], ExpectedDupes {
        same_tenant: vec![(V::V3, T::T1, vec![DK::Email]), (V::V2, T::T1, vec![DK::Ssn9, DK::Email])],
        num_other_tenant_matches: 2,
        num_other_tenants: 1
    }; "multiple matching vaults, multiple tenants, multiple kinds")]
#[test_state_case(vec![
        (V::V1, T::T1, vec![(IDK::Ssn9, "123456789")]),
        (V::V2, T::T1, vec![(IDK::Ssn9, "123456789")]),
        (V::V2, T::T2, vec![(IDK::Ssn9, "123456789")]),
        (V::V2, T::T3, vec![(IDK::Ssn9, "123456789")]),
    ], ExpectedDupes {
        same_tenant: vec![(V::V2, T::T1, vec![DK::Ssn9])],
        num_other_tenant_matches: 0,
        num_other_tenants: 0
    }; "matching vault with multiple one clicks")]
#[test_state_case(vec![
        (V::V1, T::T1, vec![(IDK::Ssn9, "123456789")]),
        (V::V2, T::T2, vec![(IDK::Ssn9, "123456789")]),
        (V::V2, T::T3, vec![(IDK::Ssn9, "123456789")]),
        (V::V2, T::T4, vec![(IDK::Ssn9, "123456789")]),
    ], ExpectedDupes {
        same_tenant: vec![],
        num_other_tenant_matches: 1,
        num_other_tenants: 3
    }; "matching vault with multiple one clicks on only other tenants")]
#[test_state_case(vec![
        (V::V1, T::T1, vec![(IDK::Ssn9, "123456789")]),
        (V::V2, T::T1, vec![(IDK::Ssn9, "123456789")]),
        (V::V2, T::T1, vec![(IDK::Ssn9, "222222222")]),
    ], ExpectedDupes {
        same_tenant: vec![],
        num_other_tenant_matches: 0,
        num_other_tenants: 0
    }; "only latest data is considered")]
#[tokio::test]
async fn test_get_dupes(state: &mut State, data: Vec<InputData>, expected: ExpectedDupes) {
    // create an obc for every tenant and create a T->OBC mapping
    let obc_map = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let obc_map: HashMap<T, ObConfiguration> = T::iter()
                .map(|t| {
                    let tenant = fixtures::tenant::create(conn);
                    let obc = fixtures::ob_configuration::create(conn, &tenant.id, true);
                    (t, obc)
                })
                .collect();
            Ok(obc_map)
        })
        .await
        .unwrap();

    // create a vault for every input vault, and a SV for every tenant for every vault. Create a mapping
    // of (V,T) -> SV
    let data2 = data.clone();
    let sv_map = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let mut vault_id_map: HashMap<V, VaultId> = HashMap::new();
            let sv_map: HashMap<(V, T), ScopedVault> = data2
                .iter()
                .map(|(v, t, _)| (v, t))
                .unique()
                .map(|(v, t)| {
                    let v_id = if let Some(v_id) = vault_id_map.get(v) {
                        v_id.clone()
                    } else {
                        let uv = fixtures::vault::create_person(conn, true);
                        vault_id_map.insert(v.clone(), uv.id.clone());
                        uv.id.clone()
                    };
                    let sv = fixtures::scoped_vault::create(conn, &v_id, &obc_map.get(t).unwrap().id.clone());
                    ((v.clone(), t.clone()), sv)
                })
                .collect();
            Ok(sv_map)
        })
        .await
        .unwrap();

    // vault all the input data
    for (v, t, d) in data {
        vault_data(state, sv_map.get(&(v, t)).unwrap(), d).await
    }

    // get_dupes for (V1, T1)
    let sv = sv_map.get(&(V::V1, T::T1)).unwrap().clone();
    let dupes = state
        .db_pool
        .db_query(move |conn| Fingerprint::get_dupes(conn, &sv))
        .await
        .unwrap();

    let expected_same_tenant = expected
        .same_tenant
        .into_iter()
        .map(|(v, t, _)| sv_map.get(&(v, t)).unwrap().id.clone())
        .collect_vec();
    let actual_same_tenant = dupes
        .internal
        .into_iter()
        .map(|d| d.scoped_vault_id.clone())
        .unique()
        .collect_vec();

    assert_have_same_elements(expected_same_tenant, actual_same_tenant); // have to do it this way for now because had to remove the order_by in the fingerprint query
    let external = dupes.external.unwrap();
    assert_eq!(expected.num_other_tenant_matches, external.num_users);
    assert_eq!(expected.num_other_tenants, external.num_tenants);
}

async fn vault_data(state: &mut State, sv: &ScopedVault, data: Vec<(IDK, &str)>) {
    let request: HashMap<DataIdentifier, PiiJsonValue> =
        HashMap::from_iter(data.into_iter().map(|(i, s)| (i.into(), json!(s).into())));
    let request = RawDataRequest(request);
    let args = ValidateArgs::for_non_portable(true);
    let PatchDataRequest {
        updates,
        deletions: _,
    } = request.clean_and_validate(args).unwrap();
    let data_req = FingerprintedDataRequest::build_for_new_user(state, updates, &sv.tenant_id)
        .await
        .unwrap();

    let sv_id = sv.id.clone();
    state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &sv_id).unwrap();
            let sources = DataLifetimeSources::single(DataLifetimeSource::Tenant);
            uvw.patch_data(conn, data_req, sources, None).unwrap();
            Ok(())
        })
        .await
        .unwrap();
}
