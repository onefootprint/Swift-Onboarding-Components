#![allow(clippy::too_many_arguments)]

use std::sync::Arc;

use super::vendor_trait::VendorAPIResponse;
use super::*;

use crate::enclave_client::EnclaveClient;
use crate::{decision, State};

use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiError;
use crate::vendor_clients::VendorClient;

use db::models::decision_intent::DecisionIntent;
use db::models::middesk_request::{MiddeskRequest, UpdateMiddeskRequest};
use db::models::ob_configuration::ObConfiguration;
use db::models::onboarding::{Onboarding, OnboardingUpdate};
use db::models::vault::Vault;
use db::models::verification_result::VerificationResult;
use db::DbPool;
use db::{models::verification_request::VerificationRequest, DbError};
use feature_flag::{BoolFlag, FeatureFlagClient};

use idv::middesk::response::business::BusinessResponse;
use idv::middesk::response::webhook::{
    MiddeskBusinessUpdateWebhookResponse, MiddeskTinRetriedWebhookResponse,
};
use idv::middesk::{
    self, MiddeskCreateBusinessRequest, MiddeskCreateBusinessResponse, MiddeskGetBusinessRequest,
    MiddeskGetBusinessResponse,
};

use idv::{ParsedResponse, VendorResponse};

use newtypes::{BusinessData, MiddeskRequestState, ObConfigurationKey, PiiJsonValue, TenantId, VendorAPI};

#[derive(Debug)]
pub struct MiddeskState<T> {
    middesk_request: MiddeskRequest,
    state: T,
}

#[derive(Debug)]
pub struct PendingCreateBusinessCall {
    create_business_vreq: VerificationRequest,
}
#[derive(Debug)]
pub struct AwaitingBusinessUpdateWebhook {
    business_update_webhook_vreq: VerificationRequest,
}
#[derive(Debug)]
pub struct AwaitingTinRetry {
    tin_retry_vreq: VerificationRequest,
}
#[derive(Debug)]
pub struct PendingGetBusinessCall {
    get_business_vreq: VerificationRequest,
}
#[derive(Debug)]
pub struct Complete {
    business_response_vreq: VerificationRequest,
    business_response_vres: VerificationResult,
}

#[derive(Debug)]
pub enum MiddeskStates {
    PendingCreateBusinessCall(MiddeskState<PendingCreateBusinessCall>),
    AwaitingBusinessUpdateWebhook(MiddeskState<AwaitingBusinessUpdateWebhook>),
    AwaitingTinRetry(MiddeskState<AwaitingTinRetry>),
    PendingGetBusinessCall(MiddeskState<PendingGetBusinessCall>),
    Complete(MiddeskState<Complete>),
}

// Ordering matters: The order here is the order we could make or receive these in the Middesk flow
#[derive(Debug, Clone, Copy, Eq, PartialEq, Ord, PartialOrd)]
enum MiddeskVendorApi {
    CreateBusiness,
    BusinessUpdateWebhook,
    TinRetriedWebhook,
    GetBusiness,
}

#[derive(thiserror::Error, Debug)]
pub enum MiddeskError {
    #[error("{0} is not a Middesk API")]
    VendorAPIConversionError(VendorAPI),
    #[error("Unexpected state: {0}")]
    UnexpectedState(String),
    #[error("Response missing expected field: {0}")]
    ResponseMissingExpectedData(String),
    #[error("{0}")]
    AssertionError(String),
}

impl TryFrom<VendorAPI> for MiddeskVendorApi {
    type Error = MiddeskError;

    fn try_from(value: VendorAPI) -> Result<Self, Self::Error> {
        match value {
            VendorAPI::MiddeskCreateBusiness => Ok(MiddeskVendorApi::CreateBusiness),
            VendorAPI::MiddeskGetBusiness => Ok(MiddeskVendorApi::GetBusiness),
            VendorAPI::MiddeskBusinessUpdateWebhook => Ok(MiddeskVendorApi::BusinessUpdateWebhook),
            VendorAPI::MiddeskTinRetriedWebhook => Ok(MiddeskVendorApi::TinRetriedWebhook),
            _ => Err(MiddeskError::VendorAPIConversionError(value)),
        }
    }
}

impl MiddeskStates {
    async fn init(db_pool: &DbPool, middesk_request: MiddeskRequest) -> ApiResult<MiddeskStates> {
        let di_id = middesk_request.decision_intent_id.clone();
        let all_vreq_vres = db_pool
            .db_query(move |conn| VerificationRequest::list(conn, &di_id))
            .await??;

        let mut middesk_vreq_vres: Vec<_> = all_vreq_vres
            .into_iter()
            .filter_map(|v| {
                // Filter to Middesk API's
                MiddeskVendorApi::try_from(v.0.vendor_api)
                    .ok()
                    .map(|api| (api, v))
            })
            .collect();

        middesk_vreq_vres.sort_by_key(|v| v.0);
        let latest_vreq_vres = middesk_vreq_vres.pop();

        let Some((api, (vreq, vres))) = latest_vreq_vres else {
            return Err(MiddeskError::UnexpectedState("No Middesk vreq's found".into()).into());
        };

        match (api, vres) {
            (MiddeskVendorApi::CreateBusiness, None) => {
                Ok(MiddeskStates::PendingCreateBusinessCall(MiddeskState {
                    middesk_request,
                    state: PendingCreateBusinessCall {
                        create_business_vreq: vreq,
                    },
                }))
            }
            (MiddeskVendorApi::CreateBusiness, Some(_vres)) => Err(MiddeskError::UnexpectedState(
                "CreateBusiness vres found, but no outstanding vreq found".into(),
            )
            .into()),
            (MiddeskVendorApi::BusinessUpdateWebhook, None) => {
                Ok(MiddeskStates::AwaitingBusinessUpdateWebhook(MiddeskState {
                    middesk_request,
                    state: AwaitingBusinessUpdateWebhook {
                        business_update_webhook_vreq: vreq,
                    },
                }))
            }
            (MiddeskVendorApi::BusinessUpdateWebhook, Some(vres)) => {
                Ok(MiddeskStates::Complete(MiddeskState {
                    middesk_request,
                    state: Complete {
                        business_response_vreq: vreq,
                        business_response_vres: vres,
                    },
                }))
            }
            (MiddeskVendorApi::TinRetriedWebhook, None) => {
                Ok(MiddeskStates::AwaitingTinRetry(MiddeskState {
                    middesk_request,
                    state: AwaitingTinRetry { tin_retry_vreq: vreq },
                }))
            }
            (MiddeskVendorApi::TinRetriedWebhook, Some(_vres)) => Err(MiddeskError::UnexpectedState(
                "TinRetriedWebhook vres found, but no outstanding vreq found".into(),
            )
            .into()),
            (MiddeskVendorApi::GetBusiness, None) => {
                Ok(MiddeskStates::PendingGetBusinessCall(MiddeskState {
                    middesk_request,
                    state: PendingGetBusinessCall {
                        get_business_vreq: vreq,
                    },
                }))
            }
            (MiddeskVendorApi::GetBusiness, Some(vres)) => Ok(MiddeskStates::Complete(MiddeskState {
                middesk_request,
                state: Complete {
                    business_response_vreq: vreq,
                    business_response_vres: vres,
                },
            })),
        }
    }
}

impl MiddeskState<PendingCreateBusinessCall> {
    async fn make_create_business_call(
        self,
        db_pool: &DbPool,
        enclave_client: &EnclaveClient,
        ff_client: Arc<dyn FeatureFlagClient>,
        middesk_client: VendorClient<
            MiddeskCreateBusinessRequest,
            MiddeskCreateBusinessResponse,
            idv::middesk::Error,
        >,
    ) -> Result<MiddeskState<AwaitingBusinessUpdateWebhook>, ApiError> {
        let vreq_id = self.state.create_business_vreq.id.clone();
        let ob_id = self.middesk_request.onboarding_id;

        let business_data = build_request::build_business_data_from_verification_request(
            db_pool,
            enclave_client,
            self.state.create_business_vreq.clone(),
        )
        .await?;

        let ob_configuration_key = db_pool
            .db_query(move |conn| ObConfiguration::get_by_onboarding_id(conn, &ob_id))
            .await??
            .key;

        let res = send_middesk_call(business_data, middesk_client, ff_client, ob_configuration_key)
            .await
            .map_err(|e| ApiError::from(idv::Error::from(e)))?;

        let business_id = res
            .parsed_response
            .clone()
            .id
            .ok_or(MiddeskError::ResponseMissingExpectedData(
                "business_id".to_owned(),
            ))?;
        let vendor_response = VendorResponse {
            response: res.clone().parsed_response(),
            raw_response: res.raw_response(),
        };

        let vr = (self.state.create_business_vreq.clone(), vendor_response.clone());
        let sv_id = self.state.create_business_vreq.scoped_vault_id.clone();
        let di_id = self
            .state
            .create_business_vreq
            .decision_intent_id
            .ok_or(DbError::ObjectNotFound)?;
        let middesk_request_id = self.middesk_request.id.clone();
        let (udpated_middesk_request, business_update_webhook_vreq) = db_pool
            .db_query(move |conn| -> ApiResult<_> {
                let uv = VerificationRequest::get_user_vault(conn, vreq_id)?;
                let _vres = verification_result::save_verification_result(conn, &vr, &uv.public_key)?;

                let udpated_middesk_request = MiddeskRequest::update(
                    conn,
                    middesk_request_id,
                    UpdateMiddeskRequest::set_business_id_and_state(
                        business_id,
                        MiddeskRequestState::AwaitingBusinessUpdateWebhook,
                    ),
                )?;

                // Create vreq for anticipated business.updated webhook
                let business_update_webhook_vreq = VerificationRequest::create(
                    conn,
                    &sv_id,
                    &di_id,
                    VendorAPI::MiddeskBusinessUpdateWebhook,
                )?;
                Ok((udpated_middesk_request, business_update_webhook_vreq))
            })
            .await??;

        Ok(MiddeskState {
            middesk_request: udpated_middesk_request,
            state: AwaitingBusinessUpdateWebhook {
                business_update_webhook_vreq,
            },
        })
    }
}

impl MiddeskState<AwaitingBusinessUpdateWebhook> {
    pub async fn handle_business_update_webhook_response(
        self,
        db_pool: &DbPool,
        middesk_response: MiddeskBusinessUpdateWebhookResponse,
        raw_res: serde_json::Value,
    ) -> ApiResult<MiddeskStates> {
        let webhook_vreq: VerificationRequest = self.state.business_update_webhook_vreq.clone();
        let mr = middesk_response.clone();
        let has_tin_error = mr.has_tin_error();
        let sv_id = webhook_vreq.scoped_vault_id.clone();
        let di_id = webhook_vreq
            .decision_intent_id
            .clone()
            .ok_or(DbError::ObjectNotFound)?;

        let middesk_request_id = self.middesk_request.id.clone();
        let (updated_middesk_request, vres, tin_retry_vreq) = db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let uv = VerificationRequest::get_user_vault(conn, webhook_vreq.id.clone())?;

                let vendor_response = VendorResponse {
                    response: ParsedResponse::MiddeskBusinessUpdateWebhook(mr),
                    raw_response: PiiJsonValue::new(raw_res),
                };
                let vr = (webhook_vreq, vendor_response);

                let verification_result =
                    verification_result::save_verification_result(conn, &vr, &uv.public_key)?;

                // if the IRS is unavailable, then we need to wait for a `tin.retried` webhook from Middesk
                let (new_state, tin_webhook_vreq) = if has_tin_error {
                    (
                        MiddeskRequestState::AwaitingTinRetry,
                        Some(VerificationRequest::create(
                            conn,
                            &sv_id,
                            &di_id,
                            VendorAPI::MiddeskTinRetriedWebhook,
                        )?),
                    )
                } else {
                    (MiddeskRequestState::Complete, None)
                };

                let updated_middesk_request = MiddeskRequest::update(
                    conn,
                    middesk_request_id,
                    UpdateMiddeskRequest::set_state(new_state),
                )?;

                Ok((updated_middesk_request, verification_result, tin_webhook_vreq))
            })
            .await?;

        if let Some(tin_retry_vreq) = tin_retry_vreq {
            Ok(MiddeskStates::AwaitingTinRetry(MiddeskState {
                middesk_request: updated_middesk_request,
                state: AwaitingTinRetry { tin_retry_vreq },
            }))
        } else {
            Ok(MiddeskStates::Complete(MiddeskState {
                middesk_request: updated_middesk_request,
                state: Complete {
                    business_response_vreq: self.state.business_update_webhook_vreq,
                    business_response_vres: vres,
                },
            }))
        }
    }
}

impl MiddeskState<AwaitingTinRetry> {
    pub async fn handle_tin_retried_response(
        self,
        db_pool: &DbPool,
        middesk_response: MiddeskTinRetriedWebhookResponse,
        raw_res: serde_json::Value,
    ) -> ApiResult<MiddeskState<PendingGetBusinessCall>> {
        let mr = middesk_response.clone();
        let webhook_vreq = self.state.tin_retry_vreq;
        let sv_id = webhook_vreq.scoped_vault_id.clone();
        let di_id = webhook_vreq
            .decision_intent_id
            .clone()
            .ok_or(DbError::ObjectNotFound)?;
        let middesk_request_id = self.middesk_request.id.clone();

        let (updated_middesk_request, get_business_vreq) = db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let uv = VerificationRequest::get_user_vault(conn, webhook_vreq.id.clone())?;

                let vendor_response = VendorResponse {
                    response: ParsedResponse::MiddeskTinRetriedWebhook(mr),
                    raw_response: PiiJsonValue::new(raw_res),
                };

                let _vres = verification_result::save_verification_result(
                    conn,
                    &(webhook_vreq, vendor_response),
                    &uv.public_key,
                )?;

                // create a Vreq for the GET /business call we will now make
                let get_business_vreq =
                    VerificationRequest::create(conn, &sv_id, &di_id, VendorAPI::MiddeskGetBusiness)?;

                let updated_middesk_request = MiddeskRequest::update(
                    conn,
                    middesk_request_id,
                    UpdateMiddeskRequest::set_state(MiddeskRequestState::PendingGetBusinessCall),
                )?;

                Ok((updated_middesk_request, get_business_vreq))
            })
            .await?;

        Ok(MiddeskState {
            middesk_request: updated_middesk_request,
            state: PendingGetBusinessCall { get_business_vreq },
        })
    }
}

impl MiddeskState<PendingGetBusinessCall> {
    pub async fn make_get_business_call(
        self,
        db_pool: &DbPool,
        middesk_client: VendorClient<
            MiddeskGetBusinessRequest,
            MiddeskGetBusinessResponse,
            idv::middesk::Error,
        >,
    ) -> ApiResult<MiddeskStates> {
        let business_id = self
            .middesk_request
            .business_id
            .clone()
            .ok_or(DbError::ObjectNotFound)?;
        let ob_id = self.middesk_request.onboarding_id.clone();
        let middesk_request_id = self.middesk_request.id.clone();

        let get_business_res = middesk_client
            .make_request(MiddeskGetBusinessRequest { business_id })
            .await
            .map_err(|e| ApiError::from(idv::Error::from(e)))?;

        let vendor_response = VendorResponse {
            response: get_business_res.clone().parsed_response(),
            raw_response: get_business_res.clone().raw_response(),
        };

        // TODO: refactor code sites where we save a single vres to share a common func
        let vr = (self.state.get_business_vreq.clone(), vendor_response.clone());
        let (updated_middesk_request, business_response_vres) = db_pool
            .db_query(move |conn| -> ApiResult<_> {
                let uv = Vault::get(conn, &ob_id)?;
                let vres = verification_result::save_verification_result(conn, &vr, &uv.public_key)?;

                let updated_middesk_request = MiddeskRequest::update(
                    conn,
                    middesk_request_id,
                    UpdateMiddeskRequest::set_state(MiddeskRequestState::Complete),
                )?;

                Ok((updated_middesk_request, vres))
            })
            .await??;

        Ok(MiddeskStates::Complete(MiddeskState {
            middesk_request: updated_middesk_request,
            state: Complete {
                business_response_vreq: self.state.get_business_vreq,
                business_response_vres,
            },
        }))
    }
}

impl MiddeskState<Complete> {
    pub async fn run_kyb_decisioning(
        self,
        db_pool: &DbPool,
        enclave_client: &EnclaveClient,
    ) -> ApiResult<()> {
        let obid = self.middesk_request.onboarding_id.clone();
        let e_private_key = db_pool
            .db_query(move |conn| Vault::get(conn, &obid))
            .await??
            .e_private_key;

        // TODO: make a version of this method for a single vreq/vres
        let vendor_result = vendor_result::VendorResult::from_verification_results_for_onboarding(
            vec![(
                self.state.business_response_vreq,
                Some(self.state.business_response_vres),
            )],
            enclave_client,
            &e_private_key,
        )
        .await?
        .pop()
        .ok_or(DbError::ObjectNotFound)?;

        let (business_response, vendor_api) = match vendor_result.response.response {
            ParsedResponse::MiddeskGetBusiness(r) => Ok((r, VendorAPI::MiddeskGetBusiness)),
            ParsedResponse::MiddeskBusinessUpdateWebhook(r) => r
                .business_response()
                .cloned()
                .ok_or(MiddeskError::ResponseMissingExpectedData("business data".into()))
                .map(|b| (b, VendorAPI::MiddeskBusinessUpdateWebhook)),
            _ => Err(MiddeskError::AssertionError("Unexpected VendorResult".into())),
        }?;

        decision::biz_risk::make_kyb_decision(
            db_pool,
            enclave_client,
            self.middesk_request.onboarding_id,
            &business_response,
            &vendor_result.verification_result_id,
            vendor_api,
        )
        .await
    }
}

// Insertion point 1: All BO's have completed Bifrost and we are now initiating the Middesk flow by making a POST /business call
pub async fn run_kyb(
    state: &State,
    biz_ob_id: OnboardingId,
    person_vault: &Vault,
    tenant_id: &TenantId,
) -> Result<(), ApiError> {
    let fixture_decision = decision::utils::get_fixture_data_decision(
        state.feature_flag_client.clone(),
        person_vault,
        tenant_id,
    )?;

    if let Some(fixture_decision) = fixture_decision {
        // Don't run prod middesk requests and instead just create fixture data for this business
        decision::utils::setup_kyb_test_fixtures(state, &biz_ob_id, fixture_decision).await?;
    } else {
        let middesk_state = init_middesk_request(&state.db_pool, biz_ob_id).await?;

        let _middesk_state = middesk_state
            .make_create_business_call(
                &state.db_pool,
                &state.enclave_client,
                state.feature_flag_client.clone(),
                state.vendor_clients.middesk_create_business.clone(),
            )
            .await?;
    }
    Ok(())
}

// Create middesk_request and vreq for POST /business call
pub async fn init_middesk_request(
    db_pool: &DbPool,
    ob_id: OnboardingId,
) -> ApiResult<MiddeskState<PendingCreateBusinessCall>> {
    let (middesk_request, create_business_vreq) = db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let ob = Onboarding::lock(conn, &ob_id)?;
            let sv_id = ob.scoped_vault_id.clone();
            if ob.idv_reqs_initiated_at.is_some() {
                return Err(OnboardingError::IdvReqsAlreadyInitiated.into());
            }
            Onboarding::update(ob, conn, OnboardingUpdate::idv_reqs_initiated())?;

            let decision_intent = DecisionIntent::get_or_create_onboarding_kyb(conn, &sv_id)?;
            let vreq = VerificationRequest::create(
                conn,
                &sv_id,
                &decision_intent.id,
                VendorAPI::MiddeskCreateBusiness,
            )?;

            let middesk_request = MiddeskRequest::create(
                conn,
                ob_id,
                decision_intent.id,
                MiddeskRequestState::PendingCreateBusinessCall,
            )?;

            Ok((middesk_request, vreq))
        })
        .await?;

    Ok(MiddeskState {
        middesk_request,
        state: PendingCreateBusinessCall { create_business_vreq },
    })
}

// Insertion point 2: We are receiving either a `business.updated` or `tin.retried` webhook from Middesk
pub async fn handle_middesk_webhook(
    db_pool: &DbPool,
    middesk_client: VendorClient<MiddeskGetBusinessRequest, MiddeskGetBusinessResponse, idv::middesk::Error>,
    enclave_client: &EnclaveClient,
    res: serde_json::Value,
) -> Result<(), ApiError> {
    let webhook_res = middesk::response::webhook::parse_webhook(res.clone()).map_err(idv::Error::from)?;
    let business_id = webhook_res
        .business_id()
        .ok_or(MiddeskError::ResponseMissingExpectedData("business_id".into()))?;

    let middesk_request = db_pool
        .db_query(|conn| MiddeskRequest::get_by_business_id(conn, business_id))
        .await??;
    let state = MiddeskStates::init(db_pool, middesk_request).await?;

    let next_state = match (state, webhook_res) {
        (
            MiddeskStates::AwaitingBusinessUpdateWebhook(s),
            middesk::response::webhook::MiddeskWebhookResponse::BusinessUpdate(b),
        ) => s.handle_business_update_webhook_response(db_pool, b, res).await,
        (
            MiddeskStates::AwaitingTinRetry(s),
            middesk::response::webhook::MiddeskWebhookResponse::TinRetried(t),
        ) => {
            let state = s.handle_tin_retried_response(db_pool, t, res).await?;
            state.make_get_business_call(db_pool, middesk_client).await
        }
        (s, r) => Err(MiddeskError::UnexpectedState(format!(
            "state = {:?}, webhook_id = {:?}, business_id = {:?}",
            s,
            r.webhook_id(),
            r.business_id()
        ))
        .into()),
    }?;

    match next_state {
        MiddeskStates::Complete(c) => c.run_kyb_decisioning(db_pool, enclave_client).await,
        _ => Ok(()),
    }
}

async fn send_middesk_call(
    business_data: BusinessData,
    middesk_client: VendorClient<
        MiddeskCreateBusinessRequest,
        MiddeskCreateBusinessResponse,
        idv::middesk::Error,
    >,
    ff_client: Arc<dyn FeatureFlagClient>,
    ob_configuration_key: ObConfigurationKey,
) -> Result<MiddeskCreateBusinessResponse, idv::middesk::Error> {
    if ff_client.flag(BoolFlag::EnableMiddeskInNonProd(&ob_configuration_key)) {
        middesk_client
            .make_request(MiddeskCreateBusinessRequest { business_data })
            .await
    } else {
        // TODO: the faked vendor response thing doesn't really work well for stuff like Middesk flow. Would need to rethink how to support this if its really needed.
        let raw = serde_json::json!(
          {
            "object": "business",
            "id": "dd16b27e-e6b7-4rf34-5454-d77e6d1b9dfe",
            "name": "Waffle House",
            "created_at": "2023-02-07T21:51:21.234Z",
            "updated_at": "2023-02-07T21:51:24.894Z",
            "status": "in_review",
          }
        );
        let parsed: BusinessResponse = idv::middesk::response::parse_response(raw.clone())?;

        Ok(MiddeskCreateBusinessResponse {
            raw_response: raw.into(),
            parsed_response: parsed,
        })
    }
}
