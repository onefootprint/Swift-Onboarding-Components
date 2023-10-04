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
                accessor: 'assume',
                type: 'link',
                wrap: true, // just straight up doesnt work, love airplane
              },
              {
                accessor: 'user_dash',
                type: 'link',
                wrap: true,
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
                accessor: 'inc_link',
                type: 'link',
                wrap: true,
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
                accessor: 'response',
                type: 'string',
                wrap: true,
              },
              {
                accessor: 'ido_qualifiers',
                type: 'string',
                wrap: true,
              },
              {
                accessor: 'inc_link',
                type: 'link',
                wrap: true,
              },
              {
                accessor: 'ido_link',
                type: 'link',
                wrap: true,
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
