use super::DataRequestSource;
use super::FingerprintedDataRequest;
use super::PrefillKind;
use super::WriteableVw;
use crate::utils::vault_wrapper::Person;
use crate::utils::vault_wrapper::TenantVw;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::FpResult;
use crate::State;
use db::models::contact_info::ContactInfo;
use db::models::data_lifetime::DataLifetime;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::test_helpers::assert_have_same_elements;
use db::tests::fixtures::ob_configuration::ObConfigurationOpts;
use db::tests::test_db_pool::TestDbPool;
use db::TxnPgConn;
use itertools::Itertools;
use macros::test_state;
use newtypes::fingerprint_salt::FingerprintSalt;
use newtypes::fingerprint_salt::GlobalFingerprintKind;
use newtypes::CollectedDataOption as CDO;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeSource;
use newtypes::DataRequest;
use newtypes::Fingerprint;
use newtypes::FingerprintScope;
use newtypes::IdentityDataKind;
use newtypes::IdentityDataKind as IDK;
use newtypes::PiiJsonValue;
use newtypes::PiiString;
use newtypes::ValidateArgs;
use std::collections::HashMap;

struct TestData {
    su1: ScopedVault,
    su2: ScopedVault,
    pb1: ObConfiguration,
    auth_pb2: ObConfiguration,
    pb2: ObConfiguration,
}

/// Follows the journey of a user who onboards onto one tenant and then one-clicks onto another
#[test_state]
async fn test_prefill_data(state: &mut State) {
    //
    // User starts onboarding onto tenant 1
    //
    let (data, vw) = state
        .db_transaction(move |conn| -> FpResult<_> {
            let test_data = create_test_data(conn);
            let vw = VaultWrapper::<Person>::build_portable(conn, &test_data.su1.vault_id)?;
            Ok((test_data, vw))
        })
        .await
        .unwrap();

    // su1 then goes through onboarding. When su1 triggers onboarding, we'll compose prefill data,
    // but it should be empty since the only data exists at the current tenant
    let prefill_data = vw
        .get_data_to_prefill(state, &data.pb1, PrefillKind::Onboarding(&data.su1))
        .await
        .unwrap();
    assert!(prefill_data.data.is_empty());
    assert!(prefill_data.fingerprints.is_empty());
    assert!(prefill_data.new_ci.is_empty());

    // If the user then tried to onboard onto tenant2, there should be almost no prefill data since
    // nothing is portablized - only the phone number because the phone is portablized after it's
    // verified
    let prefill_data = vw
        .get_data_to_prefill(state, &data.pb2, PrefillKind::LoginMethods)
        .await
        .unwrap();
    assert_have_same_elements(
        prefill_data.data.iter().map(|d| d.kind.clone()).collect(),
        vec![IDK::VerifiedPhoneNumber.into(), IDK::PhoneNumber.into()],
    );
    assert_have_same_elements(
        prefill_data
            .fingerprints
            .iter()
            .map(|(s, _)| (s.di(), s.scope()))
            .collect(),
        vec![
            (IDK::VerifiedPhoneNumber.into(), Some(FingerprintScope::Global)),
            (IDK::VerifiedPhoneNumber.into(), Some(FingerprintScope::Tenant)),
            (IDK::PhoneNumber.into(), Some(FingerprintScope::Global)),
            (IDK::PhoneNumber.into(), Some(FingerprintScope::Tenant)),
        ],
    );
    let phone_ci = prefill_data
        .new_ci
        .iter()
        .find(|ci| ci.identifier == IDK::PhoneNumber.into())
        .unwrap();
    assert!(phone_ci.is_otp_verified);

    let prefill_data = vw
        .get_data_to_prefill(state, &data.pb2, PrefillKind::Onboarding(&data.su2))
        .await
        .unwrap();
    assert!(prefill_data.data.is_empty());

    //
    // User finishes onboarding onto tenant1 - adds the rest of data and portablizes it
    //
    let su1 = data.su1.clone();
    let vw = state
        .db_transaction(move |conn| -> FpResult<_> {
            let vw: WriteableVw<Person> = VaultWrapper::lock_for_onboarding(conn, &su1.id).unwrap();
            let data = vec![
                (IDK::Dob.into(), PiiString::new("1990-01-01".into())),
                (IDK::Ssn9.into(), PiiString::new("123-12-1234".into())),
                (IDK::FirstName.into(), PiiString::new("Hayes".into())),
                (IDK::LastName.into(), PiiString::new("Valley".into())),
            ];
            vw.patch_data_test_str(conn, data, true).unwrap();
            let vw: WriteableVw<Person> = VaultWrapper::lock_for_onboarding(conn, &su1.id).unwrap();
            vw.portablize_identity_data(conn).unwrap();
            let vw = VaultWrapper::<Person>::build_portable(conn, &su1.vault_id).unwrap();
            Ok(vw)
        })
        .await
        .unwrap();

    //
    // When the user starts onboarding onto tenant2, we should have prefill data! We first start
    // with PrefillKind::LoginMethods which happens when the SV is created in /identify/verify
    //

    let prefill_data = vw
        .get_data_to_prefill(state, &data.pb2, PrefillKind::LoginMethods)
        .await
        .unwrap();

    // Make sure prefill data has what we expect
    assert_have_same_elements(
        prefill_data.data.iter().map(|d| d.kind.clone()).collect(),
        vec![
            IDK::Email.into(),
            IDK::PhoneNumber.into(),
            IDK::VerifiedPhoneNumber.into(),
        ],
    );
    // Check prefill fingerprints
    let fingerprints = prefill_data
        .fingerprints
        .iter()
        .map(|(s, _)| (s.di(), s.scope()))
        .collect();
    let expected_fingerprints = vec![
        (IDK::Email.into(), Some(FingerprintScope::Global)),
        (IDK::Email.into(), Some(FingerprintScope::Tenant)),
        (IDK::PhoneNumber.into(), Some(FingerprintScope::Global)),
        (IDK::PhoneNumber.into(), Some(FingerprintScope::Tenant)),
        (IDK::VerifiedPhoneNumber.into(), Some(FingerprintScope::Global)),
        (IDK::VerifiedPhoneNumber.into(), Some(FingerprintScope::Tenant)),
    ];
    assert_have_same_elements(fingerprints, expected_fingerprints);
    // Check prefill contact info
    let phone_ci = prefill_data
        .new_ci
        .iter()
        .find(|ci| ci.identifier == IDK::PhoneNumber.into())
        .unwrap();
    assert!(phone_ci.is_otp_verified);
    let email_ci = prefill_data
        .new_ci
        .iter()
        .find(|ci| ci.identifier == IDK::Email.into())
        .unwrap();
    assert!(!email_ci.is_otp_verified);

    // Write the prefill login methods
    let su2_id = data.su2.id.clone();
    state
        .db_transaction(move |conn| -> FpResult<_> {
            let vw2: WriteableVw<Person> = VaultWrapper::lock_for_onboarding(conn, &su2_id).unwrap();
            vw2.prefill_portable_data(conn, prefill_data, None).unwrap();
            Ok(())
        })
        .await
        .unwrap();

    //
    // Then prefill the rest of the data in POST /hosted/onboarding
    //

    let prefill_data = vw
        .get_data_to_prefill(state, &data.pb2, PrefillKind::Onboarding(&data.su2))
        .await
        .unwrap();

    // Make sure prefill data has what we expect
    assert_have_same_elements(
        prefill_data.data.iter().map(|d| d.kind.clone()).collect(),
        // Omit ssn9 and dob since the obc didn't request them
        vec![IDK::FirstName.into(), IDK::LastName.into(), IDK::Ssn4.into()],
    );
    // Check prefill fingerprints
    let fingerprints = prefill_data
        .fingerprints
        .iter()
        .map(|(s, _)| (s.di(), s.scope()))
        .collect();
    let expected_fingerprints = vec![
        (IDK::FirstName.into(), Some(FingerprintScope::Tenant)),
        (IDK::LastName.into(), Some(FingerprintScope::Tenant)),
        (IDK::FirstName.into(), None),
        (IDK::LastName.into(), None),
        (IDK::Ssn4.into(), None),
    ];
    assert_have_same_elements(fingerprints, expected_fingerprints);

    //
    // User starts onboarding onto tenant
    // Now, actually write the prefill data into sv2.
    //
    let su1_id = data.su1.id.clone();
    let su2_id = data.su2.id.clone();
    let (vw1, vw2) = state
        .db_transaction(move |conn| -> FpResult<_> {
            let vw2: WriteableVw<Person> = VaultWrapper::lock_for_onboarding(conn, &su2_id).unwrap();
            vw2.prefill_portable_data(conn, prefill_data, None).unwrap();

            let vw1: TenantVw<Person> = VaultWrapper::build_for_tenant(conn, &su1_id).unwrap();
            let vw2: TenantVw<Person> = VaultWrapper::build_for_tenant(conn, &su2_id).unwrap();

            Ok((vw1, vw2))
        })
        .await
        .unwrap();

    // Compare tenant1 and tenant2's view of the user
    // For backcompat, tenants' views of data still include other tenants' data.
    // This is a util to filter out data added by other tenants
    assert_have_same_elements(
        vw1.all_data.keys().cloned().collect(),
        vec![
            IDK::Email.into(),
            IDK::PhoneNumber.into(),
            IDK::VerifiedPhoneNumber.into(),
            IDK::FirstName.into(),
            IDK::LastName.into(),
            IDK::Dob.into(),
            IDK::Ssn4.into(),
            IDK::Ssn9.into(),
            IDK::UsTaxId.into(),
        ],
    );
    let expected_vw2_data = vec![
        IDK::Email.into(),
        IDK::PhoneNumber.into(),
        IDK::VerifiedPhoneNumber.into(),
        IDK::FirstName.into(),
        IDK::LastName.into(),
        IDK::Ssn4.into(),
    ];
    assert_have_same_elements(vw2.all_data.keys().cloned().collect(), expected_vw2_data.clone());

    // Assert actual values in the vault are identical
    let vw1_data = vw1
        .decrypt_unchecked(&state.enclave_client, &expected_vw2_data)
        .await
        .unwrap();
    let vw2_data = vw1
        .decrypt_unchecked(&state.enclave_client, &expected_vw2_data)
        .await
        .unwrap();
    assert_eq!(vw1_data.results, vw2_data.results);

    //
    // User finishes onboarding onto tenant2!
    // This should not portablize the data prefilled into tenant 2 because it was prefilled
    //
    let su2_id = data.su2.id.clone();
    let vw2 = state
        .db_transaction(move |conn| -> FpResult<_> {
            // Should be able to update tenant2's view of ssn4, even thought tenant1 has the full ssn9
            // TODO uncomment this after we switch the source of truth for reading
            // let vw2: WriteableVw<Person> = VaultWrapper::lock_for_onboarding(conn, &su2_id).unwrap();
            // let data = vec![(IDK::Ssn4.into(), PiiString::new("4321".into()))];
            // vw2.patch_data_test_str(conn, data, true).unwrap();

            let vw2: WriteableVw<Person> = VaultWrapper::lock_for_onboarding(conn, &su2_id).unwrap();
            vw2.portablize_identity_data(conn).unwrap();

            let vw2: TenantVw<Person> = VaultWrapper::build_for_tenant(conn, &su2_id).unwrap();
            Ok(vw2)
        })
        .await
        .unwrap();
    let expected_vw2_data = vec![
        IDK::Email.into(),
        IDK::VerifiedPhoneNumber.into(),
        IDK::PhoneNumber.into(),
        IDK::FirstName.into(),
        IDK::LastName.into(),
        IDK::Ssn4.into(),
    ];
    let vw2_data = vw2.all_data.iter().flat_map(|(_, d)| d).collect_vec();
    assert_have_same_elements(vw2.all_data.keys().cloned().collect(), expected_vw2_data);
    assert!(vw2_data.iter().all(|d| !d.is_portable()));
}

/// Follows the journey of a user who one-click auths using an auth playbook onto tenant 2 and then
/// one-click onboards onto a KYC playbook
#[test_state]
async fn test_prefill_data_auth_then_kyc(state: &mut State) {
    //
    // User starts onboarding onto tenant 1
    //
    let (data, vw) = state
        .db_transaction(move |conn| -> FpResult<_> {
            let test_data = create_test_data(conn);
            let vw: WriteableVw<Person> = VaultWrapper::lock_for_onboarding(conn, &test_data.su1.id).unwrap();
            let data = vec![
                (IDK::Dob.into(), PiiString::new("1990-01-01".into())),
                (IDK::Ssn9.into(), PiiString::new("123-12-1234".into())),
                (IDK::FirstName.into(), PiiString::new("Hayes".into())),
                (IDK::LastName.into(), PiiString::new("Valley".into())),
            ];
            vw.patch_data_test_str(conn, data, true).unwrap();
            let vw: WriteableVw<Person> = VaultWrapper::lock_for_onboarding(conn, &test_data.su1.id).unwrap();
            vw.portablize_identity_data(conn).unwrap();

            let vw = VaultWrapper::<Person>::build_portable(conn, &test_data.su1.vault_id).unwrap();
            Ok((test_data, vw))
        })
        .await
        .unwrap();

    // We should only prefill phone and email from this auth playbook
    let prefill_data = vw
        .get_data_to_prefill(state, &data.auth_pb2, PrefillKind::LoginMethods)
        .await
        .unwrap();
    assert_have_same_elements(
        prefill_data.data.iter().map(|d| d.kind.clone()).collect(),
        vec![
            IDK::Email.into(),
            IDK::PhoneNumber.into(),
            IDK::VerifiedPhoneNumber.into(),
        ],
    );

    // User finishes auth onto tenant2
    let su2 = data.su2.clone();
    let vw = state
        .db_transaction(move |conn| -> FpResult<_> {
            let vw2: WriteableVw<Person> = VaultWrapper::lock_for_onboarding(conn, &su2.id).unwrap();
            vw2.prefill_portable_data(conn, prefill_data, None).unwrap();

            let vw = VaultWrapper::<Person>::build_portable(conn, &su2.vault_id).unwrap();
            Ok(vw)
        })
        .await
        .unwrap();

    // Then, prefill data for KYC playbook shouldn't prefill phone and email again
    let prefill_data = vw
        .get_data_to_prefill(state, &data.pb2, PrefillKind::Onboarding(&data.su2))
        .await
        .unwrap();
    assert_have_same_elements(
        prefill_data.data.iter().map(|d| d.kind.clone()).collect(),
        vec![IDK::FirstName.into(), IDK::LastName.into(), IDK::Ssn4.into()],
    );

    // User finishes KYC onto tenant 2
    let su2 = data.su2.clone();
    let vw2 = state
        .db_transaction(move |conn| -> FpResult<_> {
            let vw2: WriteableVw<Person> = VaultWrapper::lock_for_onboarding(conn, &su2.id).unwrap();
            vw2.prefill_portable_data(conn, prefill_data, None).unwrap();
            let vw2: TenantVw<Person> = VaultWrapper::build_for_tenant(conn, &su2.id).unwrap();
            Ok(vw2)
        })
        .await
        .unwrap();
    let expected_vw2_data = vec![
        IDK::Email.into(),
        IDK::VerifiedPhoneNumber.into(),
        IDK::PhoneNumber.into(),
        IDK::FirstName.into(),
        IDK::LastName.into(),
        IDK::Ssn4.into(),
    ];
    assert_have_same_elements(vw2.all_data.keys().cloned().collect(), expected_vw2_data);
}

fn create_test_data(conn: &mut TxnPgConn) -> TestData {
    let tenant1 = db::tests::fixtures::tenant::create(conn);
    let tenant2 = db::tests::fixtures::tenant::create(conn);
    let pb1_opts = ObConfigurationOpts {
        must_collect_data: vec![CDO::Email, CDO::PhoneNumber, CDO::Name, CDO::Dob, CDO::Ssn9],
        is_live: true,
        ..Default::default()
    };
    let pb1 = db::tests::fixtures::ob_configuration::create_with_opts(conn, &tenant1.id, pb1_opts);
    // PB2 only collects ssn4, doesn't collect dob
    let pb2_opts = ObConfigurationOpts {
        must_collect_data: vec![CDO::Email, CDO::PhoneNumber, CDO::Name, CDO::Ssn4],
        is_live: true,
        ..Default::default()
    };
    let pb2 = db::tests::fixtures::ob_configuration::create_with_opts(conn, &tenant2.id, pb2_opts);
    let auth_pb2_opts = ObConfigurationOpts {
        must_collect_data: vec![CDO::PhoneNumber, CDO::Email],
        is_live: true,
        ..Default::default()
    };
    let auth_pb2 = db::tests::fixtures::ob_configuration::create_with_opts(conn, &tenant2.id, auth_pb2_opts);

    let uv = db::tests::fixtures::vault::create_person(conn, true);
    let su1 = db::tests::fixtures::scoped_vault::create(conn, &uv.id, &pb1.id);
    let su2 = db::tests::fixtures::scoped_vault::create(conn, &uv.id, &pb2.id);

    let vw: WriteableVw<Person> = VaultWrapper::lock_for_onboarding(conn, &su1.id).unwrap();
    // Start w just phone and email for a user that went through identify flow
    let phone_number = PiiString::new("+15555550100".into());
    let data = vec![
        (IDK::Email.into(), PiiString::new("test1@onefootprint.com".into())),
        (IDK::PhoneNumber.into(), phone_number.clone()),
    ];
    vw.patch_data_test_str(conn, data, true).unwrap();

    // Mark the phone number as verified
    let args = ValidateArgs::for_bifrost(false);
    let data = HashMap::from_iter([(IDK::VerifiedPhoneNumber.into(), phone_number)]);
    let data = DataRequest::clean_and_validate_str(data, args)
        .unwrap()
        .filter(|di| !matches!(di, DataIdentifier::Id(IDK::PhoneNumber)));
    let data = FingerprintedDataRequest::manual_fingerprints(data, vec![]);
    let vw: WriteableVw<Person> = VaultWrapper::lock_for_onboarding(conn, &su1.id).unwrap();
    let lifetime = vw.get_lifetime(&IDK::PhoneNumber.into()).unwrap().clone();
    let ci = ContactInfo::get(conn, &lifetime.id).unwrap();
    let sv_txn = vw.save_ci_after_otp(conn, data).unwrap();
    DataLifetime::portablize(conn, &sv_txn, &lifetime.id).unwrap();
    ContactInfo::mark_otp_verified(conn, &ci.id).unwrap();

    TestData {
        su1: su1.into_inner(),
        su2: su2.into_inner(),
        pb1,
        auth_pb2,
        pb2,
    }
}

impl<Type> WriteableVw<Type> {
    /// Shorthand to add data to a vault in tests
    pub fn patch_data_test_str(
        self,
        conn: &mut TxnPgConn,
        data: Vec<(DataIdentifier, PiiString)>,
        create_fingerprints: bool,
    ) -> FpResult<Vec<(DataIdentifier, ContactInfo)>> {
        let data = data
            .into_iter()
            .map(|(k, v)| (k, PiiJsonValue::from_piistring(v)))
            .collect();
        self.patch_data_test(conn, data, create_fingerprints)
    }

    /// Shorthand to add data to a vault in tests
    pub fn patch_data_test(
        self,
        conn: &mut TxnPgConn,
        data: Vec<(DataIdentifier, PiiJsonValue)>,
        create_fingerprints: bool,
    ) -> FpResult<Vec<(DataIdentifier, ContactInfo)>> {
        let sv = ScopedVault::get(conn, &self.sv.id)?;
        let data = HashMap::from_iter(data);
        let request = DataRequest::clean_and_validate(data, ValidateArgs::for_bifrost(self.vault.is_live))?;
        // Add fingerprints for ID data
        let fingerprints = request
            .iter()
            .filter(|(di, _)| di.is_fingerprintable())
            .filter_map(|(di, pii)| match di {
                DataIdentifier::Id(idk) => Some((idk, pii)),
                _ => None,
            })
            .map(|(idk, pii)| {
                let salt = if *idk == IdentityDataKind::PhoneNumber {
                    FingerprintSalt::Global(GlobalFingerprintKind::PhoneNumber)
                } else {
                    FingerprintSalt::Tenant((*idk).into(), sv.tenant_id.clone())
                };
                // for testing: we just do a regular hash
                let fingerprint = Fingerprint(crypto::sha256(pii.leak().as_bytes()).to_vec());
                (salt, fingerprint)
            })
            .collect();
        let request = if create_fingerprints {
            FingerprintedDataRequest::manual_fingerprints(request, fingerprints)
        } else {
            FingerprintedDataRequest::no_fingerprints_for_validation(request)
        };
        let source = DataRequestSource::HostedPatchVault(DataLifetimeSource::LikelyHosted.into());

        let result = self.patch_data(conn, request, source)?;
        let new_ci = result.updates.map(|updates| updates.ci).unwrap_or_default();

        Ok(new_ci)
    }
}
