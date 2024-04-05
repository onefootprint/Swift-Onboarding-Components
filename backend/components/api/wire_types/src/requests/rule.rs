use crate::*;
use newtypes::{RuleAction, RuleExpression, RuleId};

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
pub struct MultiUpdateRuleRequest {
    pub expected_rule_set_version: i32,
    pub add: Option<Vec<CreateRule>>,
    pub edit: Option<Vec<EditRule>>,
    pub delete: Option<Vec<RuleId>>,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateRule {
    pub rule_expression: RuleExpression,
    pub rule_action: RuleAction,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct EditRule {
    pub rule_id: RuleId,
    pub rule_expression: RuleExpression,
}


#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct EvaluateRuleRequest {
    // could mb just use MultiUpdateRuleRequest here too, dunno if we really need to assert on expected_rule_set_version for the backtest tho
    pub add: Option<Vec<CreateRule>>,
    pub edit: Option<Vec<EditRule>>,
    pub delete: Option<Vec<RuleId>>,
}
