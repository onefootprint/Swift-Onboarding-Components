use std::collections::HashMap;

use crate::{
    errors::ApiResult,
    utils::vault_wrapper::{Any, VaultWrapper, VwArgs},
    ApiErrorKind, State,
};
use db::models::{
    decision_intent::DecisionIntent, ob_configuration::ObConfiguration, scoped_vault::ScopedVault,
    verification_request::VerificationRequest, verification_result::VerificationResult,
};
use idv::VendorResponse;
use newtypes::{ObConfigurationKey, VendorAPI, WorkflowId};
use std::future::Future;
use strum::IntoEnumIterator;
use strum_macros::EnumIter;

use super::{
    get_vendor_apis_for_verification_requests, make_request,
    tenant_vendor_control::TenantVendorControl,
    vendor_result::{HydratedVerificationResult, RequestAndMaybeHydratedResult, VendorResult},
    VendorAPIError,
};

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, EnumIter)]
// For now, we just have 1 singular KYC waterfall ordering for all vendors. We start with Experian and then waterfall to Idology if needed.
// (we still only make vendor calls that are available to the tenant as dictated by tvc)
pub enum KycVendorApiOrder {
    Experian,
    Idology,
}

impl From<KycVendorApiOrder> for VendorAPI {
    fn from(value: KycVendorApiOrder) -> Self {
        match value {
            KycVendorApiOrder::Experian => VendorAPI::ExperianPreciseID,
            KycVendorApiOrder::Idology => VendorAPI::IdologyExpectID,
        }
    }
}

// Constructs a Vec with every available KYC VendorAPI in the correct waterfall order, with the accompanying Vreq+Vres (if any)
#[tracing::instrument(skip(latest_results))]
fn get_waterfall_vec(
    available_vendor_apis: Vec<VendorAPI>,
    latest_results: Vec<RequestAndMaybeHydratedResult>,
) -> Vec<(VendorAPI, Option<RequestAndMaybeHydratedResult>)> {
    let vendor_api_to_latest_result: HashMap<VendorAPI, RequestAndMaybeHydratedResult> = latest_results
        .into_iter()
        .map(|r| (r.vreq.vendor_api, r))
        .collect();

    KycVendorApiOrder::iter()
        .map(VendorAPI::from)
        .filter(|vendor_api| available_vendor_apis.contains(vendor_api))
        .map(|vendor_api| (vendor_api, vendor_api_to_latest_result.get(&vendor_api).cloned()))
        .collect()
}

#[tracing::instrument(skip(state))]
pub async fn run_kyc_waterfall(
    state: &State,
    di: &DecisionIntent,
    wf_id: &WorkflowId,
) -> ApiResult<Vec<VendorResult>> {
    let svid = di.scoped_vault_id.clone();
    let diid = di.id.clone();
    let wf_id = wf_id.clone();
    let (latest_results, tenant_id, vw, ob_configuration_key) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, &svid)?;

            let latest_results =
                VerificationRequest::get_latest_by_vendor_api_for_decision_intent(conn, &diid)?;

            let vw = VaultWrapper::<Any>::build(conn, VwArgs::Tenant(&sv.id))?;

            let ob_configuration_key: ObConfigurationKey = ObConfiguration::get(conn, &wf_id)?.0.key;

            Ok((latest_results, sv.tenant_id, vw, ob_configuration_key))
        })
        .await??;

    let tvc =
        TenantVendorControl::new(tenant_id, &state.db_pool, &state.config, &state.enclave_client).await?;

    let latest_results =
        VendorResult::hydrate_vendor_results(latest_results, &state.enclave_client, &vw.vault.e_private_key)
            .await?;

    let available_vendor_apis = get_vendor_apis_for_verification_requests(vw.populated().as_slice(), &tvc)?;
    let waterfall_vec = get_waterfall_vec(available_vendor_apis.clone(), latest_results.clone());

    let sv_id = di.scoped_vault_id.clone();
    let di_id = di.id.clone();
    tracing::info!(
        ?available_vendor_apis,
        waterfall_vec_len = waterfall_vec.len(),
        latest_results_len = latest_results.len(),
        scoped_vault_id = ?sv_id,
        decision_intent_id = ?di_id,
        "run_kyc_waterfall starting waterfall_loop"
    );

    waterfall_loop(waterfall_vec, |vendor_api| {
        make_request::make_idv_vendor_call_save_vreq_vres(
            state,
            &tvc,
            &sv_id,
            &di_id,
            ob_configuration_key.clone(),
            vendor_api,
        )
    })
    .await
}

#[tracing::instrument(skip_all)]
async fn waterfall_loop<F, Fut>(
    mut waterfall_vec: Vec<(VendorAPI, Option<RequestAndMaybeHydratedResult>)>,
    make_vendor_call: F,
) -> ApiResult<Vec<VendorResult>>
where
    F: Fn(VendorAPI) -> Fut,
    Fut: Future<
        Output = ApiResult<(
            VerificationRequest,
            VerificationResult,
            Result<VendorResponse, VendorAPIError>,
        )>,
    >,
{
    // if we already have a successful response then we are done and just return that successful response.
    // for now, this would most likely just 1 response since our current waterfall strategy is to only waterfall on hard errors and stop when we get 1 success
    // If this case is hit, that really means that we complted the waterfall successfully but then crashed before completing `on_commit` and advancing the workflow
    let success_responses = get_successful_vendor_responses(waterfall_vec.clone());
    if !success_responses.is_empty() {
        tracing::info!(
            success_responses_len = success_responses.len(),
            "[waterfall_loop] success_response already exists, returning"
        );
        return Ok(success_responses);
    }

    let mut i = 0;
    let mut have_attempted_call = false;

    // collect all successful results. These are what we would write risk signals from in the workflow state `on_commit`
    // hypothetically, at least with our current waterfall logic, we'd just return 1 single VendoResult (since we stop when we get a good repsonse from a vendor)
    // but probably pretty soon, we will extend our logic here to waterfall not only on hard errors but also on vendor responses that fail the user
    loop {
        tracing::info!(waterfall_vec_len=?waterfall_vec.len(), "[waterfall_loop] loop");
        let vr = waterfall_vec.get(i).cloned();
        let Some((vendor_api, req_res)) = vr else {
            // we have exhausted the waterfall of vendors to try
            return Err(ApiErrorKind::VendorRequestsFailed.into());
		};
        match next_action(&req_res, have_attempted_call) {
            Action::Done => {
                tracing::info!(?vendor_api, "[waterfall_loop] Done");
                break;
            }
            Action::MakeCall => {
                tracing::info!(?vendor_api, "[waterfall_loop] MakeCall");
                let (vreq, vres, res) = make_vendor_call(vendor_api).await?;
                have_attempted_call = true;
                waterfall_vec[i] = (
                    vendor_api,
                    Some(RequestAndMaybeHydratedResult {
                        vreq,
                        vres: Some(HydratedVerificationResult {
                            vres,
                            response: res.ok(),
                        }),
                    }),
                );
            }
            Action::TryNextVendor => {
                tracing::info!(?vendor_api, ?i, "[waterfall_loop] TryNextVendor");
                have_attempted_call = false;
                i += 1;
            }
        }
    }

    // return all successful VendorResponse's (although atm this is probably just 1)
    Ok(get_successful_vendor_responses(waterfall_vec))
}

fn get_successful_vendor_responses(
    waterfall_vec: Vec<(VendorAPI, Option<RequestAndMaybeHydratedResult>)>,
) -> Vec<VendorResult> {
    waterfall_vec
        .into_iter()
        .filter_map(|(_, vreq_vres)| vreq_vres.and_then(|vreq_vres| vreq_vres.into_vendor_result()))
        .collect()
}

enum Action {
    Done,
    MakeCall,
    TryNextVendor,
}

#[allow(clippy::collapsible_match)]
fn next_action(req_res: &Option<RequestAndMaybeHydratedResult>, have_attempted_call: bool) -> Action {
    match req_res {
        Some(vreq_vres) => match &vreq_vres.vres {
            Some(res) => {
                if res.vres.is_error {
                    // Right now, we retry transient errors within the client themselves. If the retry strategy doesn't succeed in a few seconds, then
                    // we will save a vres with is_error = true. Normally, we'd proceed with trying the next vendor. But if there is no next vendor available,
                    // then we would have to hard error and in those cases we would want to manually trigger re-attempting of vendor calls (ie prompting stuck workflows via /proceed).
                    // To enable that, if this is the first call in the attempt of running vendor calls, we will make a vendor call instead of trying to proceed to the next vendor
                    // (if we instead had logic that said "makecall if there is no next vendor", then we would infinite loop trying the last failing vendor)
                    if !have_attempted_call {
                        Action::MakeCall
                    } else {
                        Action::TryNextVendor
                    }
                } else {
                    // We have a vreq with a successful vres so we are done and should make no further calls
                    // later, we might also execute rules or other logic to determine if we should waterfall even in the face of a non-error response
                    Action::Done
                }
            }
            // We have a vreq with no accompanying vres. Theoretically means we crashed before saving the vres. We should just make a brand new call and save a new vreq+vres
            None => Action::MakeCall,
        },
        // We have not attempted calling this vendor at all yet (no Vreq exists) so we should make a call
        None => Action::MakeCall,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::decision::state::test_utils;
    use db::models::tenant_vendor::TenantVendorControl as DbTenantVendorControl;
    use db::tests::fixtures::ob_configuration::ObConfigurationOpts;
    use feature_flag::MockFeatureFlagClient;
    use idv::ParsedResponse;
    use macros::test_state_case;
    use newtypes::DecisionIntentKind;
    use newtypes::Vendor;
    use std::sync::Arc;

    struct ExperianEnabled(bool);
    struct IdologyEnabled(bool);

    enum VR {
        ShouldntCall,
        Success,
        Error,
    }
    struct ExperianResponse(VR);
    struct IdologyResponse(VR);

    enum ExpectedResult {
        SingularSuccessVendorResult(Vendor),
        ErrVendorRequestsFailed,
        ErrNotEnoughInformation,
    }

    struct Run(ExperianResponse, IdologyResponse, ExpectedResult);

    #[test_state_case(
        ExperianEnabled(false),
        IdologyEnabled(false),
        Run(ExperianResponse(VR::ShouldntCall),IdologyResponse(VR::ShouldntCall), ExpectedResult::ErrNotEnoughInformation),
        Run(ExperianResponse(VR::ShouldntCall),IdologyResponse(VR::ShouldntCall), ExpectedResult::ErrNotEnoughInformation)
        ; "No available vendor"
    )]
    #[test_state_case(
        ExperianEnabled(false),
        IdologyEnabled(true),
        Run(ExperianResponse(VR::ShouldntCall),IdologyResponse(VR::Success), ExpectedResult::SingularSuccessVendorResult(Vendor::Idology)),
        Run(ExperianResponse(VR::ShouldntCall),IdologyResponse(VR::ShouldntCall), ExpectedResult::SingularSuccessVendorResult(Vendor::Idology))
        ; "Idology only, call succeeds"
    )]
    #[test_state_case(
        ExperianEnabled(false),
        IdologyEnabled(true),
        Run(ExperianResponse(VR::ShouldntCall), IdologyResponse(VR::Error), ExpectedResult::ErrVendorRequestsFailed),
        Run(ExperianResponse(VR::ShouldntCall), IdologyResponse(VR::Error), ExpectedResult::ErrVendorRequestsFailed)
        ; "Idology only, call errors, re-run errors"
    )]
    #[test_state_case(
        ExperianEnabled(false),
        IdologyEnabled(true),
        Run(ExperianResponse(VR::ShouldntCall), IdologyResponse(VR::Error), ExpectedResult::ErrVendorRequestsFailed),
        Run(ExperianResponse(VR::ShouldntCall), IdologyResponse(VR::Success), ExpectedResult::SingularSuccessVendorResult(Vendor::Idology))
        ; "Idology only, call errors, re-rerun succeeds"
    )]
    #[test_state_case(
        ExperianEnabled(true),
        IdologyEnabled(false),
        Run(ExperianResponse(VR::Success), IdologyResponse(VR::ShouldntCall), ExpectedResult::SingularSuccessVendorResult(Vendor::Experian)),
        Run(ExperianResponse(VR::ShouldntCall), IdologyResponse(VR::ShouldntCall), ExpectedResult::SingularSuccessVendorResult(Vendor::Experian))
        ; "Experian only, call succeeds"
    )]
    #[test_state_case(
        ExperianEnabled(true),
        IdologyEnabled(false),
        Run(ExperianResponse(VR::Error), IdologyResponse(VR::ShouldntCall), ExpectedResult::ErrVendorRequestsFailed),
        Run(ExperianResponse(VR::Error), IdologyResponse(VR::ShouldntCall), ExpectedResult::ErrVendorRequestsFailed)
        ; "Experian only, call errors, re-run errors"
    )]
    #[test_state_case(
        ExperianEnabled(true),
        IdologyEnabled(false),
        Run(ExperianResponse(VR::Error), IdologyResponse(VR::ShouldntCall), ExpectedResult::ErrVendorRequestsFailed) ,
        Run(ExperianResponse(VR::Success), IdologyResponse(VR::ShouldntCall), ExpectedResult::SingularSuccessVendorResult(Vendor::Experian))
        ; "Experian only, call errors, re-run succeeds"
    )]
    #[test_state_case(
        ExperianEnabled(true),
        IdologyEnabled(true),
        Run(ExperianResponse(VR::Success), IdologyResponse(VR::ShouldntCall), ExpectedResult::SingularSuccessVendorResult(Vendor::Experian)),
        Run(ExperianResponse(VR::ShouldntCall), IdologyResponse(VR::ShouldntCall), ExpectedResult::SingularSuccessVendorResult(Vendor::Experian))
        ; "Both, Experian succeeds"
    )]
    #[test_state_case(
        ExperianEnabled(true),
        IdologyEnabled(true),
        Run(ExperianResponse(VR::Error), IdologyResponse(VR::Success), ExpectedResult::SingularSuccessVendorResult(Vendor::Idology)),
        Run(ExperianResponse(VR::ShouldntCall), IdologyResponse(VR::ShouldntCall), ExpectedResult::SingularSuccessVendorResult(Vendor::Idology))
        ; "Both, Experian fails, Idology succeeds"
    )]
    #[test_state_case(
        ExperianEnabled(true),
        IdologyEnabled(true),
        Run(ExperianResponse(VR::Error), IdologyResponse(VR::Error), ExpectedResult::ErrVendorRequestsFailed),
        Run(ExperianResponse(VR::Success), IdologyResponse(VR::ShouldntCall), ExpectedResult::SingularSuccessVendorResult(Vendor::Experian))
        ; "Both, Experian fails, Idology fails, re-run Experian succeeds"
    )]
    #[test_state_case(
        ExperianEnabled(true),
        IdologyEnabled(true),
        Run(ExperianResponse(VR::Error), IdologyResponse(VR::Error), ExpectedResult::ErrVendorRequestsFailed),
        Run(ExperianResponse(VR::Error), IdologyResponse(VR::Success), ExpectedResult::SingularSuccessVendorResult(Vendor::Idology))
        ; "Both, Experian fails, Idology fails, re-run Experian fails Idology succeeds"
    )]
    #[test_state_case(
        ExperianEnabled(true),
        IdologyEnabled(true),
        Run(ExperianResponse(VR::Error), IdologyResponse(VR::Error), ExpectedResult::ErrVendorRequestsFailed),
        Run(ExperianResponse(VR::Error), IdologyResponse(VR::Error), ExpectedResult::ErrVendorRequestsFailed)
        ; "Both, Experian fails, Idology fails, re-run Experian fails Idology fails"
    )]
    #[tokio::test]
    async fn test_run_kyc_waterfall(
        state: &mut State,
        experian_enabled: ExperianEnabled,
        idology_enabled: IdologyEnabled,
        run1: Run,
        run2: Run,
    ) {
        // Setup
        let (wf, t, _obc, _tu) = test_utils::setup_data(
            state,
            ObConfigurationOpts {
                is_live: true,
                ..Default::default()
            },
            None,
        )
        .await;

        let di =
            state
                .db_pool
                .db_transaction(move |conn| -> ApiResult<_> {
                    let _tvc: DbTenantVendorControl = DbTenantVendorControl::create(
                        conn,
                        t.id,
                        idology_enabled.0,
                        experian_enabled.0,
                        experian_enabled.0.then(|| "abc123".to_owned()),
                        None,
                    )
                    .unwrap();

                    Ok(DecisionIntent::create(
                        conn,
                        DecisionIntentKind::OnboardingKyc,
                        &wf.scoped_vault_id,
                        None,
                    )
                    .unwrap())
                })
                .await
                .unwrap();

        // Mock Run 1

        let Run {
            0: experian_response,
            1: idology_response,
            2: expected_result,
        } = run1;
        mock_calls(state, experian_response, idology_response);
        // Function under test
        let res = run_kyc_waterfall(state, &di, &wf.id).await;
        // Assertions
        assert_expected_result(state, expected_result, res).await;

        // Simulate re-running. Ones that suceeded already should noop. Ones that ended in error should remake vendor calls
        // Mock Run 2
        let Run {
            0: experian_response2,
            1: idology_response2,
            2: expected_result2,
        } = run2;
        mock_calls(state, experian_response2, idology_response2);
        // Function under test
        let res2 = run_kyc_waterfall(state, &di, &wf.id).await;
        // Assertions
        assert_expected_result(state, expected_result2, res2).await;
    }

    fn mock_calls(state: &mut State, experian_response: ExperianResponse, idology_response: IdologyResponse) {
        // TODO: maybe by default the state's mock_ff_client could respond to any flag and return their default value (since thats something we specify in enum). Oof but then we gotta solve the whole is_production dealiooo
        let mut mock_ff_client = MockFeatureFlagClient::new();
        mock_ff_client.expect_flag().return_const(true);
        match idology_response.0 {
            VR::ShouldntCall => (),
            VR::Success => test_utils::mock_idology(state, test_utils::WithQualifier(None)),
            VR::Error => test_utils::mock_idology_error(state),
        };
        match experian_response.0 {
            VR::ShouldntCall => (),
            VR::Success => test_utils::mock_experian(state),
            VR::Error => test_utils::mock_experian_error(state),
        };
        state.set_ff_client(Arc::new(mock_ff_client));
    }

    async fn assert_expected_result(
        state: &mut State,
        expected_result: ExpectedResult,
        res: ApiResult<Vec<VendorResult>>,
    ) {
        match expected_result {
            ExpectedResult::SingularSuccessVendorResult(vendor) => {
                let mut res = res.unwrap();
                assert_eq!(1, res.len());
                assert_vendor_result(state, vendor, res.pop().unwrap()).await;
            }
            ExpectedResult::ErrVendorRequestsFailed => {
                let err = res.err().unwrap();
                if !matches!(err.kind(), ApiErrorKind::VendorRequestsFailed) {
                    panic!("{:#?}", err);
                }
                // TODO: could also assert that vreq/vres with is_error = true was written
            }
            ExpectedResult::ErrNotEnoughInformation => {
                let err = res.err().unwrap();
                if let ApiErrorKind::AssertionError(s) = err.kind() {
                    assert_eq!(
                        "Not enough information to send to any vendors".to_owned(),
                        s.to_owned()
                    );
                } else {
                    panic!("{:#?}", err);
                }
            }
        };
    }

    async fn assert_vendor_result(state: &mut State, expected_vendor: Vendor, vr: VendorResult) {
        let vreqid = vr.verification_request_id.clone();
        let vresid = vr.verification_result_id.clone();
        let (vreq, vres) = state
            .db_pool
            .db_query(move |conn| {
                let vreq = VerificationRequest::get(conn, &vreqid).unwrap();
                let vres = VerificationResult::get(conn, &vresid).unwrap();
                (vreq, vres)
            })
            .await
            .unwrap();

        assert_eq!(vreq.vendor, expected_vendor);
        assert!(!vres.is_error);

        match expected_vendor {
            Vendor::Idology => assert!(matches!(vr.response.response, ParsedResponse::IDologyExpectID(_))),
            Vendor::Experian => assert!(matches!(
                vr.response.response,
                ParsedResponse::ExperianPreciseID(_)
            )),
            _ => panic!(),
        };
    }
}
