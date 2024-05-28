use std::collections::HashMap;

use crate::events::*;
use chrono::Utc;
use newtypes::{FpId, OnboardingStatus};
use schemars::gen::SchemaSettings;
use strum::{EnumMessage, IntoEnumIterator};

#[test]
fn test_raw() {
    let evt = WebhookEvent::OnboardingCompleted(OnboardingCompletedPayload {
        fp_id: FpId::from("test".to_string()),
        timestamp: Utc::now(),
        status: OnboardingStatus::Pass,
        requires_manual_review: false,
        is_live: false,
    });

    assert_eq!(evt.event_type().as_str(), "footprint.onboarding.completed");
}

/// NOTE: For now we manually run this test to generate schemas and synchronize them to SVIX
/// but in the future we should push this automatically via CI
#[test]
#[ignore]
fn generate_event_type_schema() {
    for evt in WebhookEvent::iter() {
        let name = evt.event_type();
        match evt {
            WebhookEvent::OnboardingCompleted(p) => generate(&name, p),
            WebhookEvent::OnboardingStatusChanged(p) => generate(&name, p),
            WebhookEvent::WatchlistCheckCompleted(p) => generate(&name, p),
        }
    }
}

fn generate<T: schemars::JsonSchema>(name: &str, _t: T) {
    let generator = schemars::gen::SchemaGenerator::new(SchemaSettings::draft07());
    let schema = generator.into_root_schema_for::<T>();
    export_type_schema(schema, name);
}

fn generate_json_value<T: schemars::JsonSchema>(_t: T) -> serde_json::Value {
    let generator = schemars::gen::SchemaGenerator::new(SchemaSettings::draft07());
    let schema = generator.into_root_schema_for::<T>();
    serde_json::to_value(&schema).expect("serialize schema")
}

fn export_type_schema(schema: schemars::schema::RootSchema, name: &str) {
    const SCHEMAS_DIR: &str = "generated/schemas";

    let output = serde_json::to_string_pretty(&schema).expect("json serialize error");
    std::fs::create_dir_all(SCHEMAS_DIR).expect("failed to create dir");
    let file = format!("{SCHEMAS_DIR}/{name}.json");
    std::fs::write(file, output).expect("write schema file error");
}

#[tokio::test]
#[ignore]
async fn sync_webhook_event_types() {
    let auth_token = std::env::var("SVIX_AUTH_TOKEN").expect("missing SVIX_AUTH_TOKEN env");
    let client = svix::api::Svix::new(auth_token, None);

    for evt in WebhookEvent::iter() {
        let name = evt.event_type();
        let description = evt.get_message().unwrap_or("").to_string();
        let schema = match evt {
            WebhookEvent::OnboardingCompleted(p) => generate_json_value(p),
            WebhookEvent::OnboardingStatusChanged(p) => generate_json_value(p),
            WebhookEvent::WatchlistCheckCompleted(p) => generate_json_value(p),
        };

        let schemas = HashMap::from_iter([("1".to_string(), schema)]);
        let result = client.event_type().get(name.clone()).await;
        match &result {
            Ok(_) => {
                client
                    .event_type()
                    .update(
                        name.clone(),
                        svix::api::EventTypeUpdate {
                            archived: None,
                            feature_flag: None,
                            description,
                            schemas: Some(schemas),
                        },
                        None,
                    )
                    .await
                    .expect("failed to update");
                eprintln!("Updated schema for: {}", name);
                continue;
            }
            Err(svix::error::Error::Http(err)) => {
                if err.status == 404 {
                    client
                        .event_type()
                        .create(
                            svix::api::EventTypeIn {
                                archived: None,
                                feature_flag: None,
                                description,
                                name: name.clone(),
                                schemas: Some(schemas),
                            },
                            None,
                        )
                        .await
                        .expect("failed to create");
                    eprintln!("Created schema for: {}", &name);
                    continue;
                }
            }
            _ => {}
        }

        let _ = result.unwrap_or_else(|_| panic!("Failed to sync webhook event type: {}", name));
    }
}
