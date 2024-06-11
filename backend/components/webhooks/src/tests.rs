use crate::events::*;
use chrono::Utc;
use newtypes::{
    FpId,
    ObConfigurationKey,
    OnboardingStatus,
};
use schemars::gen::SchemaSettings;
use std::collections::HashMap;
use strum::{
    EnumMessage,
    IntoEnumIterator,
};

#[test]
fn test_raw() {
    let evt = WebhookEvent::OnboardingCompleted(OnboardingCompletedPayload {
        event_kind: WebhookEventKind::OnboardingCompleted,
        fp_id: FpId::from("test".to_string()),
        timestamp: Utc::now(),
        status: OnboardingStatus::Pass,
        playbook_key: ObConfigurationKey::test_data("pb_test_QoEYTOve49Q2IAmaKVYnPs".into()),
        requires_manual_review: false,
        is_live: false,
    });

    assert_eq!(evt.event_type().as_str(), "footprint.onboarding.completed");
}

#[test]
#[ignore]
fn generate_event_type_schema() {
    for evt in WebhookEventKind::iter() {
        match evt {
            WebhookEventKind::OnboardingCompleted => generate::<OnboardingCompletedPayload>(evt),
            WebhookEventKind::OnboardingStatusChanged => generate::<OnboardingStatusChangedPayload>(evt),
            WebhookEventKind::WatchlistCheckCompleted => generate::<WatchlistCheckCompletedPayload>(evt),
        }
    }
}

fn generate<T: schemars::JsonSchema>(evt: WebhookEventKind) {
    let generator = schemars::gen::SchemaGenerator::new(SchemaSettings::draft07());
    let schema = generator.into_root_schema_for::<T>();
    export_type_schema(schema, evt.to_string().as_ref());
}

fn generate_json_value<T: schemars::JsonSchema>() -> serde_json::Value {
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

    for evt in WebhookEventKind::iter() {
        let description = evt.get_message().unwrap_or("").to_string();
        let schema = match evt {
            WebhookEventKind::OnboardingCompleted => generate_json_value::<OnboardingCompletedPayload>(),
            WebhookEventKind::OnboardingStatusChanged => {
                generate_json_value::<OnboardingStatusChangedPayload>()
            }
            WebhookEventKind::WatchlistCheckCompleted => {
                generate_json_value::<WatchlistCheckCompletedPayload>()
            }
        };

        let schemas = HashMap::from_iter([("1".to_string(), schema)]);
        let result = client.event_type().get(evt.to_string()).await;
        match &result {
            Ok(_) => {
                client
                    .event_type()
                    .update(
                        evt.to_string(),
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
                eprintln!("Updated schema for: {}", evt);
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
                                name: evt.to_string(),
                                schemas: Some(schemas),
                            },
                            None,
                        )
                        .await
                        .expect("failed to create");
                    eprintln!("Created schema for: {}", evt);
                    continue;
                }
            }
            _ => {}
        }

        let _ = result.unwrap_or_else(|_| panic!("Failed to sync webhook event type: {}", evt));
    }
}
