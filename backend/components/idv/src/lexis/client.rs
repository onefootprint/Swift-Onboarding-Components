use super::response::FlexIdResponse;
use crate::footprint_http_client::FootprintVendorHttpClient;
use crate::lexis::request::LexisRequest;
use crate::lexis::ReqwestError;
use crate::lexis::{
    self,
};
use newtypes::vendor_credentials::LexisCredentials;
use newtypes::IdvData;
use newtypes::PiiJsonValue;
use newtypes::TenantBusinessInfo;
use reqwest::header;
use std::time::Duration;

pub struct LexisFlexIdRequest {
    pub idv_data: IdvData,
    pub credentials: LexisCredentials,
    pub tenant_identifier: String,
    pub tbi: TenantBusinessInfo,
}

#[derive(Clone)]
pub struct LexisFlexIdResponse {
    pub raw_response: PiiJsonValue,
    pub parsed_response: FlexIdResponse,
}

pub async fn flex_id(
    fp_http_client: &FootprintVendorHttpClient,
    req: LexisFlexIdRequest,
) -> Result<serde_json::Value, lexis::Error> {
    let LexisFlexIdRequest {
        idv_data,
        credentials,
        tenant_identifier,
        tbi,
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

    let req = LexisRequest::new(idv_data, tenant_identifier, tbi)?;
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
    let response = response
        .json::<serde_json::Value>()
        .await
        .map_err(lexis::Error::from)?;
    Ok(response)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::footprint_http_client::FpVendorClientArgs;
    use dotenv;
    use newtypes::PiiString;
    use tracing_test::traced_test;

    #[ignore]
    #[traced_test]
    #[tokio::test]
    async fn test_client() {
        let client = FootprintVendorHttpClient::new(FpVendorClientArgs::default()).unwrap();
        let credentials = LexisCredentials {
            user_id: dotenv::var("LEXIS_TEST_USER_ID").unwrap().into(),
            password: dotenv::var("LEXIS_TEST_PASSWORD").unwrap().into(),
        };

        let tbi = TenantBusinessInfo {
            // TODO: put these in .env? seems better than plaintexting it here even though its not super duper
            // sensitive
            company_name: PiiString::from(""),
            address_line1: PiiString::from(""),
            city: PiiString::from(""),
            state: PiiString::from(""),
            zip: PiiString::from(""),
            phone: PiiString::from(""),
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
            phone_number: Some(PiiString::from("+15085551212")),
            ..Default::default()
        };

        let res = flex_id(
            &client,
            LexisFlexIdRequest {
                idv_data,
                credentials,
                tenant_identifier: "test".to_owned(),
                tbi,
            },
        )
        .await
        .unwrap();
        println!("res: {}", serde_json::to_string_pretty(&res).unwrap());
        // let parsed_res = crate::lexis::parse_response(res).unwrap();
        // println!("parsed_res: {:?}", parsed_res);
    }
}
