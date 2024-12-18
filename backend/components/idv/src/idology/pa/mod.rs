use self::response::PaResponse;
use crate::idology::error::Error as IdologyError;
use newtypes::vendor_credentials::IdologyCredentials;
use newtypes::IdvData;
use newtypes::PiiJsonValue;

pub(super) mod request;
pub mod response;

pub struct IdologyPaRequest {
    pub idv_data: IdvData,
    pub credentials: IdologyCredentials,
    pub tenant_identifier: String,
}

pub struct IdologyPaAPIResponse {
    pub raw_response: PiiJsonValue,
    pub result: Result<PaResponse, IdologyError>,
}

impl IdologyPaAPIResponse {
    pub fn from_response(raw_response: PiiJsonValue) -> Self {
        let result = || {
            let parsed_response = crate::idology::pa::response::parse_response(raw_response.leak().clone())?;
            parsed_response.response.validate()?;
            Ok(parsed_response)
        };
        let result = result();
        Self { result, raw_response }
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::footprint_http_client::FootprintVendorHttpClient;
    use crate::footprint_http_client::FpVendorClientArgs;
    use crate::idology::expectid::response::Restriction;
    use crate::idology::fixtures;
    use crate::idology::standalone_pa;
    use newtypes::IdvData;
    use newtypes::PiiString;

    #[ignore]
    #[tokio::test]
    async fn test_standalone_pa() {
        let test_data = fixtures::test_data::ExpectIDTestData::load_passing_sandbox_data();

        let client = FootprintVendorHttpClient::new(FpVendorClientArgs::default()).unwrap();

        let idv_data = IdvData {
            first_name: Some(PiiString::from(test_data.first_name.clone())),
            last_name: Some(PiiString::from(test_data.last_name.clone())),
            address_line1: Some(PiiString::from(test_data.address_line_1.clone())),
            zip: Some(PiiString::from(test_data.zip.clone())),
            ..Default::default()
        };
        let credentials = IdologyCredentials {
            username: test_data.username.clone(),
            password: test_data.password.clone(),
        };

        let res = standalone_pa(
            &client,
            IdologyPaRequest {
                idv_data,
                credentials,
                tenant_identifier: "org1234".into(),
            },
        )
        .await
        .unwrap();
        let parsed_response = response::parse_response(res.into_leak()).unwrap();
        assert_eq!(
            Restriction {
                key: Some("global.watch.list.no.match".to_owned()),
                message: Some("Patriot Act - No Match".to_owned()),
                pa: None
            },
            parsed_response.response.restriction.unwrap()
        );
    }
}
