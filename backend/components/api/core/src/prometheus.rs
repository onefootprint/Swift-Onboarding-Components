use std::collections::HashMap;

use actix_web_prom::{PrometheusMetrics, PrometheusMetricsBuilder};
use gethostname::gethostname;

use crate::config::Config;

#[allow(clippy::expect_used)]
pub fn init(config: &Config) -> PrometheusMetrics {
    let labels = HashMap::from_iter([
        ("server_version".to_string(), crate::GIT_HASH.to_string()),
        (
            "environment".to_string(),
            config.service_config.environment.clone(),
        ),
        (
            "host".to_string(),
            gethostname().into_string().expect("Cannot extract host name"),
        ),
    ]);

    PrometheusMetricsBuilder::new("api")
        .endpoint(&format!("/{}", &config.service_config.metrics_endpoint_path))
        .const_labels(labels)
        .build()
        .expect("Failed to initialize prometheus client")
}
