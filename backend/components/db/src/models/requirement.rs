use crate::schema::requirement;
use crate::DbResult;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, Queryable, RunQueryDsl};
use newtypes::{
    OnboardingId, RequirementId, RequirementInitiator, RequirementKind, RequirementStatus2, UserVaultId,
};
use serde::{Deserialize, Serialize};
#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = requirement)]
pub struct Requirement {
    pub id: RequirementId,
    pub kind: RequirementKind,
    pub status: RequirementStatus2,
    pub initiator: RequirementInitiator,
    pub user_vault_id: UserVaultId,
    pub fulfilled_at: Option<DateTime<Utc>>,
    pub fulfilled_by_requirement_id: Option<RequirementId>,
    pub onboarding_id: Option<OnboardingId>,
    pub created_at: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub error_message: Option<String>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = requirement)]
pub struct NewRequirement {
    pub kind: RequirementKind,
    pub status: RequirementStatus2,
    pub initiator: RequirementInitiator,
    pub user_vault_id: UserVaultId,
    pub fulfilled_at: Option<DateTime<Utc>>,
    pub fulfilled_by_requirement_id: Option<RequirementId>,
    pub onboarding_id: Option<OnboardingId>,
    pub created_at: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub error_message: Option<String>,
}

/// Helper struct for non-db crate creation of `Requirement`s
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CreateRequirementConfig {
    pub kind: RequirementKind,
    pub initiator: RequirementInitiator,
}

/// Helper struct for non-db crate fulfilling of `Requirement`s
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AlreadyFulfilledRequirementConfig {
    pub kind: RequirementKind,
    pub fulfilled_at: DateTime<Utc>,
    pub fulfilled_by_requirement_id: RequirementId,
}

impl Requirement {
    pub fn create_from_configs(
        conn: &mut PgConnection,
        configs: Vec<CreateRequirementConfig>,
        user_vault_id: &UserVaultId,
        onboarding_id: Option<&OnboardingId>,
    ) -> DbResult<Vec<Self>> {
        // TODO: error if there is already a requirement of that kind!
        let new_requirements: Vec<NewRequirement> = configs
            .into_iter()
            .map(move |config| NewRequirement {
                kind: config.kind,
                status: RequirementStatus2::Missing,
                initiator: config.initiator,
                user_vault_id: user_vault_id.clone(),
                fulfilled_at: None,
                fulfilled_by_requirement_id: None,
                onboarding_id: onboarding_id.cloned(),
                created_at: Utc::now(),
                deactivated_at: None,
                error_message: None,
            })
            .collect();
        let result = diesel::insert_into(requirement::table)
            .values(new_requirements)
            .get_results::<Requirement>(conn)?;
        Ok(result)
    }
    pub fn update_status_to_processing(
        conn: &mut PgConnection,
        kinds: Vec<RequirementKind>,
        user_vault_id: &UserVaultId,
    ) -> DbResult<Vec<Self>> {
        let results = diesel::update(requirement::table)
            .filter(
                // we only ever have 1 requirement per kind for a given user_vault_id
                requirement::kind.eq_any(kinds).and(
                    requirement::user_vault_id
                        .eq(user_vault_id)
                        .and(requirement::deactivated_at.is_null()),
                ),
            )
            .set(requirement::status.eq(RequirementStatus2::Processing))
            .get_results(conn)?;

        Ok(results)
    }

    /// Mark requirements as being fulfilled by other requirements
    /// TODO! IMPLEMENT
    pub fn mark_requirements_as_fulfilled_by_requirement(
        conn: &mut PgConnection,
        configs: Vec<AlreadyFulfilledRequirementConfig>,
        user_vault_id: &UserVaultId,
    ) -> DbResult<Vec<Self>> {
        Ok(vec![])
    }

    pub fn get_active_requirements_for_user_vault_id(
        conn: &mut PgConnection,
        user_vault_id: &UserVaultId,
    ) -> DbResult<Vec<Self>> {
        let results = requirement::table
            .filter(
                requirement::user_vault_id
                    .eq(user_vault_id)
                    .and(requirement::deactivated_at.is_null()),
            )
            .get_results(conn)?;

        Ok(results)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test::test_user_vault;
    use crate::test_helpers::test_db_conn;
    use std::collections::HashSet;

    #[test]
    fn test_create_requirement() -> Result<(), crate::DbError> {
        let mut conn = test_db_conn();
        let uv = test_user_vault(&mut conn, false);

        let configs = vec![
            CreateRequirementConfig {
                kind: RequirementKind::Dob,
                initiator: RequirementInitiator::Footprint,
            },
            CreateRequirementConfig {
                kind: RequirementKind::Name,
                initiator: RequirementInitiator::Tenant,
            },
            CreateRequirementConfig {
                kind: RequirementKind::Ssn4,
                initiator: RequirementInitiator::StepUp,
            },
        ];

        Requirement::create_from_configs(&mut conn, configs.clone(), &uv.id, None)?;
        let records_from_db = Requirement::get_active_requirements_for_user_vault_id(&mut conn, &uv.id)?;

        // We have 3 records (from 3 configs)
        assert_eq!(records_from_db.len(), 3);
        // All the kinds match
        assert_eq!(
            // Requirement kinds
            HashSet::<RequirementKind>::from_iter(records_from_db.iter().map(|r| r.kind)),
            // Match config kinds
            HashSet::<RequirementKind>::from_iter(configs.iter().map(|r| r.kind))
        );
        // All the initiators are what we expect
        assert_eq!(
            // Requirement initiator
            HashSet::<RequirementInitiator>::from_iter(records_from_db.iter().map(|r| r.initiator)),
            // Match config initiator
            HashSet::<RequirementInitiator>::from_iter(configs.iter().map(|r| r.initiator))
        );

        Ok(())
    }

    #[test]
    fn test_update_status_to_processing() -> Result<(), crate::DbError> {
        let mut conn = test_db_conn();
        let uv = test_user_vault(&mut conn, false);
        let kind = RequirementKind::Dob;

        let configs = vec![CreateRequirementConfig {
            kind,
            initiator: RequirementInitiator::Footprint,
        }];

        // Create Requirements
        Requirement::create_from_configs(&mut conn, configs, &uv.id, None)?;
        // Mark as processing
        Requirement::update_status_to_processing(&mut conn, vec![kind], &uv.id)?;

        let records_from_db = Requirement::get_active_requirements_for_user_vault_id(&mut conn, &uv.id)?;
        assert_eq!(records_from_db.len(), 1);
        let record = records_from_db[0].clone();
        assert_eq!(record.status.clone(), RequirementStatus2::Processing);

        Ok(())
    }
}
