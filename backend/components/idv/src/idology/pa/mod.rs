use newtypes::{vendor_credentials::IdologyCredentials, IdvData, PiiJsonValue};

use self::response::PaResponse;

pub(super) mod request;
pub mod response;

pub struct IdologyPaRequest {
    pub idv_data: IdvData,
    pub credentials: IdologyCredentials,
    pub tenant_identifier: String,
}

#[derive(Clone)]
pub struct IdologyPaAPIResponse {
    pub raw_response: PiiJsonValue,
    pub parsed_response: PaResponse,
}

#[cfg(test)]
mod test {
    use newtypes::{IdvData, PiiString};

    use crate::{
        footprint_http_client::FootprintVendorHttpClient,
        idology::{expectid::response::Restriction, fixtures, standalone_pa},
    };

    use super::*;

    #[ignore]
    #[tokio::test]
    async fn test_standalone_pa() {
        let test_data = fixtures::test_data::ExpectIDTestData::load_passing_sandbox_data();

        let client = FootprintVendorHttpClient::new().unwrap();

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
        let parsed_response = response::parse_response(res).unwrap();
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
