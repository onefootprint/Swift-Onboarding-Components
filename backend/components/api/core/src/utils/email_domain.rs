use lazy_static::lazy_static;
use std::collections::HashSet;

const PUBLIC_EMAIL_LIST: &str = include_str!("public_email_domains.txt");

fn parse_email_list() -> HashSet<&'static str> {
    HashSet::from_iter(PUBLIC_EMAIL_LIST.split('\n').map(str::trim))
}

lazy_static! {
    /// a list of public known email domain suffixes
    pub static ref PUBLIC_EMAIL_DOMAINS: HashSet<&'static str> = parse_email_list();
}

/// parse a private email domain
pub fn parse_private_email_domain(email_address: &str) -> Option<String> {
    if email_address.split('@').count() != 2 {
        return None;
    }

    let host = url::Host::parse(email_address.split('@').nth(1)?)
        .ok()?
        .to_string();

    if PUBLIC_EMAIL_DOMAINS.contains(host.as_str()) || host.to_lowercase().ends_with(".edu") {
        return None;
    }

    Some(host)
}

#[cfg(test)]
mod tests {
    use super::parse_private_email_domain;
    use test_case::test_case;

    #[test_case("alex@onefootprint.com" => Some("onefootprint.com".to_string()))]
    #[test_case("josh@donotpay.com" => Some("donotpay.com".to_string()))]
    #[test_case("josh@alx@donotpay.com" => None)]
    #[test_case("alex@gmail.com" => None)]
    #[test_case("alex@outLook.com" => None)]
    #[test_case("alex@live.com" => None)]
    #[test_case("alex@mit.EDU" => None)]
    fn test_good_emails(email: &str) -> Option<String> {
        parse_private_email_domain(email)
    }
}
