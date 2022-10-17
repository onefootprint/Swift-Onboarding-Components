use db::{
    assert_in_transaction,
    models::{
        ob_configuration::ObConfiguration,
        requirement::{CreateRequirementConfig, Requirement},
    },
    DbResult, PgConnection,
};

use newtypes::{OnboardingId, RequirementInitiator, RequirementKind, RequirementStatus2, UserVaultId};

use crate::types::identity_data_request::IdentityDataUpdate;

use super::risk;

pub(super) fn create_requirements(
    conn: &mut PgConnection,
    user_vault_id: &UserVaultId,
    onboarding_id: &OnboardingId,
    ob_config: &ObConfiguration,
) -> DbResult<Vec<Requirement>> {
    assert_in_transaction(conn)?;

    // Get requirements to create and requirements already satisfied
    let requirements_to_create = helpers::get_onboarding_requirement_configs(ob_config);

    // Create new Requirements. The configs determine if they should be created as "fulfilled" already
    let requirements_created =
        Requirement::create_from_configs(conn, requirements_to_create, user_vault_id, Some(onboarding_id))?;

    Ok(requirements_created)
}

pub(super) fn update_requirement_statuses_to_processing(
    conn: &mut PgConnection,
    user_vault_id: &UserVaultId,
    identity_data: Option<&IdentityDataUpdate>,
) -> DbResult<Vec<Requirement>> {
    // TODO: Return Vec<Requirement>, Vec<CannotBeUpdated> ?

    // For now we assume we are only doing this with collected data!
    if identity_data.is_none() {
        return Ok(vec![]);
    }
    assert_in_transaction(conn)?;

    // Unwrap is ok here since we check non-none above
    let identity_data_kinds = helpers::get_requirement_kinds_from_identity_data(identity_data.unwrap());
    // First check if we are able to update these statuses to processing
    // TODO: Should we error if we can't update all of them?
    let can_update: Vec<RequirementKind> = identity_data_kinds
        .into_iter()
        .filter(|k| risk::can_update_status_for_kind(conn, RequirementStatus2::Processing, k))
        .collect();

    Requirement::update_status_to_processing(conn, can_update, user_vault_id)
}
mod helpers {
    use super::*;
    use newtypes::{
        address::FullAddressOrZip,
        ssn::Ssn::{Ssn4, Ssn9},
        CollectedDataOption,
    };
    use std::collections::HashSet;

    fn collected_data_option_to_requirement_kind(
        collected_data_option: &CollectedDataOption,
    ) -> RequirementKind {
        match collected_data_option {
            CollectedDataOption::Name => RequirementKind::Name,
            CollectedDataOption::Dob => RequirementKind::Dob,
            CollectedDataOption::Ssn4 => RequirementKind::Ssn4,
            CollectedDataOption::Ssn9 => RequirementKind::Ssn9,
            CollectedDataOption::FullAddress => RequirementKind::FullAddress,
            CollectedDataOption::PartialAddress => RequirementKind::PartialAddress,
            CollectedDataOption::Email => RequirementKind::Email,
            CollectedDataOption::PhoneNumber => RequirementKind::PhoneNumber,
        }
    }

    // Given an onboarding configuration, return Requirements
    pub(super) fn requirements_from_onboarding_config(ob_config: &ObConfiguration) -> Vec<RequirementKind> {
        let mut collected_data_requirements: Vec<RequirementKind> = ob_config
            .must_collect_data
            .iter()
            .map(collected_data_option_to_requirement_kind)
            .collect();

        // Add in identity_document
        if ob_config.must_collect_identity_document {
            collected_data_requirements.push(RequirementKind::IdentityDocument)
        }

        collected_data_requirements
    }

    // If we have already collected some information from this user, so we may not need to require collection of certain data again
    // We therefore check the requested onboarding requirement this function
    pub(super) fn get_onboarding_requirement_kinds_already_satisfied(
        _ob_config_requirements: Vec<RequirementKind>,
    ) -> Vec<CreateRequirementConfig> {
        // TODO:
        //   1) set fulfilled_at
        //   2) set fulfilled_by_requirement_id
        vec![]
    }

    /// Required Requirements are a function of:
    /// 1) For now, just ObConfiguration
    /// In the future, previously satisfied requirements, step ups, etc
    pub(super) fn get_onboarding_requirement_configs(
        ob_config: &ObConfiguration,
    ) -> Vec<CreateRequirementConfig> {
        // First, get the requested requirements
        let ob_config_requirements: Vec<RequirementKind> = requirements_from_onboarding_config(ob_config);

        // Then, get already satisfied requirements.
        // A couple of notes:
        //    - **This only checks for onboarding requirements already satisfied**. risk::get_onboarding_step_up_requirement_kinds will
        //       decide if it needs/doesn't need Liveness or other things
        //    - these are considered "satisfied by Footprint"
        //    - This is kept broken out for clarity and in case we want to have more involved logic
        let already_completed_onboarding_requirements: Vec<CreateRequirementConfig> =
            get_onboarding_requirement_kinds_already_satisfied(ob_config_requirements.clone());

        // Compute the requirements we need to collect (ob_config_requirements - already_completed_requirements)
        let onboarding_requirements_not_satisfied: Vec<RequirementKind> =
            HashSet::<RequirementKind>::from_iter(ob_config_requirements.into_iter())
                .difference(&HashSet::<RequirementKind>::from_iter(
                    already_completed_onboarding_requirements.iter().map(|r| r.kind),
                ))
                .copied()
                .into_iter()
                .collect::<Vec<RequirementKind>>();

        // Lastly, get risk-related requirements
        let risk_requirements: Vec<CreateRequirementConfig> =
            risk::get_onboarding_step_up_requirement_kinds();

        onboarding_requirements_not_satisfied
            .into_iter()
            .map(|kind| CreateRequirementConfig {
                kind,
                initiator: RequirementInitiator::Tenant,
                fulfilled_at: None,
                fulfilled_by_requirement_id: None,
            })
            .chain(risk_requirements.into_iter())
            .chain(already_completed_onboarding_requirements.into_iter())
            .collect()
    }

    pub(super) fn get_requirement_kinds_from_identity_data(
        identity_data: &IdentityDataUpdate,
    ) -> Vec<RequirementKind> {
        let mut requirements_in_update: Vec<RequirementKind> = vec![];

        if identity_data.name.is_some() {
            requirements_in_update.push(RequirementKind::Name);
        }

        if identity_data.dob.is_some() {
            requirements_in_update.push(RequirementKind::Dob);
        }

        if let Some(ssn_variant) = identity_data.ssn.to_owned() {
            let ssn_req = match ssn_variant {
                Ssn4(_) => RequirementKind::Ssn4,
                Ssn9(_) => RequirementKind::Ssn9,
            };

            requirements_in_update.push(ssn_req);
        }

        if let Some(address) = &identity_data.address {
            let address_req = match address {
                FullAddressOrZip::Address(_) => RequirementKind::FullAddress,
                FullAddressOrZip::ZipAndCountry(_) => RequirementKind::PartialAddress,
            };

            requirements_in_update.push(address_req);
        }

        requirements_in_update
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use newtypes::fields;
    use newtypes::{name::FullName, name::Name, CollectedDataOption};
    use std::str::FromStr;

    ////////////////////////////
    // Private Methods
    ////////////////////////////
    #[test]
    fn test_requirements_from_onboarding_config() {
        let ob_config_with_id_doc = &new_ob_config(vec![CollectedDataOption::Name], true);
        let ob_config_without_id_doc =
            &new_ob_config(vec![CollectedDataOption::Name, CollectedDataOption::Ssn4], false);

        assert_eq!(
            helpers::requirements_from_onboarding_config(ob_config_with_id_doc),
            vec![RequirementKind::Name, RequirementKind::IdentityDocument]
        );
        assert_eq!(
            helpers::requirements_from_onboarding_config(ob_config_without_id_doc),
            vec![RequirementKind::Name, RequirementKind::Ssn4]
        );
    }
    #[test]
    fn test_get_onboarding_requirement_configs() {
        let ob_config = &new_ob_config(vec![CollectedDataOption::Name], true);
        let mut expected_create_configs = vec![
            CreateRequirementConfig {
                kind: RequirementKind::Name,
                initiator: RequirementInitiator::Tenant,
                fulfilled_at: None,
                fulfilled_by_requirement_id: None,
            },
            CreateRequirementConfig {
                kind: RequirementKind::IdentityDocument,
                initiator: RequirementInitiator::Tenant,
                fulfilled_at: None,
                fulfilled_by_requirement_id: None,
            },
            CreateRequirementConfig {
                kind: RequirementKind::Liveness,
                initiator: RequirementInitiator::Footprint,
                fulfilled_at: None,
                fulfilled_by_requirement_id: None,
            },
        ];

        let mut res_created = helpers::get_onboarding_requirement_configs(ob_config);

        // need the sorts so order is deterministic. Could use HashSets but that's
        // also ugle
        res_created.sort_by_key(|r| r.kind);
        expected_create_configs.sort_by_key(|r| r.kind);

        assert_eq!(res_created, expected_create_configs);
    }

    #[test]
    fn test_get_requirement_kinds_from_identity_data() {
        let update_with_one_field = IdentityDataUpdate {
            name: Some(FullName {
                first_name: Name::from_str("Foot").unwrap(),
                last_name: Name::from_str("Print").unwrap(),
            }),
            address: None,
            ssn: None,
            dob: None,
        };

        assert_eq!(
            vec![RequirementKind::Name],
            helpers::get_requirement_kinds_from_identity_data(&update_with_one_field)
        );

        let update_with_multiple_field = IdentityDataUpdate {
            name: Some(FullName {
                first_name: Name::from_str("Foot").unwrap(),
                last_name: Name::from_str("Print").unwrap(),
            }),
            address: None,
            ssn: None,
            dob: Some(fields::dob::DateOfBirth {
                day: fields::dob::Day::try_from(1).unwrap(),
                month: fields::dob::Month::try_from(1).unwrap(),
                year: fields::dob::Year::try_from(1990).unwrap(),
            }),
        };

        assert_eq!(
            vec![RequirementKind::Name, RequirementKind::Dob],
            helpers::get_requirement_kinds_from_identity_data(&update_with_multiple_field)
        );
    }

    fn new_ob_config(
        must_collect_data: Vec<CollectedDataOption>,
        must_collect_identity_document: bool,
    ) -> ObConfiguration {
        ObConfiguration {
            must_collect_data,
            must_collect_identity_document,
            ..ObConfiguration::default()
        }
    }
}
