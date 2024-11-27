use crate::auth::tenant::TenantAuth;
use crate::auth::user::CheckUserBizWfAuthContext;
use crate::auth::CanDecrypt;
use crate::auth::IsGuardMet;
use crate::utils::db2api::DbToApi;
use crate::utils::vault_wrapper::BusinessOwnerInfo;
use api_wire_types::BeneficialOwnerStatus;
use db::models::business_owner::BusinessOwner;
use db::models::business_owner::UserData;
use db::models::onboarding_decision::OnboardingDecision;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::Vault;
use db::models::workflow::Workflow;
use newtypes::BusinessDataKind as BDK;
use newtypes::DataIdentifier as DI;
use newtypes::DecisionStatus;
use newtypes::IdentityDataKind as IDK;
use newtypes::OnboardingStatus;
use newtypes::PiiString;
use newtypes::SessionAuthToken;

type BusinessOwnerSerializableInfo<'a> = (
    BusinessOwnerInfo,
    &'a Box<dyn TenantAuth>,
    Option<(Workflow, Option<OnboardingDecision>)>,
);

impl<'a> DbToApi<BusinessOwnerSerializableInfo<'a>> for api_wire_types::PrivateBusinessOwner {
    fn from_db((bo, auth, wf): BusinessOwnerSerializableInfo<'a>) -> Self {
        let name = bo_name(&bo, auth);
        let ownership_stake_di = DI::Business(BDK::BeneficialOwnerStake(bo.bo.link_id));

        let (wf_status, obd_status) = wf.map(|(wf, obd)| (wf.status, obd.map(|obd| obd.status))).unzip();
        let bo_status = match (wf_status, obd_status.flatten()) {
            // Prefer to take the status from the onboarding decision
            (_, Some(s)) => match s {
                DecisionStatus::Pass => BeneficialOwnerStatus::Pass,
                DecisionStatus::Fail => BeneficialOwnerStatus::Fail,
                DecisionStatus::None => BeneficialOwnerStatus::None,
                DecisionStatus::StepUp => BeneficialOwnerStatus::AwaitingKyc,
            },
            // If there's no onboarding decision, the workflow must be incomplete
            (Some(OnboardingStatus::Incomplete), None) => BeneficialOwnerStatus::Incomplete,
            (Some(OnboardingStatus::Pending), None) => BeneficialOwnerStatus::Pending,
            // Everything else (really just None) maps to AwaitingKyc
            (_, None) => BeneficialOwnerStatus::AwaitingKyc,
        };

        Self {
            id: bo.bo.id,
            status: bo.su.as_ref().map(|su| su.status),
            fp_id: bo.su.map(|su| su.fp_id),
            ownership_stake: bo.ownership_stake,
            ownership_stake_di,
            kind: bo.bo.kind,
            source: bo.bo.source,
            name,
            bo_status,
        }
    }
}

impl<'a> DbToApi<(BusinessOwnerInfo, &'a CheckUserBizWfAuthContext)> for api_wire_types::HostedBusinessOwner {
    fn from_db((bo, user_auth): (BusinessOwnerInfo, &'a CheckUserBizWfAuthContext)) -> Self {
        let has_linked_user = bo.has_linked_user();
        let BusinessOwnerInfo {
            bo,
            su,
            data,
            ownership_stake,
        } = bo;
        let is_authed_user = su.is_some_and(|su| su.id == user_auth.scoped_user.id);
        let is_mutable = !has_linked_user || is_authed_user;
        let populated_data = data.keys().cloned().collect();
        let decrypted_data = data
            .into_iter()
            .filter(|(di, _)| {
                if matches!(di, DI::Id(IDK::FirstName) | DI::Id(IDK::LastName)) {
                    // Always show the first name and last name, regardless of whether this BO is editable
                    return true;
                }
                // For other properties (like phone and email), only render them if they are owned by the biz
                // OR if the currently logged in user is this beneficial owner.
                // This minimizes the amount of data that BOs can see about each other
                is_mutable
            })
            .collect();
        Self {
            link_id: bo.link_id,
            uuid: bo.uuid,
            has_linked_user,
            is_authed_user,
            is_mutable,
            populated_data,
            decrypted_data,
            ownership_stake,
            created_at: bo.created_at,
        }
    }
}

impl DbToApi<(BusinessOwner, ScopedVault, Vault)> for api_wire_types::PrivateOwnedBusiness {
    fn from_db((_, sb, _): (BusinessOwner, ScopedVault, Vault)) -> Self {
        let ScopedVault {
            fp_id: id, status, ..
        } = sb;
        Self { id, status }
    }
}

impl DbToApi<(BusinessOwner, UserData)> for api_wire_types::BusinessOwner {
    fn from_db((_, (sv, _)): (BusinessOwner, UserData)) -> Self {
        let ScopedVault { fp_id, .. } = sv;
        Self { fp_id }
    }
}

impl<'a>
    DbToApi<(
        &'a BusinessOwnerInfo,
        &'a Box<dyn TenantAuth>,
        PiiString,
        SessionAuthToken,
    )> for api_wire_types::PrivateBusinessOwnerKycLink
{
    fn from_db(
        (bo, auth, link, token): (
            &'a BusinessOwnerInfo,
            &'a Box<dyn TenantAuth>,
            PiiString,
            SessionAuthToken,
        ),
    ) -> Self {
        Self {
            name: bo_name(bo, auth),
            id: bo.bo.id.clone(),
            link,
            token,
        }
    }
}

#[allow(clippy::borrowed_box)]
fn bo_name(bo: &BusinessOwnerInfo, auth: &Box<dyn TenantAuth>) -> Option<PiiString> {
    let can_see_name = CanDecrypt::new(vec![IDK::FirstName, IDK::LastName]).is_met(&auth.scopes());
    let (first_name, last_name) = can_see_name.then_some(bo.clone().name()).flatten()?;
    Some(PiiString::from(format!(
        "{} {}.",
        first_name.leak(),
        last_name.leak().chars().take(1).collect::<String>()
    )))
}
