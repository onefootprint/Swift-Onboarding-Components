use db::{
    models::fingerprint::{Fingerprint, FingerprintDupe},
    PgConn,
};
use either::Either;
use itertools::Itertools;
use newtypes::{DupeKind, Dupes, OtherTenantDupe, SameTenantDupe, ScopedVaultId};

use crate::errors::ApiResult;


fn get_dupe_kinds(dupes: &[FingerprintDupe]) -> Vec<DupeKind> {
    dupes
        .iter()
        .filter_map(|d| match d.kind.clone().try_into() {
            Ok(dk) => Some(dk),
            Err(_) => {
                tracing::error!(?d, "failed to map fingerprint kind to DupeKind");
                None
            }
        })
        .unique()
        .sorted()
        .collect()
}

/// turn a single vault's set of FingerprintDupe's into either:
/// - SameTenantDupe if there is at least 1 tenant-scoped fingerprint dupe
/// - OtherTenantDupe otherwise
fn fingerprint_dupes_to_dupe(dupes: Vec<FingerprintDupe>) -> Either<SameTenantDupe, OtherTenantDupe> {
    let (same_tenant, other_tenant): (Vec<_>, Vec<_>) =
        dupes.into_iter().partition(|fpd| fpd.scope.is_tenant());

    if let Some(first) = same_tenant.first() {
        Either::Left(SameTenantDupe {
            fp_id: first.fp_id.clone(),
            dupe_kinds: get_dupe_kinds(&same_tenant),
        })
    } else {
        Either::Right(OtherTenantDupe {
            dupe_kinds: get_dupe_kinds(&other_tenant),
        })
    }
}

pub fn get_dupes(conn: &mut PgConn, sv_id: &ScopedVaultId) -> ApiResult<Dupes> {
    let fp_dupes = Fingerprint::get_dupes(conn, sv_id)?;

    let fp_dupes = fp_dupes.into_iter().into_group_map_by(|fpd| fpd.vault_id.clone());
    let (same_tenant, other_tenant): (Vec<_>, Vec<_>) = fp_dupes
        .into_values()
        .map(fingerprint_dupes_to_dupe)
        .partition_map(|e| e);

    let dupes = Dupes {
        same_tenant,
        other_tenant,
    };

    Ok(dupes)
}


#[cfg(test)]
mod tests {
    use std::collections::HashMap;

    use crate::{
        utils::vault_wrapper::{Any, VaultWrapper},
        State,
    };

    use super::*;
    use db::{
        models::{ob_configuration::ObConfiguration, scoped_vault::ScopedVault},
        test_helpers::assert_have_same_elements,
        tests::fixtures,
    };
    use macros::test_state_case;
    use newtypes::{
        put_data_request::{PatchDataRequest, RawDataRequest},
        DataIdentifier, DataLifetimeSource, DupeKind as DK, IdentityDataKind as IDK, PiiJsonValue,
        ValidateArgs, VaultId,
    };
    use serde_json::json;
    use strum::IntoEnumIterator;
    use strum_macros::EnumIter;

    // tenant
    #[derive(Debug, Clone, EnumIter, Hash, PartialEq, Eq)]
    enum T {
        T1,
        T2,
        T3,
        T4,
    }

    // vault
    #[derive(Debug, Clone, EnumIter, Hash, PartialEq, Eq)]
    enum V {
        V1,
        V2,
        V3,
        V4,
        V5,
    }

    #[derive(Debug, Clone, Default)]
    struct ExpectedDupes {
        same_tenant: Vec<(V, T, Vec<DupeKind>)>,
        other_tenant: Vec<Vec<DupeKind>>, // todo: later assert using sv.created, probs have to jitter the vault creations which is wierd but
    }

    type InputData = (V, T, Vec<(IDK, &'static str)>);

    #[test_state_case(vec![
        (V::V1, T::T1, vec![(IDK::Ssn9, "123456789")]),
    ], ExpectedDupes {
        same_tenant: vec![],
        other_tenant: vec![]
    }; "no other vaults")]
    #[test_state_case(vec![
        (V::V1, T::T1, vec![(IDK::Ssn9, "123456789")]),
        (V::V2, T::T1, vec![(IDK::Ssn9, "223456789")]),
        (V::V3, T::T1, vec![(IDK::Ssn9, "323456789")]),
    ], ExpectedDupes {
        same_tenant: vec![],
        other_tenant: vec![]
    }; "no matching vaults")]
    #[test_state_case(vec![
        (V::V1, T::T1, vec![(IDK::Ssn9, "123456789")]),
        (V::V2, T::T1, vec![(IDK::Ssn9, "123456789")]),
    ], ExpectedDupes {
        same_tenant: vec![(V::V2, T::T1, vec![DK::Ssn9])],
        other_tenant: vec![]
    }; "one matching vault, same tenant")]
    #[test_state_case(vec![
        (V::V1, T::T1, vec![(IDK::Ssn9, "123456789")]),
        (V::V2, T::T2, vec![(IDK::Ssn9, "123456789")]),
    ], ExpectedDupes {
        same_tenant: vec![],
        other_tenant: vec![vec![DK::Ssn9]]
    }; "one matching vault, different tenant")]
    #[test_state_case(vec![
        (V::V1, T::T1, vec![(IDK::Ssn9, "123456789")]),
        (V::V2, T::T1, vec![(IDK::Ssn9, "123456789")]),
        (V::V3, T::T1, vec![(IDK::Ssn9, "123456789")]),
    ], ExpectedDupes {
        same_tenant: vec![(V::V2, T::T1, vec![DK::Ssn9]), (V::V3, T::T1, vec![DK::Ssn9])],
        other_tenant: vec![]
    }; "two matching vaults, same tenant")]
    #[test_state_case(vec![
        (V::V1, T::T1, vec![(IDK::Ssn9, "123456789")]),
        (V::V2, T::T2, vec![(IDK::Ssn9, "123456789")]),
        (V::V3, T::T2, vec![(IDK::Ssn9, "123456789")]),
    ], ExpectedDupes {
        same_tenant: vec![],
        other_tenant: vec![vec![DK::Ssn9], vec![DK::Ssn9]]
    }; "two matching vaults, different tenants")]
    #[test_state_case(vec![
        (V::V1, T::T1, vec![(IDK::Ssn9, "123456789")]),
        (V::V2, T::T1, vec![(IDK::Ssn9, "123456789")]),
        (V::V3, T::T2, vec![(IDK::Ssn9, "123456789")]),
    ], ExpectedDupes {
        same_tenant: vec![(V::V2, T::T1, vec![DK::Ssn9])],
        other_tenant: vec![vec![DK::Ssn9]]
    }; "two matching vaults, same and different tenants")]
    #[test_state_case(vec![
        (V::V1, T::T1, vec![(IDK::Ssn9, "123456789"), (IDK::Email, "bob@boberto.com")]),
        (V::V2, T::T1, vec![(IDK::Ssn9, "123456789"), (IDK::Email, "bob@boberto.com")]),
    ], ExpectedDupes {
        same_tenant: vec![(V::V2, T::T1, vec![DK::Ssn9, DK::Email])],
        other_tenant: vec![]
    }; "one matching vault, same tenant, multiple kinds")]
    #[test_state_case(vec![
        (V::V1, T::T1, vec![(IDK::Ssn9, "123456789"), (IDK::Email, "bob@boberto.com")]),
        (V::V2, T::T1, vec![(IDK::Ssn9, "123456789"), (IDK::Email, "bob@boberto.com")]),
        (V::V3, T::T1, vec![(IDK::Ssn9, "222222222"), (IDK::Email, "bob@boberto.com")]),
        (V::V4, T::T2, vec![(IDK::Ssn9, "123456789"), (IDK::Email, "alice@boberto.com")]),
        (V::V5, T::T2, vec![(IDK::Ssn9, "123456789"), (IDK::Email, "bob@boberto.com")]),
        ], ExpectedDupes {
            same_tenant: vec![(V::V2, T::T1, vec![DK::Ssn9, DK::Email]), (V::V3, T::T1, vec![DK::Email])],
            other_tenant: vec![vec![DK::Ssn9], vec![DK::Ssn9, DK::Email]]
    }; "multiple matching vaults, multiple tenants, multiple kinds")]
    #[test_state_case(vec![
        (V::V1, T::T1, vec![(IDK::Ssn9, "123456789")]),
        (V::V2, T::T1, vec![(IDK::Ssn9, "123456789")]),
        (V::V2, T::T2, vec![(IDK::Ssn9, "123456789")]),
        (V::V2, T::T3, vec![(IDK::Ssn9, "123456789")]),
        ], ExpectedDupes {
            same_tenant: vec![(V::V2, T::T1, vec![DK::Ssn9])],
            other_tenant: vec![]
    }; "matching vault with multiple one clicks")]
    #[test_state_case(vec![
        (V::V1, T::T1, vec![(IDK::Ssn9, "123456789")]),
        (V::V2, T::T2, vec![(IDK::Ssn9, "123456789")]),
        (V::V2, T::T3, vec![(IDK::Ssn9, "123456789")]),
        (V::V2, T::T4, vec![(IDK::Ssn9, "123456789")]),
        ], ExpectedDupes {
            same_tenant: vec![],
            other_tenant: vec![vec![DK::Ssn9]]
    }; "matching vault with multiple one clicks on only other tenants")]
    #[test_state_case(vec![
        (V::V1, T::T1, vec![(IDK::Ssn9, "123456789")]),
        (V::V2, T::T1, vec![(IDK::Ssn9, "123456789")]),
        (V::V2, T::T1, vec![(IDK::Ssn9, "222222222")]),
    ], ExpectedDupes {
        same_tenant: vec![],
        other_tenant: vec![]
    }; "only latest data is considered")]
    #[tokio::test]
    async fn valid_action(state: &mut State, data: Vec<InputData>, expected: ExpectedDupes) {
        // get_dupes queried for (V1, T1)

        // create an obc for every tenant and create a T->OBC mapping
        let obc_map = state
            .db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
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

        // create a vault for every input vault, and a SV for every tenant for every vault. Create a mapping of (V,T) -> SV
        let data2 = data.clone();
        let sv_map = state
            .db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
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
                        let sv =
                            fixtures::scoped_vault::create(conn, &v_id, &obc_map.get(t).unwrap().id.clone());
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
        let sv_id = sv_map.get(&(V::V1, T::T1)).unwrap().id.clone();
        let dupes = state
            .db_pool
            .db_query(move |conn| get_dupes(conn, &sv_id))
            .await
            .unwrap();

        let expected_same_tenant = expected
            .same_tenant
            .into_iter()
            .map(|(v, t, dks)| SameTenantDupe {
                fp_id: sv_map.get(&(v, t)).unwrap().fp_id.clone(),
                dupe_kinds: dks,
            })
            .collect();
        let expected_other_tenant = expected
            .other_tenant
            .into_iter()
            .map(|dks| OtherTenantDupe { dupe_kinds: dks })
            .collect();

        assert_have_same_elements(expected_same_tenant, dupes.same_tenant); // have to do it this way for now because we aren't sorting the vec's
        assert_have_same_elements(expected_other_tenant, dupes.other_tenant);
    }

    pub async fn vault_data(state: &mut State, sv: &ScopedVault, data: Vec<(IDK, &str)>) {
        let request: HashMap<DataIdentifier, PiiJsonValue> =
            HashMap::from_iter(data.into_iter().map(|(i, s)| (i.into(), json!(s).into())));
        let request = RawDataRequest::from(request);
        let args = ValidateArgs::for_non_portable(true);
        let PatchDataRequest {
            updates,
            deletions: _,
        } = request.clean_and_validate(args).unwrap();
        let data_req = updates
            .build_fingerprints(&state.enclave_client, &sv.tenant_id)
            .await
            .unwrap();

        let sv_id = sv.id.clone();
        state
            .db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &sv_id).unwrap();
                uvw.patch_data(conn, data_req, DataLifetimeSource::Tenant, None)
                    .unwrap();
                Ok(())
            })
            .await
            .unwrap();
    }
}
