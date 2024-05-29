use self::lookup::LookupV2Response;
use crate::error::Error;
use serde::de::DeserializeOwned;

pub mod lookup;
pub mod message;

pub type Result<T> = std::result::Result<T, Error>;

pub async fn decode_response<T: DeserializeOwned>(response: reqwest::Response) -> crate::response::Result<T> {
    if response.status().is_success() {
        Ok(response.json().await?)
    } else {
        Err(Error::Api(response.json().await?))
    }
}

// Given a raw response, deserialize
pub fn parse_response(value: serde_json::Value) -> std::result::Result<LookupV2Response, super::Error> {
    let response: LookupV2Response = serde_json::value::from_value(value)?;
    Ok(response)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::Value;

    #[test]
    fn test_parse_response() -> std::result::Result<(), serde_json::Error> {
        let resp: Value = twilio_api_response();
        parse_response(resp).unwrap();

        Ok(())
    }

    // fn so we could potentially test various add-ons separately
    // This API response copied from twilio docs
    fn twilio_api_response() -> serde_json::Value {
        let res = serde_json::json!({
          "country_code": "GB",
          "phone_number": "+447772000001",
          "national_format": "07772 000001",
          "valid": true,
          "validation_errors": null,
          "caller_name": {
              "caller_name": "Sergio Suarez",
              "caller_type": "CONSUMER",
              "error_code": null
            },
          "sim_swap": {
            "last_sim_swap": {
              "last_sim_swap_date": "2020-04-27T10:18:50Z",
              "swapped_period": "PT15282H33M44S",
              "swapped_in_period": true
            },
            "carrier_name": "Vodafone UK",
            "mobile_country_code": "276",
            "mobile_network_code": "02",
            "error_code": null
          },
          "call_forwarding": {
              "call_forwarding_status": "true",
              "carrier_name": "Vodafone UK",
              "mobile_country_code": "276",
              "mobile_network_code": "02",
              "error_code": null
            },
            "live_activity": {
              "connectivity": "connected",
              "original_carrier": {
                "name": "Vodafone",
                "mobile_country_code": "234",
                "mobile_network_code": "15"
              },
              "ported": "false",
              "ported_carrier": null,
              "roaming": "false",
              "roaming_carrier": null,
              "error_code": null
            },
          "line_type_intelligence": null,
          "url": "https://lookups.twilio.com/v2/PhoneNumbers/+447772000001"}
        );

        res
    }
}
