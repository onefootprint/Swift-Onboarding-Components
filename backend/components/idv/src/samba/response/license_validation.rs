use newtypes::{
    PiiString,
    SambaReportId,
};
use serde::{
    Deserialize,
    Serialize,
};
use std::str::FromStr;
use strum_macros::EnumString;

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateLVOrderResponse {
    pub order_id: PiiString,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CheckLVOrderStatus {
    pub order_id: String,
    pub order_status: String,
    pub control_number: Option<serde_json::Value>,
    pub order_date_time: Option<serde_json::Value>,
    pub order_completed_date_time: Option<serde_json::Value>,
    pub links: OrderStatusLinks,
}

impl CheckLVOrderStatus {
    pub fn report_id(&self) -> Option<SambaReportId> {
        // would we have more reports here?
        self.links
            .get_link(SambaLinkType::LicenseReports)
            .map(|l| l.report_id.into())
    }
}

#[derive(EnumString, PartialEq, Eq)]
pub enum SambaLinkType {
    #[strum(serialize = "order")]
    Order,
    #[strum(serialize = "activityhistory")]
    ActivityHistory,
    #[strum(serialize = "licensevalidation")]
    LicenseValidation,
    #[strum(serialize = "licensereports")]
    LicenseReports,
}
#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct OrderStatusLinks(pub Vec<OrderStatusLink>);
impl OrderStatusLinks {
    pub fn get_link(&self, link_type: SambaLinkType) -> Option<OrderStatusLink> {
        self.0
            .iter()
            .find(|osl| {
                let link = osl.rel.clone();
                SambaLinkType::from_str(link.as_str())
                    .map(|l| l == link_type)
                    .unwrap_or(false)
            })
            .cloned()
    }
}

#[derive(Deserialize, Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct OrderStatusLink {
    pub rel: String,
    pub href: String,
    #[serde(rename = "type")]
    pub http_method: String,
    #[serde(rename = "id")]
    pub report_id: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct GetLVOrderResponse {
    pub record: Record,
}

impl GetLVOrderResponse {
    pub fn valid(&self) -> bool {
        matches!(&self.record.dl_record.result.valid, &SambaValid::Yes)
    }

    pub fn license_validation(&self) -> Option<LicenseValidation> {
        self.record.dl_record.license_validation.clone()
    }
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct Record {
    pub dl_record: DlRecord,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct DlRecord {
    pub criteria: Option<serde_json::Value>,
    pub result: Result,
    pub license_validation: Option<LicenseValidation>,
    pub driver: Option<serde_json::Value>,
    pub current_license: Option<serde_json::Value>,
}

#[derive(Deserialize, Serialize, PartialEq, Eq)]
pub enum SambaValid {
    #[serde(rename = "Y")]
    Yes,
    #[serde(rename = "N")]
    No,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct Result {
    // will be `No` if no driver found.
    // Unclear the other reasons for being Y/N
    pub valid: SambaValid,

    // TODO: enum???
    pub error_code: Option<String>,
    pub error_description: Option<String>,
    // I think this stuff is a bunch of internal samba things (what they told me)
    pub control: Option<serde_json::Value>,
    pub returned_date: Option<serde_json::Value>,
    pub returned_time: Option<serde_json::Value>,
    pub reklami_error_code: Option<serde_json::Value>,
    pub result_code: Option<serde_json::Value>,
    pub designation: Option<serde_json::Value>,
}

#[derive(Deserialize, Serialize, Clone, Copy)]
pub enum SambaBoolean {
    #[serde(rename = "TRUE")]
    True,
    #[serde(rename = "FALSE")]
    False,
}

impl SambaBoolean {
    pub fn as_bool(&self) -> bool {
        matches!(self, Self::True)
    }
}
#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "PascalCase")]
pub struct LicenseValidation {
    // Overall composite status of the validation
    // Based on the constituent bools here + the configuration in the samba dashboard for which fields to
    // include in the calculation
    pub document_validation_result: String,
    pub driver_license_number_match: SambaBoolean,
    pub birth_date_match: Option<SambaBoolean>,
    pub last_name_exact_match: Option<SambaBoolean>,
    pub last_name_fuzzy_prim_match: Option<SambaBoolean>,
    pub last_name_fuzzy_alt_match: Option<SambaBoolean>,
    pub first_name_exact_match: Option<SambaBoolean>,
    pub first_name_fuzzy_prim_match: Option<SambaBoolean>,
    pub first_name_fuzzy_alt_match: Option<SambaBoolean>,
    pub middle_name_exact_match: Option<SambaBoolean>,
    pub middle_name_fuzzy_prim_match: Option<SambaBoolean>,
    pub middle_name_fuzzy_alt_match: Option<SambaBoolean>,
    pub middle_name_initial_match: Option<SambaBoolean>,
    pub name_sufix_match: Option<SambaBoolean>,
    pub document_category_match: Option<SambaBoolean>,
    pub issue_date_match: Option<SambaBoolean>,
    pub expiry_date_match: Option<SambaBoolean>,
    pub sex_match: Option<SambaBoolean>,
    pub height_match: Option<SambaBoolean>,
    pub weight_match: Option<SambaBoolean>,
    pub eye_color_match: Option<SambaBoolean>,
    pub address1_match: Option<SambaBoolean>,
    pub address2_match: Option<SambaBoolean>,
    pub address_city_match: Option<SambaBoolean>,
    pub address_state_match: Option<SambaBoolean>,
    pub address_zip5_match: Option<SambaBoolean>,
    pub address_zip4_match: Option<SambaBoolean>,
}

impl LicenseValidation {
    pub fn overall_pass(&self) -> bool {
        matches!(self.document_validation_result.as_str(), "PASS")
    }
}


#[cfg(test)]
mod tests {
    use super::GetLVOrderResponse;
    use crate::test_fixtures;

    #[test]
    fn test_deserializes() {
        let parsed =
            serde_json::from_value::<GetLVOrderResponse>(test_fixtures::samba_license_validation_pass())
                .unwrap();
        let lv = parsed.license_validation().clone().unwrap();
        assert!(lv.overall_pass());
        assert!(lv.driver_license_number_match.as_bool());
        assert!(lv.last_name_exact_match.unwrap().as_bool());
        assert!(!lv.name_sufix_match.unwrap().as_bool());
    }
}
