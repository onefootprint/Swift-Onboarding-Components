use crate::*;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateRuleRequest {
    pub name: Option<String>,
    pub rule_expression: RuleExpression,
    pub action: RuleAction,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct UpdateRuleRequest {
    pub name: Option<Option<String>>,
    pub rule_expression: Option<RuleExpression>,
    pub is_shadow: Option<bool>,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct EvaluateRuleRequest {
    pub rule_expression: RuleExpression,
}
