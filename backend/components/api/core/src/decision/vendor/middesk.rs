#![allow(clippy::too_many_arguments)]

use std::{collections::HashMap, sync::Arc};

use self::vendor_api::{
    loaders::load_response_for_vendor_api,
    vendor_api_struct::{MiddeskBusinessUpdateWebhook, MiddeskGetBusiness},
};

use super::{vendor_trait::VendorAPIResponse, *};

use crate::{
    config::Config,
    decision::{
        self,
        state::{actions::WorkflowActions, AsyncVendorCallsCompleted, WorkflowWrapper},
    },
    enclave_client::EnclaveClient,
    errors::{ApiError, AssertionError},
    utils::vault_wrapper::{Any, DataLifetimeSources, FingerprintedDataRequest, VaultWrapper},
    vendor_clients::VendorClient,
    State,
};
use db::{
    models::{
        billing_event::BillingEvent,
        data_lifetime::DataLifetime,
        decision_intent::DecisionIntent,
        middesk_request::{MiddeskRequest, UpdateMiddeskRequest},
        ob_configuration::ObConfiguration,
        risk_signal::{NewRiskSignalInfo, RiskSignal},
        risk_signal_group::RiskSignalGroup,
        verification_request::{VReqIdentifier, VerificationRequest},
        verification_result::VerificationResult,
        workflow::{Workflow, WorkflowUpdate},
    },
    DbError, DbPool,
};
use feature_flag::{BoolFlag, FeatureFlagClient};

use idv::middesk::{
    self,
    response::{
        business::BusinessResponse,
        webhook::{MiddeskBusinessUpdateWebhookResponse, MiddeskTinRetriedWebhookResponse},
    },
    MiddeskCreateBusinessRequest, MiddeskCreateBusinessResponse, MiddeskGetBusinessRequest,
    MiddeskGetBusinessResponse,
};

use idv::{ParsedResponse, VendorResponse};

use newtypes::{
    BillingEventKind, BusinessDataForRequest, BusinessDataKind, DataIdentifier, DataLifetimeSource,
    DataRequest, DecisionIntentKind, EinOnly, MiddeskRequestState, ObConfigurationKey, OnboardingStatus,
    PiiJsonValue, PiiString, RiskSignalGroupKind, TenantId, ValidateArgs, VendorAPI, VerificationCheck,
    VerificationCheckKind, WorkflowId,
};
use strum_macros::EnumDiscriminants;

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
    #[allow(unused)] // TODO: remove
    business_response_vres: VerificationResult,
}

#[derive(Debug, strum_macros::Display, EnumDiscriminants)]
#[strum_discriminants(name(MiddeskStatesKind), vis(pub), derive(strum_macros::Display))]
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
    #[error("Unexpected state: {0}, webhook_id: {1:?}, business_id: {2:?}")]
    UnexpectedState(MiddeskStatesKind, Option<String>, Option<String>),
    #[error("{0}")]
    StateInitError(String),
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
            .await?;

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
            return Err(MiddeskError::StateInitError("No Middesk vreq's found".into()).into());
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
            (MiddeskVendorApi::CreateBusiness, Some(_vres)) => Err(MiddeskError::StateInitError(
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
            (MiddeskVendorApi::TinRetriedWebhook, Some(_vres)) => Err(MiddeskError::StateInitError(
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
    pub async fn make_create_business_call(
        self,
        db_pool: &DbPool,
        config: &Config,
        enclave_client: &EnclaveClient,
        ff_client: Arc<dyn FeatureFlagClient>,
        middesk_client: VendorClient<
            MiddeskCreateBusinessRequest,
            MiddeskCreateBusinessResponse,
            idv::middesk::Error,
        >,
        tenant_id: &TenantId,
    ) -> Result<MiddeskState<AwaitingBusinessUpdateWebhook>, ApiError> {
        let vreq_id = self.state.create_business_vreq.id.clone();
        let wf_id = self.middesk_request.workflow_id;

        let obc = db_pool
            .db_query(move |conn| ObConfiguration::get(conn, &wf_id))
            .await?
            .0;

        let business_data = build_request::build_business_data_from_verification_request(
            db_pool,
            enclave_client,
            self.state.create_business_vreq.clone(),
        )
        .await?;

        let Some(VerificationCheck::Kyb { ein_only }) =
            obc.get_verification_check(VerificationCheckKind::Kyb)
        else {
            // todo make this into a proper variant
            return Err(AssertionError("no kyb check configured").into());
        };

        // Validate we have the appropriate data for the call we're making
        let business_data_for_request = BusinessDataForRequest::try_from((business_data, EinOnly(ein_only)))?;

        let obc_key = obc.key.clone();

        // based on the check we're performing... validate the data

        let res = send_middesk_call(
            db_pool,
            &middesk_client,
            ff_client,
            config,
            enclave_client,
            business_data_for_request,
            obc_key,
            tenant_id,
        )
        .await?;

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
        let di_id = self.state.create_business_vreq.decision_intent_id;
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
                    (&sv_id, &di_id, VendorAPI::MiddeskBusinessUpdateWebhook).into(),
                )?;
                Ok((udpated_middesk_request, business_update_webhook_vreq))
            })
            .await?;

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
        let di_id = webhook_vreq.decision_intent_id.clone();

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
                            (&sv_id, &di_id, VendorAPI::MiddeskTinRetriedWebhook).into(),
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
        let di_id = webhook_vreq.decision_intent_id.clone();
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
                let get_business_vreq = VerificationRequest::create(
                    conn,
                    (&sv_id, &di_id, VendorAPI::MiddeskGetBusiness).into(),
                )?;

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
        middesk_client: &VendorClient<
            MiddeskGetBusinessRequest,
            MiddeskGetBusinessResponse,
            idv::middesk::Error,
        >,
        config: &Config,
        enclave_client: &EnclaveClient,
    ) -> ApiResult<MiddeskStates> {
        let business_id = self
            .middesk_request
            .business_id
            .clone()
            .ok_or(DbError::ObjectNotFound)?;
        let wfid = self.middesk_request.workflow_id.clone();
        let middesk_request_id = self.middesk_request.id.clone();

        let (wf, sv) = db_pool
            .db_query(move |conn| Workflow::get_all(conn, &wfid))
            .await?;
        let tvc = TenantVendorControl::new(sv.tenant_id, db_pool, config, enclave_client).await?;
        let get_business_res = middesk_client
            .make_request(MiddeskGetBusinessRequest {
                business_id,
                credentials: tvc.middesk_credentials(),
            })
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
                let (_, uv) = Workflow::get_with_vault(conn, &wf.id)?;
                let vres = verification_result::save_verification_result(conn, &vr, &uv.public_key)?;

                let updated_middesk_request = MiddeskRequest::update(
                    conn,
                    middesk_request_id,
                    UpdateMiddeskRequest::set_state(MiddeskRequestState::Complete),
                )?;

                Ok((updated_middesk_request, vres))
            })
            .await?;

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
    pub async fn run_kyb_decisioning(self, state: &State) -> ApiResult<()> {
        let wfid = self.middesk_request.workflow_id.clone();
        let (v, sv, wf) = state
            .db_pool
            .db_query(move |conn| -> ApiResult<_> {
                let (_, v) = Workflow::get_with_vault(conn, &wfid)?;
                let (wf, sv) = Workflow::get_all(conn, &wfid)?;
                Ok((v, sv, wf))
            })
            .await?;

        let (business_response, vendor_api, vres_id) = match self.state.business_response_vreq.vendor_api {
            v_api @ VendorAPI::MiddeskGetBusiness => {
                let (res, vres_id) = load_response_for_vendor_api(
                    state,
                    VReqIdentifier::Id(self.state.business_response_vreq.id.clone()),
                    &v.e_private_key,
                    MiddeskGetBusiness,
                )
                .await?
                .ok()
                .ok_or(MiddeskError::AssertionError("No successful vres".into()))?;

                Ok((res, v_api, vres_id))
            }
            v_api @ VendorAPI::MiddeskBusinessUpdateWebhook => {
                let (resp, vres_id) = load_response_for_vendor_api(
                    state,
                    VReqIdentifier::Id(self.state.business_response_vreq.id.clone()),
                    &v.e_private_key,
                    MiddeskBusinessUpdateWebhook,
                )
                .await?
                .ok()
                .ok_or(MiddeskError::AssertionError("No successful vres".into()))?;


                let res = resp
                    .business_response()
                    .cloned()
                    .ok_or(MiddeskError::ResponseMissingExpectedData("business data".into()))?;

                Ok((res, v_api, vres_id))
            }
            _ => Err(MiddeskError::AssertionError("Unexpected VendorResult".into())),
        }?;

        let risk_signals: Vec<NewRiskSignalInfo> =
            decision::features::middesk::reason_codes(&business_response)
                .into_iter()
                .map(|rc| (rc, vendor_api, vres_id.clone()))
                .collect();


        // write data from the business response into the business vault
        // currently just: formation state/date
        let (dis_to_vault, vault_data_to_write) = {
            let formation = business_response.formation.as_ref();
            let data = vec![
                formation
                    .and_then(|f| f.formation_state.clone())
                    .map(|state| PiiJsonValue::from_piistring(PiiString::from(state)))
                    .map(|state| (DataIdentifier::Business(BusinessDataKind::FormationState), state)),
                formation
                    .and_then(|f| f.formation_date.clone())
                    .map(|date| PiiJsonValue::from_piistring(PiiString::from(date)))
                    .map(|date| (DataIdentifier::Business(BusinessDataKind::FormationDate), date)),
            ]
            .into_iter()
            .flatten()
            .collect::<HashMap<_, _>>();

            let dis = data.keys().cloned().collect::<Vec<_>>();

            let data = DataRequest::clean_and_validate(data, ValidateArgs::for_non_portable(sv.is_live))?;
            (dis, FingerprintedDataRequest::build(state, data, &sv.id).await?)
        };


        let obc_id = wf.ob_configuration_id.clone();
        state
            .db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let rsg = RiskSignalGroup::get_or_create(conn, &sv.id, RiskSignalGroupKind::Kyb)?;
                RiskSignal::bulk_add(conn, risk_signals, false, rsg.id)?;
                BillingEvent::create(conn, &sv.id, obc_id.as_ref(), BillingEventKind::Kyb)?;

                // note: there is an edge case here where the formation is null which
                // means we should deactivate the old DIs. We should handle this properly
                // with construct that knows when to clear vendor-written DIs like this
                if !vault_data_to_write.is_empty() {
                    // Clear all related data kinds
                    let seqno = DataLifetime::get_current_seqno(conn)?;
                    DataLifetime::bulk_deactivate_kinds(conn, &sv.id, dis_to_vault, seqno)?;

                    // Then add new vault data
                    let sources = DataLifetimeSources::single(DataLifetimeSource::Vendor);
                    let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &sv.id)?;

                    //TODO: we should probably store the resulting seqno somewhere on the vres?
                    let _ = uvw.patch_data(conn, vault_data_to_write, sources, None)?;
                }

                Ok(())
            })
            .await?;

        let ww = WorkflowWrapper::init(state, wf).await?;
        let _ww = ww
            .run(
                state,
                WorkflowActions::AsyncVendorCallsCompleted(AsyncVendorCallsCompleted {}),
            )
            .await?;
        Ok(())
    }
}

// Create middesk_request and vreq for POST /business call
pub async fn init_middesk_request(
    db_pool: &DbPool,
    wf_id: WorkflowId,
) -> ApiResult<MiddeskState<PendingCreateBusinessCall>> {
    let (middesk_request, create_business_vreq) = db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let wf = Workflow::lock(conn, &wf_id)?;
            // TODO should these state transitions be handled by the ww machines?
            let update = WorkflowUpdate::set_status(OnboardingStatus::Pending);
            let wf = Workflow::update(wf, conn, update)?;
            let sv_id = &wf.scoped_vault_id;

            let decision_intent = DecisionIntent::get_or_create_for_workflow(
                conn,
                sv_id,
                &wf_id,
                DecisionIntentKind::OnboardingKyb,
            )?;

            let vreq = VerificationRequest::create(
                conn,
                (sv_id, &decision_intent.id, VendorAPI::MiddeskCreateBusiness).into(),
            )?;

            let middesk_request = MiddeskRequest::create(
                conn,
                wf_id,
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
pub async fn handle_middesk_webhook(state: &State, res: serde_json::Value) -> Result<(), ApiError> {
    let webhook_res = middesk::response::webhook::parse_webhook(res.clone()).map_err(idv::Error::from)?;
    let business_id = webhook_res
        .business_id()
        .ok_or(MiddeskError::ResponseMissingExpectedData("business_id".into()))?;

    let middesk_request = state
        .db_pool
        .db_query(|conn| MiddeskRequest::get_by_business_id(conn, business_id))
        .await?;
    let mid_state = MiddeskStates::init(&state.db_pool, middesk_request).await?;

    let next_state = match (mid_state, webhook_res) {
        (
            MiddeskStates::AwaitingBusinessUpdateWebhook(s),
            middesk::response::webhook::MiddeskWebhookResponse::BusinessUpdate(b),
        ) => {
            s.handle_business_update_webhook_response(&state.db_pool, b, res)
                .await
        }
        (
            MiddeskStates::AwaitingTinRetry(s),
            middesk::response::webhook::MiddeskWebhookResponse::TinRetried(t),
        ) => {
            let mid_state = s.handle_tin_retried_response(&state.db_pool, t, res).await?;
            mid_state
                .make_get_business_call(
                    &state.db_pool,
                    &state.vendor_clients.middesk_get_business,
                    &state.config,
                    &state.enclave_client,
                )
                .await
        }
        (s, r) => Err(MiddeskError::UnexpectedState(s.into(), r.webhook_id(), r.business_id()).into()),
    }?;

    match next_state {
        MiddeskStates::Complete(c) => c.run_kyb_decisioning(state).await,
        _ => Ok(()),
    }
}

async fn send_middesk_call(
    db_pool: &DbPool,
    middesk_client: &VendorClient<
        MiddeskCreateBusinessRequest,
        MiddeskCreateBusinessResponse,
        idv::middesk::Error,
    >,
    ff_client: Arc<dyn FeatureFlagClient>,
    config: &Config,
    enclave_client: &EnclaveClient,
    business_data: BusinessDataForRequest,
    ob_configuration_key: ObConfigurationKey,
    tenant_id: &TenantId,
) -> ApiResult<MiddeskCreateBusinessResponse> {
    if config.service_config.is_production()
        || ff_client.flag(BoolFlag::EnableMiddeskInNonProd(&ob_configuration_key))
    {
        let tvc = TenantVendorControl::new(tenant_id.clone(), db_pool, config, enclave_client).await?;
        middesk_client
            .make_request(MiddeskCreateBusinessRequest {
                business_data,
                credentials: tvc.middesk_credentials(),
                tenant_id: tenant_id.clone(),
            })
            .await
            .map_err(|e| ApiError::from(idv::Error::from(e)))
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
        let parsed: BusinessResponse = idv::middesk::response::parse_response(raw.clone())
            .map_err(|e| ApiError::from(idv::Error::from(e)))?;

        Ok(MiddeskCreateBusinessResponse {
            raw_response: raw.into(),
            parsed_response: parsed,
        })
    }
}
