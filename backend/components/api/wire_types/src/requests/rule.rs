use crate::*;
use newtypes::RuleAction;
use newtypes::RuleActionConfig;
use newtypes::RuleId;
use newtypes::UnvalidatedRuleExpression;


#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct MultiUpdateRuleRequest {
    pub expected_rule_set_version: i32,
    #[serde(default)]
    pub add: Option<Vec<CreateRule>>,
    #[serde(default)]
    pub edit: Option<Vec<EditRule>>,
    #[serde(default)]
    pub delete: Option<Vec<RuleId>>,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(untagged)]
pub enum RuleActionMigration {
    Legacy(RuleAction),
    New(RuleActionConfig),
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CreateRule {
    #[serde(default)]
    pub name: Option<String>,
    pub rule_expression: UnvalidatedRuleExpression,
    pub rule_action: RuleActionMigration,
    #[serde(default)]
    pub is_shadow: bool,
}


#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct EditRule {
    pub rule_id: RuleId,
    pub rule_expression: UnvalidatedRuleExpression,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct EvaluateRuleRequest {
    // could mb just use MultiUpdateRuleRequest here too, dunno if we really need to assert on
    // expected_rule_set_version for the backtest tho
    pub add: Option<Vec<CreateRule>>,
    pub edit: Option<Vec<EditRule>>,
    pub delete: Option<Vec<RuleId>>,
    pub start_timestamp: DateTime<Utc>,
    pub end_timestamp: DateTime<Utc>,
}
