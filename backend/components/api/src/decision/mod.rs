use db::{
    models::{
        ob_configuration::ObConfiguration, onboarding::Onboarding, requirement::Requirement,
        scoped_user::ScopedUser,
    },
    PgConnection,
};

use crate::errors::ApiError;

pub struct DecisionClient<'a> {
    pub conn: &'a mut PgConnection,
    pub onboarding: &'a Onboarding,
    pub scoped_user: &'a ScopedUser,
    pub ob_config: &'a ObConfiguration,
}

impl<'a> DecisionClient<'a> {
    /// Create new requirements based on configuration + existing met requirements
    /// Note: should ensure it is run inside of a transaction to avoid duplicate requirements
    /// being created for the same user_vault <-> onboarding
    pub fn create_requirements(&self) -> Result<Vec<Requirement>, ApiError> {
        //TODO: implement
        Ok(vec![])
    }
}
