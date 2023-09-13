use std::sync::Arc;

use crate::decision::state::actions::Authorize;
use crate::decision::state::test_utils::{mock_idology_pa_hit, mock_incode, AmlKind, WithHit};
use crate::decision::state::test_utils::{
    query_data, setup_data,
    UserKind::{self},
};
use crate::decision::state::{WorkflowActions, WorkflowWrapper};
use crate::State;
use db::tests::fixtures::ob_configuration::ObConfigurationOpts;
use feature_flag::{BoolFlag, MockFeatureFlagClient};
use macros::test_state_case;
use newtypes::VendorAPI;
use newtypes::{
    DecisionStatus, EnhancedAmlOption, KycState, OnboardingStatus,
    VendorAPI::{IdologyExpectID, IncodeWatchlistCheck},
    WorkflowState,
};
use strum::IntoEnumIterator;

enum VR {
    NotExpected,
    Hits(Vec<AmlKind>),
}

enum RS {
    None,
    Some(VendorAPI, Vec<AmlKind>),
}

#[test_state_case(EnhancedAmlOption::No, VR::Hits(vec![]), VR::NotExpected, (OnboardingStatus::Pass, RS::None))]
#[test_state_case(EnhancedAmlOption::No, VR::Hits(vec![AmlKind::Ofac]), VR::NotExpected, (OnboardingStatus::Fail, RS::Some(IdologyExpectID, vec![AmlKind::Ofac])))]
#[test_state_case(EnhancedAmlOption::No, VR::Hits(vec![AmlKind::Pep]), VR::NotExpected, (OnboardingStatus::Fail, RS::Some(IdologyExpectID, vec![AmlKind::Pep])))]
#[test_state_case(EnhancedAmlOption::Yes {ofac: true, pep: true, adverse_media:true, continuous_monitoring:true}, VR::Hits(vec![]), VR::Hits(vec![]), (OnboardingStatus::Pass, RS::None))]
#[test_state_case(EnhancedAmlOption::Yes {ofac: true, pep: true, adverse_media:true, continuous_monitoring:true}, VR::Hits(vec![]), VR::Hits(vec![AmlKind::Ofac]), (OnboardingStatus::Fail, RS::Some(IncodeWatchlistCheck,vec![AmlKind::Ofac])))]
#[test_state_case(EnhancedAmlOption::Yes {ofac: true, pep: true, adverse_media:true, continuous_monitoring:true}, VR::Hits(vec![]), VR::Hits(vec![AmlKind::Ofac, AmlKind::Pep]), (OnboardingStatus::Fail, RS::Some(IncodeWatchlistCheck,vec![AmlKind::Ofac, AmlKind::Pep])))]
#[test_state_case(EnhancedAmlOption::Yes {ofac: true, pep: true, adverse_media:true, continuous_monitoring:true}, VR::Hits(vec![AmlKind::Ofac]), VR::Hits(vec![AmlKind::Ofac, AmlKind::Pep]), (OnboardingStatus::Fail, RS::Some(IncodeWatchlistCheck,vec![AmlKind::Ofac, AmlKind::Pep])))]
#[test_state_case(EnhancedAmlOption::Yes {ofac: true, pep: false, adverse_media:true, continuous_monitoring:true}, VR::Hits(vec![]), VR::Hits(vec![AmlKind::Ofac, AmlKind::Pep]), (OnboardingStatus::Fail, RS::Some(IncodeWatchlistCheck,vec![AmlKind::Ofac])))]
#[test_state_case(EnhancedAmlOption::Yes {ofac: true, pep: false, adverse_media:true, continuous_monitoring:true}, VR::Hits(vec![]), VR::Hits(vec![AmlKind::Pep]), (OnboardingStatus::Pass, RS::None))]
#[tokio::test(flavor = "multi_thread", worker_threads = 1)]
async fn test(
    state: &mut State,
    enhanced_aml: EnhancedAmlOption,
    kyc_call: VR,
    aml_call: VR,
    expected: (OnboardingStatus, RS),
) {
    let (expected_status, expected_rs) = expected;
    let user_kind = UserKind::Live;
    // DATA SETUP
    let (wf, _t, _obc, _tu) = setup_data(
        state,
        ObConfigurationOpts {
            is_live: user_kind.is_live(),
            enhanced_aml,
            ..Default::default()
        },
        user_kind.fixture_result(),
    )
    .await;

    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();

    let ww = WorkflowWrapper::init(state, wf).await.unwrap();

    // Mock Vendor Calls
    let mut mock_ff_client = MockFeatureFlagClient::new();
    mock_ff_client.expect_flag().returning(|f| match f {
        BoolFlag::EnableIdologyInNonProd(_) => true,
        BoolFlag::EnableIncodeWatchlistCheckInNonProd(_) => true,
        _ => f.default(),
    });

    match kyc_call {
        VR::NotExpected => {}
        VR::Hits(kinds) => mock_idology_pa_hit(state, kinds),
    };

    match aml_call {
        VR::NotExpected => {}
        VR::Hits(kinds) => {
            mock_incode(state, WithHit(kinds));
        }
    };

    state.set_ff_client(Arc::new(mock_ff_client));

    // TEST
    let _ww = ww
        .run(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();

    let (wf, _, mr, obd, rs, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyc(KycState::Complete), wf.state);
    // TODO: This assertion will fail if enhanced_aml = Yes because we are not yet properly incorporating Incode Aml risk signals into rules decisioning!!!!!!!!!!
    assert_eq!(expected_status, wf.status.unwrap());
    let obd = obd.unwrap();
    if expected_status == OnboardingStatus::Fail {
        assert!(mr.is_some());
        assert_eq!(obd.status, DecisionStatus::Fail);
        assert!(obd.seqno.is_some());
    } else {
        assert!(mr.is_none());
        assert_eq!(obd.status, DecisionStatus::Pass);
        assert!(obd.seqno.is_some());
    }

    AmlKind::iter().for_each(|k| {
        let rs_for_kind: Vec<&db::models::risk_signal::RiskSignal> = rs
            .iter()
            .filter(|r| match k {
                AmlKind::Ofac => r.reason_code.is_watchlist(),
                AmlKind::Pep => r.reason_code.is_pep(),
                AmlKind::Am => r.reason_code.is_adverse_media(),
            })
            .collect::<Vec<_>>();

        match &expected_rs {
            RS::Some(vendor_api, kinds) if kinds.contains(&k) => {
                assert_eq!(1, rs_for_kind.len());
                assert_eq!(vendor_api.to_owned(), rs_for_kind[0].vendor_api);
            }
            _ => assert!(rs_for_kind.is_empty()),
        };
    });
}
