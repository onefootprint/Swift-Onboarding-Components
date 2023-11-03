use opentelemetry::metrics::UpDownCounter;

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
