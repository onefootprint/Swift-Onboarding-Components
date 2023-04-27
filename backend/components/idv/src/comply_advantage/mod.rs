use newtypes::{vendor_credentials::ComplyAdvantageCredentials, IdvData};
use reqwest::header;

use crate::footprint_http_client::FootprintVendorHttpClient;

use self::request::{ComplyAdvantageSearch, SearchFilters, SearchTerm};

pub mod error;
pub mod request;
pub mod response;

pub struct ComplyAdvantageRequest {
    pub idv_data: IdvData,
    pub credentials: ComplyAdvantageCredentials,
}

pub async fn make_comply_advantage_search(
    footprint_http_client: &FootprintVendorHttpClient,
    request: ComplyAdvantageRequest,
    search_filters: Option<SearchFilters>,
) -> Result<serde_json::Value, error::Error> {
    let url = "https://api.us.complyadvantage.com/searches";

    let req = ComplyAdvantageSearch {
        search_term: SearchTerm::try_from(&request.idv_data)?,
        // TODO
        fuzziness: 0.8,
        // TODO
        filters: search_filters,
        // TODO
        limit: 2,
    };

    let mut headers = header::HeaderMap::new();
    headers.insert(
        "Authorization",
        header::HeaderValue::from_str(format!("Token {}", request.credentials.api_key.leak()).as_str())?,
    );
    headers.insert("Content-Type", header::HeaderValue::from_str("application/json")?);

    let res = footprint_http_client
        .client
        .post(url)
        .headers(headers)
        .json(&req)
        .send()
        .await?;

    Ok(res.json().await?)
}

#[cfg(test)]
mod tests {
    use newtypes::{vendor_credentials::ComplyAdvantageCredentials, IdvData, PiiString};

    use crate::footprint_http_client::FootprintVendorHttpClient;

    use super::{make_comply_advantage_search, ComplyAdvantageRequest};

    fn load_api_key() -> PiiString {
        PiiString::from(dotenv::var("COMPLY_ADVANTAGE_SANDBOX_API_KEY").unwrap())
    }
    #[ignore]
    #[tokio::test]
    async fn test_ca_search() {
        let client = FootprintVendorHttpClient::new().unwrap();
        let idv_data = IdvData {
            first_name: Some(PiiString::from("bob")),
            last_name: Some(PiiString::from("boberto")),
            ..Default::default()
        };
        let ca_request = ComplyAdvantageRequest {
            idv_data,
            credentials: ComplyAdvantageCredentials {
                api_key: load_api_key(),
            },
        };

        let res = make_comply_advantage_search(&client, ca_request, None)
            .await
            .unwrap();

        println!("{}", res)
    }
}
