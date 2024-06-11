use crate::utils::db2api::DbToApi;
use db::models::manual_review::ManualReview;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use newtypes::OnboardingStatus;

impl DbToApi<(OnboardingStatus, ScopedVault, Vec<ManualReview>, ObConfiguration)>
    for api_wire_types::EntityValidateResponse
{
    fn from_db(
        (status, sv, mrs, obc): (OnboardingStatus, ScopedVault, Vec<ManualReview>, ObConfiguration),
    ) -> Self {
        api_wire_types::EntityValidateResponse {
            fp_id: sv.fp_id,
            status,
            requires_manual_review: !mrs.is_empty(),
            playbook_key: obc.key,
        }
    }
}
