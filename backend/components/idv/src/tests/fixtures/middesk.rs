use crate::middesk::response::business::BusinessResponse;
use crate::middesk::response::business::Formation;
use crate::middesk::response::business::Review;
use crate::middesk::response::business::Task;
use crate::middesk::response::webhook::BusinessData;
use crate::middesk::response::webhook::MiddeskBusinessUpdateWebhookResponse;
use crate::middesk::MiddeskCreateBusinessResponse;
use newtypes::PiiJsonValue;

pub fn create_business_response(business_id: &str) -> MiddeskCreateBusinessResponse {
    let parsed_response = BusinessResponse {
        object: None,
        id: Some(business_id.to_owned()),
        external_id: None,
        name: None,
        created_at: None,
        updated_at: None,
        status: None,
        tin: None,
        formation: None,
        registrations: None,
        names: None,
        addresses: None,
        review: None,
        website: None,
        watchlist: None,
        people: None,
        profiles: None,
        policy_results: None,
        documents: None,
        subscription: None,
        bankruptcies: None,
        phone_numbers: None,
        industry_classification: None,
        liens: None,
        tags: None,
        fmcsa_registrations: None,
    };

    MiddeskCreateBusinessResponse {
        raw_response: PiiJsonValue::from(serde_json::to_value(&parsed_response).unwrap()),
        parsed_response,
    }
}

pub fn business_update_webhook(business_id: &str, watchlist_hit: bool) -> serde_json::Value {
    let mut tasks = vec![
        Task {
            key: Some("name".to_owned()),
            category: Some("name".to_owned()),
            label: Some("Business Name".to_owned()),
            sub_label: Some("Verified".to_owned()),
            status: Some("success".to_owned()),
            message: Some("Match identified to the submitted Business Name".to_owned()),
            name: Some("name".to_owned()),
            sources: None,
        },
        Task {
            key: Some("address_verification".to_owned()),
            category: Some("address".to_owned()),
            label: Some("Office Address".to_owned()),
            sub_label: Some("Verified".to_owned()),
            status: Some("success".to_owned()),
            message: Some("Match identified to the submitted Office Address".to_owned()),
            name: Some("address".to_owned()),
            sources: None,
        },
        Task {
            key: Some("tin".to_owned()),
            category: Some("tin".to_owned()),
            label: Some("TIN Match".to_owned()),
            sub_label: Some("Found".to_owned()),
            status: Some("success".to_owned()),
            message: Some(
                "The IRS has a record for the submitted TIN and Business Name combination".to_owned(),
            ),
            name: Some("tin".to_owned()),
            sources: None,
        },
    ];

    if watchlist_hit {
        tasks.push(Task {
            key: Some("watchlist".to_owned()),
            category: Some("watchlist".to_owned()),
            label: Some("Watchlist".to_owned()),
            sub_label: Some("Hits".to_owned()),
            status: Some("failure".to_owned()),
            message: Some("Hits found".to_owned()),
            name: Some("watchlist".to_owned()),
            sources: None,
        });
    }

    let parsed_response = MiddeskBusinessUpdateWebhookResponse {
        object: None,
        id: None,
        account_id: None,
        type_: Some("business.updated".to_owned()),
        created_at: None,
        data: Some(BusinessData {
            object: Some(BusinessResponse {
                object: None,
                id: Some(business_id.to_owned()),
                external_id: None,
                name: None,
                created_at: None,
                updated_at: None,
                status: None,
                tin: None,
                formation: Some(Formation {
                    entity_type: None,
                    formation_date: Some("2022-02-02".to_string()),
                    formation_state: Some("NY".to_string()),
                    created_at: None,
                    updated_at: None,
                }),
                registrations: None,
                names: None,
                addresses: None,
                review: Some(Review {
                    created_at: None,
                    updated_at: None,
                    completed_at: None,
                    tasks: Some(tasks),
                    assignee: None,
                }),
                website: None,
                watchlist: None,
                people: None,
                profiles: None,
                policy_results: None,
                documents: None,
                subscription: None,
                bankruptcies: None,
                phone_numbers: None,
                industry_classification: None,
                liens: None,
                tags: None,
                fmcsa_registrations: None,
            }),
        }),
    };

    serde_json::to_value(&parsed_response).unwrap()
}
