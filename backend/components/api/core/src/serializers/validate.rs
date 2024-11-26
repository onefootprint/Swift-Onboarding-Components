use crate::utils::db2api::DbToApi;
use db::models::manual_review::ManualReview;
use db::models::playbook::Playbook;
use db::models::scoped_vault::ScopedVault;
use newtypes::OnboardingStatus;

impl DbToApi<(OnboardingStatus, ScopedVault, Vec<ManualReview>, Playbook)>
    for api_wire_types::EntityValidateResponse
{
    fn from_db(
        (status, sv, mrs, playbook): (OnboardingStatus, ScopedVault, Vec<ManualReview>, Playbook),
    ) -> Self {
        api_wire_types::EntityValidateResponse {
            fp_id: sv.fp_id,
            status,
            requires_manual_review: !mrs.is_empty(),
            playbook_key: playbook.key,
        }
    }
}
