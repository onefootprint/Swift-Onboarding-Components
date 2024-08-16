use crate::decision::vendor::vendor_trait::MockVendorAPICall;
use crate::task::tasks::watchlist_check::watchlist_check_task::WatchlistCheckTask;
use crate::task::ExecuteTask;
use crate::FpResult;
use crate::State;
use db::models::decision_intent::DecisionIntent;
use db::models::risk_signal::RiskSignal;
use db::models::scoped_vault::ScopedVault;
use db::models::task::Task;
use db::models::user_timeline::UserTimeline;
use db::models::vault::Vault;
use db::models::verification_request::RequestAndMaybeResult;
use db::models::verification_request::VerificationRequest;
use db::models::verification_result::VerificationResult;
use db::models::watchlist_check::WatchlistCheck;
use db::tests::fixtures;
use db::tests::fixtures::ob_configuration::ObConfigurationOpts;
use db::DbPool;
use db::DbResult;
use idv::idology::pa::IdologyPaAPIResponse;
use idv::idology::pa::IdologyPaRequest;
use idv::incode::response::OnboardingStartResponse;
use idv::incode::watchlist::response::UpdatedWatchlistResultResponse;
use idv::incode::IncodeAPIResult;
use idv::incode::IncodeResponse;
use idv::incode::IncodeStartOnboardingRequest;
use idv::ParsedResponse;
use idv::VendorResponse;
use newtypes::DecisionIntentKind;
use newtypes::EnhancedAmlOption;
use newtypes::IdentityDataKind as IDK;
use newtypes::OnboardingStatus;
use newtypes::RiskSignalGroupKind;
use newtypes::ScopedVaultId;
use newtypes::TaskId;
use newtypes::WatchlistCheckArgs;
use newtypes::WatchlistCheckError;
use newtypes::WatchlistCheckStatusKind;
use std::sync::Arc;
use webhooks::events::WebhookEvent;
use webhooks::MockWebhookClient;

mod watchlist_check_task;

//
// Test Helpers
//
#[derive(Clone)]
enum VaultKind {
    NonPortable,
    Portable(EnhancedAmlOption),
}

impl VaultKind {
    pub fn expects_idology(&self) -> bool {
        matches!(
            self,
            VaultKind::NonPortable | VaultKind::Portable(EnhancedAmlOption::No)
        )
    }
}

async fn create_user_and_task(
    state: &State,
    vault_kind: VaultKind,
    is_live: bool,
    onboarding_status: OnboardingStatus,
    idks: Vec<IDK>,
) -> (ScopedVault, Task) {
    let (sv, task) = state
        .db_pool
        .db_transaction(move |conn| -> DbResult<_> {
            let sv = match vault_kind {
                VaultKind::NonPortable => {
                    let tenant = fixtures::tenant::create(conn);
                    let (_uv, sv) = crate::tests::fixtures::lib::create_user_and_populate_vault(
                        conn, is_live, tenant.id, None, idks,
                    );
                    sv
                }
                VaultKind::Portable(enhanced_aml) => {
                    let (_, _, sv, _) = crate::tests::fixtures::lib::create_user_and_onboarding(
                        conn,
                        ObConfigurationOpts {
                            is_live,
                            enhanced_aml,
                            ..Default::default()
                        },
                        onboarding_status,
                        idks,
                    );
                    sv
                }
            };

            let task = fixtures::task::create_watchlist_check(conn, &sv.id);
            Ok((sv.into_inner(), task))
        })
        .await
        .unwrap();

    (sv, task)
}

async fn run_task(state: &mut State, sv_id: &ScopedVaultId, task_id: &TaskId) -> FpResult<()> {
    let wct = WatchlistCheckTask::new(state.clone(), task_id.clone());
    let args = WatchlistCheckArgs {
        scoped_vault_id: sv_id.clone(),
    };
    wct.execute(args).await
}

async fn save_existing_watchlist_check_vres(state: &mut State, sv_id: &ScopedVaultId) -> VerificationResult {
    let sv_id = sv_id.clone();
    let res = idv::tests::fixtures::incode::watchlist_result_response(vec![]);
    let vr = Ok(VendorResponse {
        response: ParsedResponse::IncodeWatchlistCheck(res.result.into_success().unwrap()),
        raw_response: res.raw_response,
    });
    state
        .db_pool
        .db_query(move |conn| -> FpResult<VerificationResult> {
            let v = Vault::get(conn, &sv_id).unwrap();
            let di = DecisionIntent::create(conn, DecisionIntentKind::OnboardingKyc, &sv_id, None).unwrap();
            let (_vreq, vres) = crate::decision::vendor::verification_result::save_vreq_and_vres(
                conn,
                &v.public_key,
                &sv_id,
                &di.id,
                vr,
            )?;
            Ok(vres)
        })
        .await
        .unwrap()
}

async fn get_data(
    db_pool: &DbPool,
    svid: ScopedVaultId,
) -> (
    WatchlistCheck,
    Option<DecisionIntent>,
    Vec<RequestAndMaybeResult>,
    Option<UserTimeline>,
    Vec<RiskSignal>,
) {
    db_pool
        .db_query(move |conn| -> DbResult<_> {
            let wc = WatchlistCheck::_get_by_svid(conn, &svid)?;
            let ut = UserTimeline::get_by_event_data_id(conn, &svid, wc.id.to_string())?;

            let (di, vreqs) = if let Some(di_id) = wc.decision_intent_id.as_ref() {
                let di = DecisionIntent::get(conn, di_id)?;
                let vreqs = VerificationRequest::list(conn, di_id)?;
                (Some(di), vreqs)
            } else {
                (None, vec![])
            };

            let aml_rs = RiskSignal::latest_by_risk_signal_group_kind(conn, &svid, RiskSignalGroupKind::Aml)?;

            Ok((wc, di, vreqs, ut, aml_rs))
        })
        .await
        .unwrap()
}

fn full_vault() -> Vec<IDK> {
    vec![
        IDK::PhoneNumber,
        IDK::FirstName,
        IDK::LastName,
        IDK::AddressLine1,
        IDK::AddressLine2,
        IDK::City,
        IDK::State,
        IDK::Zip,
        IDK::Country,
    ]
}

enum VendorRes {
    Hit,
    NoHit,
    Error,
}

fn mock_idology_pa(state: &mut State, vendor_result: &VendorRes) {
    let mut mock =
        MockVendorAPICall::<IdologyPaRequest, IdologyPaAPIResponse, idv::idology::error::Error>::new();
    let res = match vendor_result {
        VendorRes::Hit => Ok(idv::tests::fixtures::idology::create_response_pa_hit()),
        VendorRes::NoHit => Ok(idv::tests::fixtures::idology::create_response_pa_no_hit()),
        VendorRes::Error => Err(idv::idology::error::Error::UnknownError("uhoh".to_owned())),
    };
    mock.expect_make_request().times(1).return_once(|_| res);
    state.set_idology_pa(Arc::new(mock));
}

fn mock_incode_watchlist_check(state: &mut State, vendor_result: &VendorRes) {
    let res = match vendor_result {
        VendorRes::Hit => Ok(idv::tests::fixtures::incode::watchlist_result_response(vec![
            "sanction".to_owned(),
        ])),
        VendorRes::NoHit => Ok(idv::tests::fixtures::incode::watchlist_result_response(vec![])),
        VendorRes::Error => Ok(idv::tests::fixtures::incode::watchlist_result_error_response()),
    };

    let mut mock_incode_start_onboarding = MockVendorAPICall::<
        IncodeStartOnboardingRequest,
        IncodeResponse<OnboardingStartResponse>,
        idv::incode::error::Error,
    >::new();
    mock_incode_start_onboarding
        .expect_make_request()
        .times(1)
        .return_once(move |_| Ok(idv::tests::fixtures::incode::start_onboarding_response()));
    state.set_incode_start_onboarding(Arc::new(mock_incode_start_onboarding));

    let mut mock_incode_watchlist_check = MockVendorAPICall::<
        idv::incode::watchlist::IncodeWatchlistCheckRequest,
        IncodeResponse<idv::incode::watchlist::response::WatchlistResultResponse>,
        idv::incode::error::Error,
    >::new();

    mock_incode_watchlist_check
        .expect_make_request()
        .times(1)
        .return_once(move |_| res);
    state.set_incode_watchlist_check(Arc::new(mock_incode_watchlist_check));
}

fn mock_incode_updated_watchlist_result(state: &mut State, vendor_result: &VendorRes) {
    let res = match vendor_result {
        VendorRes::Hit => Ok(idv::tests::fixtures::incode::watchlist_result_response(vec![
            "sanction".to_owned(),
        ])),
        VendorRes::NoHit => Ok(idv::tests::fixtures::incode::watchlist_result_response(vec![])),
        VendorRes::Error => Ok(idv::tests::fixtures::incode::watchlist_result_error_response()),
    }
    // To convert from WatchlistResultResponse -> UpdatedWatchlistResultResponse
    .map(|r| match r.result {
        IncodeAPIResult::Success(v) => IncodeResponse {
            result: IncodeAPIResult::Success(UpdatedWatchlistResultResponse(v)),
            raw_response: r.raw_response,
        },
        IncodeAPIResult::ResponseErrorHandled(e) => IncodeResponse {
            result: IncodeAPIResult::ResponseErrorHandled(e),
            raw_response: r.raw_response,
        },
        IncodeAPIResult::ResponseErrorUnhandled(_) => unimplemented!("not tested"),
    });

    let mut mock_incode_start_onboarding = MockVendorAPICall::<
        IncodeStartOnboardingRequest,
        IncodeResponse<OnboardingStartResponse>,
        idv::incode::error::Error,
    >::new();
    mock_incode_start_onboarding
        .expect_make_request()
        .times(1)
        .return_once(move |_| Ok(idv::tests::fixtures::incode::start_onboarding_response()));
    state.set_incode_start_onboarding(Arc::new(mock_incode_start_onboarding));

    let mut mock_incode_updated_watchlist_result = MockVendorAPICall::<
        idv::incode::watchlist::IncodeUpdatedWatchlistResultRequest,
        IncodeResponse<idv::incode::watchlist::response::UpdatedWatchlistResultResponse>,
        idv::incode::error::Error,
    >::new();

    mock_incode_updated_watchlist_result
        .expect_make_request()
        .times(1)
        .return_once(move |_| res);
    state.set_incode_updated_watchlist_result(Arc::new(mock_incode_updated_watchlist_result));
}

fn expect_webhook(state: &mut State, status: WatchlistCheckStatusKind, error: Option<WatchlistCheckError>) {
    let mut mock_webhook_client = MockWebhookClient::new();

    mock_webhook_client
        .expect_send_event_to_tenant()
        .withf(move |_, _, _, w, _| match w {
            WebhookEvent::WatchlistCheckCompleted(p) => p.status == status && p.error == error,
            _ => false,
        })
        .times(1)
        .return_once(|_, _, _, _, _| Ok(()));
    // allow another other kind of webhooks (ie incidental
    // OnboardingStatusChanged/OnboardingStatusCompleted that our fixturing might cause)
    mock_webhook_client
        .expect_send_event_to_tenant()
        .withf(move |_, _, _, w, _| !matches!(w, WebhookEvent::WatchlistCheckCompleted(_p)))
        .returning(move |_, _, _, _, _| Ok(()));
    state.set_webhook_client(Arc::new(mock_webhook_client));
}

fn expect_no_webhook(state: &mut State) {
    let mut mock_webhook_client = MockWebhookClient::new();
    mock_webhook_client.expect_send_event_to_tenant().never();
    state.set_webhook_client(Arc::new(mock_webhook_client));
}
