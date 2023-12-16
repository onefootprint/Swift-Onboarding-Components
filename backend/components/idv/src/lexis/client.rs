use super::decode_response;
use crate::footprint_http_client::FootprintVendorHttpClient;
use crate::lexis::request::LexisRequest;
use crate::lexis::ReqwestError;
use newtypes::vendor_credentials::LexisCredentials;
use newtypes::IdvData;
use reqwest::header;
use std::time::Duration;

pub struct LexisFlexIdRequest {
    pub idv_data: IdvData,
    pub credentials: LexisCredentials,
}

pub async fn flex_id(
    fp_http_client: &FootprintVendorHttpClient,
    req: LexisFlexIdRequest,
) -> Result<serde_json::Value, crate::lexis::Error> {
    let LexisFlexIdRequest {
        idv_data,
        credentials,
    } = req;

    let url = "https://wsonline.seisint.com/WsIdentity/FlexID?ver_=3.12";
    let mut headers = header::HeaderMap::new();
    let header_val = format!(
        "Basic {}",
        base64::encode(format!("{}:{}", credentials.user_id.leak(), credentials.password.leak()).as_bytes())
    );
    headers.insert(
        "Authorization",
        header::HeaderValue::from_str(header_val.as_str())?,
    );

    let req = LexisRequest::new(idv_data)?;
    tracing::info!(req = format!("{:?}", req), "flex_id req");

    let response = fp_http_client
        .client
        .post(url.to_string())
        .headers(headers)
        .json(&req)
        .timeout(Duration::from_secs(5))
        .send()
        .await
        .map_err(|err| ReqwestError::ReqwestSendError(err.to_string()))?;

    let json_response = decode_response::<serde_json::Value>(response).await;

    match json_response {
        Ok(_) => {
            tracing::info!("flex_id success");
        }
        Err(ref err) => {
            tracing::error!(?err, "flex_id error");
        }
    }
    json_response
}

#[cfg(test)]
mod tests {
    use super::*;
    use dotenv;

    use newtypes::PiiString;
    use tracing_test::traced_test;

    #[ignore]
    #[traced_test]
    #[tokio::test]
    async fn test_client() {
        let client = FootprintVendorHttpClient::new().unwrap();
        let credentials = LexisCredentials {
            user_id: dotenv::var("LEXIS_TEST_USER_ID").unwrap().into(),
            password: dotenv::var("LEXIS_TEST_PASSWORD").unwrap().into(),
        };

        let idv_data = IdvData {
            first_name: Some(PiiString::from("NICHOLAS")),
            last_name: Some(PiiString::from("BOGGAN")),
            address_line1: Some(PiiString::from("100 east street")),
            address_line2: None,
            city: Some(PiiString::from("anytown")),
            state: Some(PiiString::from("CA")),
            country: Some(PiiString::from("US")),
            zip: Some(PiiString::from("94121")),
            ssn4: None,
            ssn9: Some(PiiString::from("486639975")),
            dob: Some(PiiString::from("1975-04-02")),
            email: None,
            phone_number: Some(PiiString::from("1085551212")),
            ..Default::default()
        };

        let res = flex_id(
            &client,
            LexisFlexIdRequest {
                idv_data,
                credentials,
            },
        )
        .await
        .unwrap();
        println!("res: {}", serde_json::to_string_pretty(&res).unwrap());
        // let parsed_res = crate::lexis::parse_response(res).unwrap();
        // println!("parsed_res: {:?}", parsed_res);
    }
}
