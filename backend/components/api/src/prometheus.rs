use std::collections::HashMap;

use actix_web_prom::{PrometheusMetrics, PrometheusMetricsBuilder};

use crate::config::Config;

pub fn init(config: &Config) -> PrometheusMetrics {
    let labels = HashMap::from_iter([
        ("server_version".to_string(), crate::GIT_HASH.to_string()),
        (
            "environment".to_string(),
            config.service_config.environment.clone(),
        ),
    ]);
    let prometheus = PrometheusMetricsBuilder::new("api")
        // TODO gate /metrics endpoint so it can only be hit locally
        .endpoint("/metrics")
        .const_labels(labels)
        .build()
        .expect("Failed to initialize prometheus client");
    prometheus
}
