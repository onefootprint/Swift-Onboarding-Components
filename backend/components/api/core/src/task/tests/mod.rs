use crate::decision::vendor::vendor_trait::MockVendorAPICall;
use crate::task::tasks::watchlist_check_task::WatchlistCheckTask;
use crate::task::ExecuteTask;
use crate::task::TaskError;
use crate::State;
use db::models::decision_intent::DecisionIntent;
use db::models::scoped_vault::ScopedVault;
use db::models::task::Task;
use db::models::user_timeline::UserTimeline;
use db::models::verification_request::{RequestAndMaybeResult, VerificationRequest};
use db::models::watchlist_check::WatchlistCheck;
use db::tests::fixtures;
use db::DbPool;
use db::DbResult;
use idv::idology::pa::{IdologyPaAPIResponse, IdologyPaRequest};
use newtypes::TaskId;
use newtypes::WatchlistCheckError;
use newtypes::{
    IdentityDataKind as IDK, OnboardingStatus, ScopedVaultId, WatchlistCheckArgs, WatchlistCheckStatusKind,
};
use std::sync::Arc;
use webhooks::events::WebhookEvent;
use webhooks::MockWebhookClient;

mod watchlist_check_task;

//
// Test Helpers
//

async fn create_user_and_task(
    db_pool: &DbPool,
    is_portable: bool,
    is_live: bool,
    onboarding_status: OnboardingStatus,
    idks: Vec<IDK>,
) -> (ScopedVault, Task) {
    let (sv, task) = db_pool
        .db_transaction(move |conn| -> DbResult<_> {
            let sv = if is_portable {
                let (_, _, sv, _) = crate::tests::fixtures::lib::create_user_and_onboarding(
                    conn,
                    is_live,
                    onboarding_status,
                    idks,
                );
                sv
            } else {
                let tenant = fixtures::tenant::create(conn);
                let (_uv, sv) = crate::tests::fixtures::lib::create_user_and_populate_vault(
                    conn, is_live, tenant.id, None, idks,
                );
                sv
            };

            let task = fixtures::task::create_watchlist_check(conn, &sv.id);
            Ok((sv, task))
        })
        .await
        .unwrap();

    (sv, task)
}

async fn run_task(state: &mut State, sv_id: &ScopedVaultId, task_id: &TaskId) -> Result<(), TaskError> {
    let wct = WatchlistCheckTask::new(state.clone(), task_id.clone());
    let args = WatchlistCheckArgs {
        scoped_vault_id: sv_id.clone(),
    };
    wct.execute(&args).await
}

async fn get_data(
    db_pool: &DbPool,
    svid: ScopedVaultId,
) -> (
    WatchlistCheck,
    Option<DecisionIntent>,
    Vec<RequestAndMaybeResult>,
    Option<UserTimeline>,
) {
    db_pool
        .db_query(move |conn| {
            let wc = WatchlistCheck::_get_by_svid(conn, &svid).unwrap();
            let ut = UserTimeline::get_by_event_data_id(conn, &svid, wc.id.to_string()).unwrap();

            let (di, vreqs) = if let Some(di_id) = wc.decision_intent_id.as_ref() {
                let di = DecisionIntent::get(conn, di_id).unwrap();
                let vreqs = VerificationRequest::list(conn, di_id).unwrap();
                (Some(di), vreqs)
            } else {
                (None, vec![])
            };

            (wc, di, vreqs, ut)
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

fn expect_webhook(state: &mut State, status: WatchlistCheckStatusKind, error: Option<WatchlistCheckError>) {
    let mut mock_webhook_client = MockWebhookClient::new();

    mock_webhook_client
        .expect_send_event_to_tenant()
        .withf(move |_, w, _| match w {
            WebhookEvent::WatchlistCheckCompleted(p) => p.status == status && p.error == error,
            _ => false,
        })
        .times(1)
        .return_once(|_, _, _| Ok(()));
    // allow another other kind of webhooks (ie incidental OnboardingStatusChanged/OnboardingStatusCompleted that our fixturing might cause)
    mock_webhook_client
        .expect_send_event_to_tenant()
        .withf(move |_, w, _| !matches!(w, WebhookEvent::WatchlistCheckCompleted(_p)))
        .returning(move |_, _, _| Ok(()));
    state.set_webhook_client(Arc::new(mock_webhook_client));
}

fn expect_no_webhook(state: &mut State) {
    let mut mock_webhook_client = MockWebhookClient::new();

    mock_webhook_client
        .expect_send_event_to_tenant_non_blocking()
        .never();
    mock_webhook_client.expect_send_event_to_tenant().never();

    state.set_webhook_client(Arc::new(mock_webhook_client));
}
