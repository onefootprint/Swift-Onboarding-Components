import {
  Stack,
  Table,
  useComponentState,
  TextInputState,
  TextInput,
  Label,
} from '@airplane/views';
import { useDebounce } from 'use-debounce';
import airplane from 'airplane';

const Customers = () => {
  const fpIdSearch = useComponentState<TextInputState>();
  const [fpId] = useDebounce(fpIdSearch.value, 500);

  return (
    <Stack>
      <TextInput id={fpIdSearch.id} label="Enter a fp_id:" />

      {fpId && (
        <Stack>
          <Table
            id="query_user"
            title="Basic Info (vault/scoped_vault/tenant)"
            defaultPageSize={25}
            task={{
              slug: 'query_user',
              params: {
                fp_id: fpId,
              },
            }}
            columns={[
              {
                accessor: 'tenant_id',
              },
              {
                accessor: 'tenant_name',
              },
              {
                accessor: 'assume',
                type: 'link',
                wrap: true, // just straight up doesnt work, love airplane
              },
              {
                accessor: 'user_dash',
                type: 'link',
                wrap: true,
              },
              {
                accessor: 'fp_id',
              },
              {
                accessor: 'sv_id',
              },
              {
                accessor: 'vault_id',
              },
              {
                accessor: 'sv_created_at',
              },
              {
                accessor: 'start_timestamp',
              },
              {
                accessor: 'is_live',
              },
              {
                accessor: 'status',
              },
              {
                accessor: 'v_id',
              },
              {
                accessor: 'v_created_at',
              },
              {
                accessor: 'is_portable',
              },
              {
                accessor: 'kind',
              },
              {
                accessor: 'is_fixture',
              },
              {
                accessor: 'sandbox_id',
              },
            ]}
          ></Table>
          <Table
            id="query_data"
            title="Data (date_lifetime/vault_data/contact_info/document_data)"
            defaultPageSize={25}
            task={{
              slug: 'query_data',
              params: {
                fp_id: fpId,
              },
            }}
            columns={[
              {
                accessor: 'scoped_vault_id',
              },
              {
                accessor: 'dl_id',
              },
              {
                accessor: 'created_at',
              },
              {
                accessor: 'portablized_at',
              },
              {
                accessor: 'deactivated_at',
              },
              {
                accessor: 'kind',
              },
              {
                accessor: 'source',
              },
              {
                accessor: 'vd_id',
              },
              {
                accessor: 'vd_kind',
              },
              {
                accessor: 'ci_id',
              },
              {
                accessor: 'is_verified',
              },
              {
                accessor: 'is_otp_verified',
              },
              {
                accessor: 'priority',
              },
              {
                accessor: 'dd_id',
              },
              {
                accessor: 'dd_kind',
              },
              {
                accessor: 'mime_type',
              },
              {
                accessor: 'filename',
              },
              {
                accessor: 's3_url',
              },
            ]}
          ></Table>
          <Table
            id="query_document"
            title="Documents (document_request/identity_document)"
            defaultPageSize={25}
            task={{
              slug: 'query_document',
              params: {
                fp_id: fpId,
              },
            }}
            columns={[
              {
                accessor: 'workflow_id',
              },
              {
                accessor: 'dr_id',
              },
              {
                accessor: 'ref_id',
              },
              {
                accessor: 'dr_created_at',
              },
              {
                accessor: 'should_collect_selfie',
              },
              {
                accessor: 'global_doc_types_accepted',
              },
              {
                accessor: 'country_restrictions',
              },
              {
                accessor: 'country_doc_type_restrictions',
              },
              {
                accessor: 'id_id',
              },
              {
                accessor: 'document_type',
              },
              {
                accessor: 'country_code',
              },
              {
                accessor: 'id_created_at',
              },
              {
                accessor: 'document_score',
              },
              {
                accessor: 'selfie_score',
              },
              {
                accessor: 'ocr_confidence_score',
              },
              {
                accessor: 'status',
              },
              {
                accessor: 'fixture_result',
              },
              {
                accessor: 'skip_selfie',
              },
              {
                accessor: 'device_type',
              },
            ]}
          ></Table>
          <Table
            id="query_incode_session"
            title="Incode session (incode_verification_session/incode_verification_session_event)"
            defaultPageSize={25}
            task={{
              slug: 'query_incode_session',
              params: {
                fp_id: fpId,
              },
            }}
            columns={[
              {
                accessor: 'ivse_id',
              },
              {
                accessor: 'ivse_created_at',
              },
              {
                accessor: 'incode_verification_session_state',
              },
              {
                accessor: 'latest_failure_reasons',
              },
              {
                accessor: 'ivs_id',
              },
              {
                accessor: 'ivs_created_at',
              },
              {
                accessor: 'ivs_state',
              },
              {
                accessor: 'completed_at',
              },
              {
                accessor: 'kind',
              },
              {
                accessor: 'latest_failure_reasons',
              },
              {
                accessor: 'incode_session_id',
              },
              {
                accessor: 'inc_link',
                type: 'link',
                wrap: true,
              },
              {
                accessor: 'incode_configuration_id',
              },
            ]}
          ></Table>
          <Table
            id="query_workflow"
            title="Workflow (workflow/workflow_event)"
            defaultPageSize={25}
            task={{
              slug: 'query_workflow',
              params: {
                fp_id: fpId,
              },
            }}
            columns={[
              {
                accessor: 'wfe_id',
              },
              {
                accessor: 'created_at',
              },
              {
                accessor: 'from_state',
              },
              {
                accessor: 'to_state',
              },
              {
                accessor: 'wf_id',
              },
              {
                accessor: 'created_at',
              },
              {
                accessor: 'completed_at',
              },
              {
                accessor: 'deactivated_at',
              },
              {
                accessor: 'kind',
              },
              {
                accessor: 'state',
              },
              {
                accessor: 'config',
              },
              {
                accessor: 'fixture_result',
              },
              {
                accessor: 'status',
              },
              {
                accessor: 'authorized_at',
              },
              {
                accessor: 'decision_made_at',
              },
              {
                accessor: 'ob_configuration_id',
              },
              {
                accessor: 'tenant_id',
              },
              {
                accessor: 'tenant',
              },
              {
                accessor: 'key',
              },
              {
                accessor: 'name',
              },
              {
                accessor: 'obc_is_live',
              },
              {
                accessor: 'obc_must_collect_data',
              },
              {
                accessor: 'obc_can_access_data',
              },
              {
                accessor: 'obc_optional_data',
              },
              {
                accessor: 'obc_enhanced_aml',
              },
              {
                accessor: 'obc_is_doc_first',
              },
              {
                accessor: 'obc_allow_international_residents',
              },
              {
                accessor: 'obc_international_country_restrictions',
              },
              {
                accessor: 'obc_doc_scan_for_optional_ssn',
              },
              {
                accessor: 'obc_skip_kyc',
              },
              {
                accessor: 'obc_is_no_phone_flow',
              },
            ]}
          ></Table>
          <Table
            id="query_vendor_calls"
            title="Vendor Calls (verification_request/verification_result/decision_intent)"
            defaultPageSize={25}
            task={{
              slug: 'query_vendor_calls',
              params: {
                fp_id: fpId,
              },
            }}
            columns={[
              {
                accessor: 'vreq_id',
              },
              {
                accessor: 'vreq_timestamp',
              },
              {
                accessor: 'vendor_api',
              },
              {
                accessor: 'is_error',
              },
              // Have to manually turn this off because Airplane is trash and JS-injects itself trying to render extremely basic json blobs
              // {
              //   accessor: 'response',
              //   type: 'string',
              //   wrap: true,
              // },
              {
                accessor: 'inc_link',
                type: 'link',
                wrap: true,
              },
              {
                accessor: 'exp_score',
              },
              {
                accessor: 'exp_matches',
              },
              {
                accessor: 'exp_error_code',
              },
              {
                accessor: 'exp_error_description',
              },
              {
                accessor: 'ido_results_key',
              },
              {
                accessor: 'ido_qualifiers',
                type: 'string',
                wrap: true,
              },
              {
                accessor: 'ido_link',
                type: 'link',
                wrap: true,
              },
              {
                accessor: 'vres_id',
              },
              {
                accessor: 'di_id',
              },
              {
                accessor: 'di_kind',
              },
              {
                accessor: 'wf_id',
              },
            ]}
          ></Table>
          <Table
            id="query_decision"
            title="Decisions (onboarding_decision)"
            defaultPageSize={25}
            task={{
              slug: 'query_decision',
              params: {
                fp_id: fpId,
              },
            }}
            columns={[
              {
                accessor: 'obd_id',
              },
              {
                accessor: 'created_at',
              },
              {
                accessor: 'status',
              },
              {
                accessor: 'actor',
              },
              {
                accessor: 'workflow_id',
              },
            ]}
          ></Table>
          <Table
            id="query_review"
            title="Reviews (manual_review)"
            defaultPageSize={25}
            task={{
              slug: 'query_review',
              params: {
                fp_id: fpId,
              },
            }}
            columns={[
              {
                accessor: 'mr_id',
              },
              {
                accessor: 'timestamp',
              },
              {
                accessor: 'completed_at',
              },
              {
                accessor: 'completed_by_actor',
              },
              {
                accessor: 'completed_by_decision_id',
              },
              {
                accessor: 'review_reasons',
              },
              {
                accessor: 'workflow_id',
              },
            ]}
          ></Table>
          <Table
            id="query_risk_signal"
            title="Risk Signals (risk_signal/risk_signal_group)"
            defaultPageSize={25}
            task={{
              slug: 'query_risk_signal',
              params: {
                fp_id: fpId,
              },
            }}
            columns={[
              {
                accessor: 'rsg_id',
              },
              {
                accessor: 'rsg_created_at',
              },
              {
                accessor: 'rsg_kind',
              },
              {
                accessor: 'rs_id',
              },
              {
                accessor: 'reason_code',
              },
              {
                accessor: 'vendor_api',
              },
              {
                accessor: 'verification_result_id',
              },
              {
                accessor: 'hidden',
              },
            ]}
          ></Table>
          <Table
            id="query_timeline"
            title="Timeline (user_timeline)"
            defaultPageSize={25}
            task={{
              slug: 'query_timeline',
              params: {
                fp_id: fpId,
              },
            }}
            columns={[
              {
                accessor: 'id',
              },
              {
                accessor: 'timestamp',
              },
              {
                accessor: 'event_kind',
              },
              {
                accessor: 'event',
              },
              {
                accessor: 'is_portable',
              },
            ]}
          ></Table>
          <Table
            id="query_tasks"
            title="Tasks (task/task_execution)"
            defaultPageSize={25}
            task={{
              slug: 'query_tasks',
              params: {
                fp_id: fpId,
              },
            }}
            columns={[
              {
                accessor: 'task_id',
              },
              {
                accessor: 'created_at',
              },
              {
                accessor: 'scheduled_for',
              },
              {
                accessor: 'status',
              },
              {
                accessor: 'num_attempts',
              },
              {
                accessor: 'kind',
              },
              {
                accessor: 'webhook_event',
              },
              {
                accessor: 'task_data',
              },
            ]}
          ></Table>
          <Table
            id="query_watchlist"
            title="Watchlist Checks (watchlist_check)"
            defaultPageSize={25}
            task={{
              slug: 'query_watchlist',
              params: {
                fp_id: fpId,
              },
            }}
            columns={[
              {
                accessor: 'wc_id',
              },
              {
                accessor: 'created_at',
              },
              {
                accessor: 'completed_at',
              },
              {
                accessor: 'deactivated_at',
              },
              {
                accessor: 'status',
              },
              {
                accessor: 'status_details',
              },
              {
                accessor: 'reason_codes',
              },
              {
                accessor: 'task_id',
              },
              {
                accessor: 'decision_intent_id',
              },
              {
                accessor: 'scoped_vault_id',
              },
            ]}
          ></Table>
        </Stack>
      )}
    </Stack>
  );
};

export default airplane.view(
  {
    slug: 'inspect_user',
    name: 'Inspect User',
    description: 'Inspect a user',
  },
  Customers,
);
