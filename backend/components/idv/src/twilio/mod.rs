use itertools::Itertools;
use levenshtein::levenshtein;
use newtypes::{AuditTrailEvent, IdvData, SignalScope, Vendor, VerificationInfo};

use crate::IdvResponse;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Phone number must be provided")]
    PhoneNumberNotPopulated,
    #[error("Twilio client error: {0}")]
    Twilio(#[from] twilio::error::Error),
    #[error("Json error: {0}")]
    JsonError(#[from] serde_json::Error),
}

pub async fn lookup_v2(client: &twilio::Client, idv_data: IdvData) -> Result<IdvResponse, Error> {
    let phone_number = if let Some(ref phone_number) = idv_data.phone_number {
        phone_number
    } else {
        return Err(Error::PhoneNumberNotPopulated);
    };
    let mut response = client.lookup_v2(phone_number.leak()).await?;

    let name_str_distance = if let Some((caller_name, name)) = response
        .caller_name
        .as_ref()
        .and_then(|x| x.caller_name.as_ref())
        .and_then(|caller_name| idv_data.name().map(|name| (caller_name, name)))
    {
        smart_name_distance(caller_name.leak(), name.as_str())
    } else {
        None
    };
    response.name_str_distance = name_str_distance;

    let raw_response = serde_json::value::to_value(response)?;

    // TODO read response from twilio
    let audit_events = vec![AuditTrailEvent::Verification(VerificationInfo {
        attributes: vec![SignalScope::PhoneNumber],
        vendor: Vendor::Twilio,
        status: newtypes::VerificationInfoStatus::Verified,
    })];
    Ok(IdvResponse {
        status: None,
        audit_events,
        raw_response,
    })
}

fn smart_name_distance(name1: &str, name2: &str) -> Option<usize> {
    let clean_and_split = |s: &str| -> Vec<String> {
        let s = s.trim().to_uppercase();
        s.split(' ')
            .map(|x| x.chars().filter(|c| c.is_alphanumeric()).collect::<String>())
            .collect()
    };
    let name1_parts = clean_and_split(name1);
    let name2_parts = clean_and_split(name2);

    if name1_parts.len() < 2 || name2_parts.len() < 2 {
        return None;
    }

    // Where N is the number of words in name1, select all length-N permutations of name2_parts.
    // Choose the permutation that yields the smallest levenshtein difference.
    // This has a few benefits:
    // - We ignore differences in the ordering of names
    // - We remove extra names from name2, like a middle name
    name2_parts
        .into_iter()
        .permutations(name1_parts.len())
        .map(|name2_parts| {
            // Calculate the sum of levenshtein difference between parts of name1 and name2 zipped
            name2_parts
                .iter()
                .zip(name1_parts.iter())
                .map(|(x, y)| levenshtein(x, y))
                .sum()
        })
        .min()
}

#[cfg(test)]
mod tests {
    use test_case::test_case;

    use super::smart_name_distance;

    #[test_case("elliott forde", "ElLioTt ForDe" => Some(0))]
    #[test_case("elliott forde", "FORDE, ELLIOTT" => Some(0))]
    #[test_case("elliott forde", "FORDE ELLIOT" => Some(1))]
    #[test_case("elliott forde", "FORDE ELLIOTT VETLE" => Some(0))]
    #[test_case("forde elliott", "ELLIOTT FORDE VETLE" => Some(0))]
    #[test_case("elliott forde", "CONRAD FORDE" => Some(7))]
    #[test_case("elliott", "elliott forde" => None)]
    #[test_case("elliott forde", "elliott" => None)]
    #[test_case("elliott forde", "" => None)]
    fn test_good_emails(name1: &str, name2: &str) -> Option<usize> {
        smart_name_distance(name1, name2)
    }
}
