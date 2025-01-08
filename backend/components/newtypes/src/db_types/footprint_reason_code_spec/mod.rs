use super::RiskSignalGroupKind;
use crate::FootprintReasonCode;
use api_errors::FpResult;
use api_errors::ServerErr;
use serde::Deserialize;
use serde::Serialize;
use std::collections::HashMap;


// Include all the YAML files
const KYC: &str = include_str!("./specs/kyc.yaml");
const DOC: &str = include_str!("./specs/doc.yaml");
// Register all the specs
const SPECS: [(&str, RiskSignalGroupKind); 2] =
    [(KYC, RiskSignalGroupKind::Kyc), (DOC, RiskSignalGroupKind::Doc)];

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct RiskSignalSpec {
    pub categories: Vec<RiskSignalCategory>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct RiskSignalCategory {
    pub name: String,
    pub sub_categories: Vec<RiskSignalSubCategory>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct RiskSignalSubCategory {
    pub name: String,
    pub reason_codes: Vec<FootprintReasonCode>,
}

pub fn load_reason_code_specs() -> FpResult<HashMap<RiskSignalGroupKind, RiskSignalSpec>> {
    let mut specs = HashMap::new();
    for (spec, rsg) in SPECS {
        let yaml_spec = serde_yaml::from_str(spec).map_err(|e| ServerErr(e.to_string()))?;
        specs.insert(rsg, yaml_spec);
    }

    Ok(specs)
}


#[cfg(test)]
mod tests {
    use super::*;
    use itertools::Itertools;
    use strum::IntoEnumIterator;

    #[allow(dead_code)]
    fn validate_reason_codes() -> Result<(), String> {
        let specs = load_reason_code_specs().unwrap();

        //
        // Validate all reason codes are accounted for
        //
        let yaml_codes = specs
            .values()
            .flat_map(|spec| &spec.categories)
            .flat_map(|category| &category.sub_categories)
            .flat_map(|subcategory| &subcategory.reason_codes)
            .cloned()
            .collect_vec();

        let enum_codes = FootprintReasonCode::iter().collect_vec();

        // Find codes in enum but not in YAML. We can't have anything in YAML not in enum bc deser will fail
        let missing_in_yaml: Vec<&FootprintReasonCode> = enum_codes
            .iter()
            .filter(|code| !yaml_codes.contains(*code))
            .collect();

        if !missing_in_yaml.is_empty() {
            return Err(format!("Reason codes missing from YAML: {:?}\n", missing_in_yaml));
        }

        //
        // Validate RSGs are accounted for. This is unlikely to happen since we have already validated all
        // the FRCs but just in case
        //
        let rsgs = RiskSignalGroupKind::iter().collect_vec();
        let missing_rsgs: Vec<&RiskSignalGroupKind> =
            rsgs.iter().filter(|rsg| !specs.contains_key(*rsg)).collect();

        if !missing_rsgs.is_empty() {
            return Err(format!(
                "RiskSignalGroupKinds missing from YAML: {:?}\n",
                missing_rsgs
            ));
        }


        Ok(())
    }


    #[test]
    fn test_load_and_validate_reason_codes() {
        // TODO: finish all the mapping
        // validate_reason_codes().unwrap();
    }
}
