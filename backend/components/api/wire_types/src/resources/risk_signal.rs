use crate::*;
use itertools::Itertools;
use newtypes::footprint_reason_code_spec::RiskSignalSpec;
use newtypes::FootprintReasonCode;
use newtypes::OnboardingDecisionId;
use newtypes::RiskSignalGroupKind;
use newtypes::RiskSignalId;
use newtypes::SignalScope;
use newtypes::SignalSeverity;
use std::collections::HashMap;

/// RiskSignal information, including severity, impacted scopes, and more.
#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Response, macros::JsonResponder)]
pub struct RiskSignal {
    pub id: RiskSignalId,
    pub onboarding_decision_id: Option<OnboardingDecisionId>, // TODO: remove this ??
    pub reason_code: FootprintReasonCode,
    pub note: String,
    pub description: String,
    pub group: RiskSignalGroupKind,
    pub severity: SignalSeverity,
    pub scopes: Vec<SignalScope>,
    pub timestamp: chrono::DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct PublicRiskSignal {
    #[openapi(example = "address_does_not_match")]
    pub reason_code: FootprintReasonCode,
    #[openapi(example = "Address does not match")]
    pub note: String,
    #[openapi(example = "Address located does not match address input.")]
    pub description: String,
    #[openapi(example = "high")]
    pub severity: SignalSeverity,
    #[openapi(example = r#"["address"]"#)]
    pub scopes: Vec<SignalScope>,
    pub timestamp: chrono::DateTime<Utc>,
}

/// Non-public RiskSignal serialization that has additional information
#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct RiskSignalDetail {
    pub id: RiskSignalId,
    pub onboarding_decision_id: Option<OnboardingDecisionId>,
    pub reason_code: FootprintReasonCode,
    pub note: String,
    pub description: String,
    pub severity: SignalSeverity,
    pub scopes: Vec<SignalScope>,
    pub timestamp: chrono::DateTime<Utc>,
    pub has_aml_hits: bool,
    pub has_sentilink_detail: bool,
}

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct PublicRiskSignalDescription {
    pub reason_code: FootprintReasonCode,
    /// Short description of the reason code
    pub note: String,
    /// Description of the reason code
    pub description: String,
    /// An indication of importance
    pub severity: SignalSeverity,
    /// What the reason code applies to (Name, Document, Business, etc)
    pub scopes: Vec<SignalScope>,
}


#[derive(Debug, Serialize, Apiv2Response, macros::JsonResponder)]
#[openapi(inline)]
pub struct PublicRiskSignalSpecDescription(HashMap<RiskSignalGroupKind, PublicRiskSignalSpec>);

#[derive(Debug, Serialize, Apiv2Response)]
#[serde(rename_all = "snake_case")]
pub struct PublicRiskSignalSpec {
    pub category: Vec<PublicRiskSignalCategory>,
}

#[derive(Debug, Serialize, Apiv2Response)]
#[serde(rename_all = "snake_case")]
pub struct PublicRiskSignalCategory {
    pub name: String,
    pub sub_categories: Vec<PublicRiskSignalSubCategory>,
}

#[derive(Debug, Serialize, Apiv2Response)]
#[serde(rename_all = "snake_case")]
pub struct PublicRiskSignalSubCategory {
    pub name: String,
    pub reason_codes: Vec<PublicRiskSignalDescription>,
}

impl From<HashMap<RiskSignalGroupKind, RiskSignalSpec>> for PublicRiskSignalSpecDescription {
    fn from(specs: HashMap<RiskSignalGroupKind, RiskSignalSpec>) -> Self {
        let active_rs = FootprintReasonCode::iter_active().collect_vec();
        let public_specs = specs
            .into_iter()
            .map(|(k, v)| {
                let categories = v
                    .categories
                    .into_iter()
                    .map(|category| {
                        let sub_categories = category
                            .sub_categories
                            .into_iter()
                            .map(|subcategory| {
                                let reason_codes = subcategory
                                    .reason_codes
                                    .into_iter()
                                    .filter(|code| active_rs.contains(code))
                                    .map(|code| PublicRiskSignalDescription {
                                        reason_code: code.clone(),
                                        note: code.note(),
                                        description: code.description(),
                                        severity: code.severity(),
                                        scopes: code.scopes(),
                                    })
                                    .collect();
                                PublicRiskSignalSubCategory {
                                    name: subcategory.name,
                                    reason_codes,
                                }
                            })
                            .collect();
                        PublicRiskSignalCategory {
                            name: category.name,
                            sub_categories,
                        }
                    })
                    .collect_vec();

                (k, PublicRiskSignalSpec { category: categories })
            })
            .collect();

        PublicRiskSignalSpecDescription(public_specs)
    }
}
