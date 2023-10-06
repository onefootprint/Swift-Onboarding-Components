import {
  Stack,
  Table,
  useComponentState,
  TextInputState,
  TextInput,
  DateTimePicker,
} from '@airplane/views';
import { useDebounce } from 'use-debounce';
import airplane from 'airplane';

const Onboardings = () => {
  const tenantSearch = useComponentState<TextInputState>();
  const [tenant] = useDebounce(tenantSearch.value, 500);

  const startDateTimeSearch = useComponentState('startDateTime');
  const [startDateTime] = useDebounce(startDateTimeSearch.value, 1000);
  const endDateTimeSearch = useComponentState('endDateTime');
  const [endDateTime] = useDebounce(endDateTimeSearch.value, 1000);

  const statusSearch = useComponentState<TextInputState>();
  const [status] = useDebounce(statusSearch.value, 500);

  return (
    <Stack>
      <TextInput
        id={tenantSearch.id}
        label="Enter a tenant_id or part of a tenant name (fuzzy matches)"
      />
      <DateTimePicker
        id="startDateTime"
        label="Start datetime"
        placeholder="leave blank for no filter on start time"
      />
      <DateTimePicker
        id="endDateTime"
        label="End datetime"
        placeholder="leave blank for no filter on end time"
      />
      <TextInput id={statusSearch.id} label="Enter a status to filter to" />
      <Stack>
        <Table
          id="query_onboardings"
          title="Recent onboardings (livemode only)"
          defaultPageSize={50}
          task={{
            slug: 'query_onboardings',
            params: {
              tenant: tenant,
              start_datetime: startDateTime,
              end_datetime: endDateTime,
              status: status,
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
            {
              accessor: 'bad_rs',
              type: 'json',
              wrap: true,
            },
          ]}
        ></Table>
      </Stack>
    </Stack>
  );
};

export default airplane.view(
  {
    slug: 'inspect_onboardings',
    name: 'Inspect Onboardings',
    description: 'Inspect recent onboardings, for a Tenant or for all Tenants',
  },
  Onboardings,
);
