use crate::middesk::{
    response::{
        business::BusinessResponse,
        webhook::{BusinessData, MiddeskBusinessUpdateWebhookResponse},
    },
    MiddeskCreateBusinessResponse,
};
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
        phone_numers: None,
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

pub fn business_update_webhook(business_id: &str) -> serde_json::Value {
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
                phone_numers: None,
                industry_classification: None,
                liens: None,
                tags: None,
                fmcsa_registrations: None,
            }),
        }),
    };

    serde_json::to_value(&parsed_response).unwrap()
}
