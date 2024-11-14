use std::sync::Arc;

use super::m112223_backfill_portable_data::run;
use crate::utils::vault_wrapper::{Person, VaultWrapper, WriteableVw};
use crate::{errors::ApiResult, State};
use db::models::scoped_vault::ScopedVault;
use db::models::workflow::{Workflow, WorkflowUpdate};
use db::test_helpers::assert_have_same_elements;
use db::tests::fixtures::ob_configuration::ObConfigurationOpts;
use db::tests::test_db_pool::TestDbPool;
use db::TxnPgConn;
use feature_flag::FeatureFlagClient;
use macros::test_state;
use newtypes::{
    CollectedDataOption as CDO, DataIdentifier as DI, DataLifetimeSource, IdentityDataKind as IDK, PiiString,
};

struct TestData {
    su1: ScopedVault,
    su2: ScopedVault,
}

#[test_state]
async fn test_backfill(state: &mut State) {
    // Mimics the really specific case we've seen in prod where:
    // - User starts onboarding onto tenant
    // - User aborts and gets confused, finds footprint live and onboards onto fp live
    // - User then goes back to the tenant and finishes onboarding
    let ff_client = state.feature_flag_client.clone();
    let data = state
        .db_transaction(move |conn| -> ApiResult<_> { Ok(create_test_data(conn, ff_client)) })
        .await
        .unwrap();

    let result = run(state, None, None, true, false, 1).await;
    if let Err(e) = &result {
        println!("{}", e);
    }
    // Should have added data to 2 SVs
    let result = result.unwrap().into_iter().next().unwrap();
    assert_eq!(result.1.len(), 2);
    state
        .db_transaction(move |conn| -> ApiResult<_> {
            // Build the modern views that only load DLs owned by this tenant. Make sure we added
            // all the proper DLs
            let new_vw1 = VaultWrapper::<Person>::build_owned(conn, &data.su1.id)?;
            let new_vw2 = VaultWrapper::<Person>::build_owned(conn, &data.su2.id)?;

            assert_have_same_elements(
                new_vw1.populated_dis(),
                vec![
                    DI::Id(IDK::Email),
                    DI::Id(IDK::PhoneNumber),
                    DI::Id(IDK::FirstName),
                    DI::Id(IDK::LastName),
                    DI::Id(IDK::Ssn4),
                    // No ssn9, no DOB
                ],
            );
            assert_have_same_elements(
                new_vw2.populated_dis(),
                vec![
                    DI::Id(IDK::Email),
                    DI::Id(IDK::PhoneNumber),
                    DI::Id(IDK::FirstName),
                    DI::Id(IDK::LastName),
                    DI::Id(IDK::Ssn4),
                    DI::Id(IDK::Ssn9),
                    DI::Id(IDK::Dob),
                ],
            );

            // Check the weird email case - the data at tenant 2 is actually derived from the
            // most-recently portablized data from tenant 1
            let dl1 = new_vw1.get_lifetime(IDK::Email).unwrap();
            let dl2 = new_vw2.get_lifetime(IDK::Email).unwrap();
            assert_eq!(dl2.source, DataLifetimeSource::Prefill);
            assert_eq!(dl2.origin_id, Some(dl1.id.clone()));

            Ok(())
        })
        .await
        .unwrap();
}

fn create_test_data(conn: &mut TxnPgConn, ff_client: Arc<dyn FeatureFlagClient>) -> TestData {
    let tenant1 = db::tests::fixtures::tenant::create(conn);
    let tenant2 = db::tests::fixtures::tenant::create(conn);
    let pb1_opts = ObConfigurationOpts {
        // PB1 only collects ssn4, doesn't collect dob
        must_collect_data: vec![CDO::Email, CDO::PhoneNumber, CDO::Name, CDO::Ssn4],
        is_live: true,
        ..Default::default()
    };
    let pb1 = db::tests::fixtures::ob_configuration::create_with_opts(conn, &tenant1.id, pb1_opts);
    let pb2_opts = ObConfigurationOpts {
        must_collect_data: vec![CDO::Email, CDO::PhoneNumber, CDO::Name, CDO::Dob, CDO::Ssn9],
        is_live: true,
        ..Default::default()
    };
    let pb2 = db::tests::fixtures::ob_configuration::create_with_opts(conn, &tenant2.id, pb2_opts);

    let uv = db::tests::fixtures::vault::create_person(conn, true);
    let su1 = db::tests::fixtures::scoped_vault::create(conn, &uv.id, &pb1.id);
    let su2 = db::tests::fixtures::scoped_vault::create(conn, &uv.id, &pb2.id);

    let vw: WriteableVw<Person> = VaultWrapper::lock_for_onboarding(conn, &su1.id).unwrap();

    // The user goes through the identify flow on tenant 1
    let data = vec![
        (IDK::Email.into(), PiiString::new("test1@onefootprint.com".into())),
        (IDK::PhoneNumber.into(), PiiString::new("+15555550100".into())),
    ];
    vw.patch_data_test(conn, data, true).unwrap();
    let vw: WriteableVw<Person> = VaultWrapper::lock_for_onboarding(conn, &su1.id).unwrap();
    vw.on_otp_verified(conn, IDK::PhoneNumber.into()).unwrap();

    // They then onboard onto pb2 on tenant 2, with the half-complete data on tenant 1.
    // Some fun things happen here: in prod today, since the email isn't portable, we'll re-add it
    // to tenant 2
    let wf2 = db::tests::fixtures::workflow::create(conn, ff_client.clone(), &su2.id, &pb2.id, None);
    let data = vec![
        (IDK::Email.into(), PiiString::new("test1@onefootprint.com".into())),
        (IDK::FirstName.into(), PiiString::new("Hayes".into())),
        (IDK::LastName.into(), PiiString::new("Valley".into())),
        (IDK::Dob.into(), PiiString::new("1995-10-10".into())),
        (IDK::Ssn9.into(), PiiString::new("123-12-1234".into())),
    ];
    let vw: WriteableVw<Person> = VaultWrapper::lock_for_onboarding(conn, &su2.id).unwrap();
    vw.patch_data_test(conn, data, true).unwrap();
    let wf2 = Workflow::lock(conn, &wf2.id).unwrap();
    Workflow::update(wf2, conn, WorkflowUpdate::is_authorized()).unwrap();
    let vw: WriteableVw<Person> = VaultWrapper::lock_for_onboarding(conn, &su2.id).unwrap();
    vw.portablize_identity_data(conn).unwrap();

    // They then finish onboarding onto pb1 at tenant 1.
    // This also does something fun: we deactivate the portable email at tenant 2 and portablize
    // the email initialy added by tenant 1
    let wf1 = db::tests::fixtures::workflow::create(conn, ff_client, &su1.id, &pb1.id, None);
    let wf1 = Workflow::lock(conn, &wf1.id).unwrap();
    Workflow::update(wf1, conn, WorkflowUpdate::is_authorized()).unwrap();
    let vw: WriteableVw<Person> = VaultWrapper::lock_for_onboarding(conn, &su1.id).unwrap();
    vw.portablize_identity_data(conn).unwrap();

    TestData { su1, su2 }
}
