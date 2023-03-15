pub(super) mod request;
pub mod response;

#[cfg(test)]
mod test {
    use newtypes::{IdvData, PiiString};

    use crate::idology::{client::IdologyClient, expectid::response::Restriction, fixtures};

    use super::{
        *,
    };

    #[ignore]
    #[tokio::test]
    async fn test_standalone_pa() {
        let test_data = fixtures::test_data::ExpectIDTestData::load_passing_sandbox_data();
        let username = test_data.username.clone();
        let password = test_data.password.clone();

        let client = IdologyClient::new(username, password).unwrap();

        let idv_data = IdvData {
            first_name: Some(PiiString::from(test_data.first_name.clone())),
            last_name: Some(PiiString::from(test_data.last_name.clone())),
            address_line1: Some(PiiString::from(test_data.address_line_1.clone())),
            zip: Some(PiiString::from(test_data.zip.clone())),
            ..Default::default()
        };

        let res = client.standalone_pa(idv_data).await.unwrap();
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
