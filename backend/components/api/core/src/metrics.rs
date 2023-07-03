#![allow(clippy::expect_used)]
use lazy_static::lazy_static;
use opentelemetry::metrics::UpDownCounter;
use prometheus::{
    opts, register_histogram, register_int_counter, Histogram, IntCounter, IntCounterVec, Registry,
};

lazy_static! {
    pub static ref GET_STATUS_COUNTER: IntCounter = register_int_counter!(
        "get_status_counter",
        "Dummy counter that counts the number of times GET /status is hit"
    )
    .expect("failed to make metric");
    pub static ref IDOLOGY_EXPECT_ID_SUCCESS: IntCounterVec = IntCounterVec::new(
        opts!(
            "idology_expect_id_success",
            "Count of successful API calls to Idology's Expect ID endpoint"
        ),
        &["results", "summary_result"]
    )
    .expect("Can't create a metric");
    pub static ref IDOLOGY_EXPECT_ID_ERROR: IntCounterVec = IntCounterVec::new(
        opts!(
            "idology_expect_id_error",
            "Count of erroring API calls to Idology's Expect ID endpoint"
        ),
        &["error"]
    )
    .expect("Can't create a metric");
    pub static ref SOCURE_SIGMA_FRAUD_SCORE: Histogram = register_histogram!(
        "socure_sigma_fraud_score",
        "Sigma Fraud scores from Socure's ID+ API responses",
        vec![0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    )
    .expect("Can't create a metric");
    pub static ref DECISION_ENGINE_ONBOARDING_DECISION: IntCounterVec = IntCounterVec::new(
        opts!(
            "decision_engine_onboarding_decision",
            "Count of onboarding decisions made by the Decision Engine"
        ),
        &["status"]
    )
    .expect("Can't create a metric");
}

/// NOTE: this is DEPRECATED. Use the otel exporter defined in the `Metrics` struct below.
/// This will be available on `state` in all HTTP requests
pub fn deprecated_register_all_metrics(registry: &Registry) -> Result<(), prometheus::Error> {
    registry.register(Box::new(GET_STATUS_COUNTER.clone()))?;
    registry.register(Box::new(IDOLOGY_EXPECT_ID_SUCCESS.clone()))?;
    registry.register(Box::new(IDOLOGY_EXPECT_ID_ERROR.clone()))?;
    registry.register(Box::new(SOCURE_SIGMA_FRAUD_SCORE.clone()))?;
    registry.register(Box::new(DECISION_ENGINE_ONBOARDING_DECISION.clone()))?;

    Ok(())
}

#[derive(Debug, Clone)]
pub struct Metrics {
    pub get_status_counter: UpDownCounter<i64>,
}

/// Registers all otel metrics that we'll use throughout the app.
/// The instance of `Metrics` returned here will be available on `State` in all HTTP requests
pub fn init() -> Metrics {
    let meter = opentelemetry::global::meter("fpc");
    let get_status_counter = meter
        .i64_up_down_counter("get_status_counter")
        .with_description("Dummy counter that counts the number of times GET /status is hit")
        .init();
    Metrics { get_status_counter }
}
