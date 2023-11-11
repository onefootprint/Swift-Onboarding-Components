use crate::*;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateRuleRequest {
    pub name: Option<String>,
    pub rule_expression: String,
    pub action: RuleAction,
}
