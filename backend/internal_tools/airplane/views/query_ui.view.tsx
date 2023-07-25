import {
  Stack,
  Table,
  Title,
  useComponentState,
  CodeInput,
  Card,
  Text,
  TextInput,
  Code,
  Button,
  useTaskQuery,
  useTaskMutation,
  Loader,
  Form,
  Select,
  Divider,
  Switch,
} from '@airplane/views';
import { useState } from 'react';
import airplane from 'airplane';

// Views documentation: https://docs.airplane.dev/views/getting-started
const QueryUI = () => {
  const query = useComponentState();
  const schemaToggle = useComponentState();

  let { error, output, loading, refetch } = useTaskQuery({
    slug: 'dbquery',
    params: { query: query.value },
    enabled: false,
  });

  return (
    <Stack spacing="xl">
      <Stack>
        <Title>Query UI</Title>

        <Stack direction="row" justify="end">
          <Button
            onClick={() => {
              refetch();
            }}
            disabled={loading}
          >
            {loading ? <Loader variant="dots" /> : <>Run Query</>}
          </Button>
          <Button
            preset="secondary"
            onClick={() => {
              query.setValue('select 1;');
              refetch();
            }}
          >
            Clear
          </Button>
        </Stack>

        <CodeInput
          id={query.id}
          label="Query"
          language="sql"
          theme="dark"
          lineNumbers
          foldGutter
          defaultValue={'select 1;'}
          disabled={loading}
        />

        {error ? (
          <Text color="error">{error.message}</Text>
        ) : (
          <Table title="Results" defaultPageSize={100} data={output ?? []} />
        )}

        <br></br>
        <Divider></Divider>
        <Stack direction="row" justify="end">
          <Switch id={schemaToggle.id} label="Schema" />
        </Stack>

        {schemaToggle.checked ? <SchemaDropdown></SchemaDropdown> : <></>}
      </Stack>
    </Stack>
  );
};

const SchemaDropdown = () => {
  const [table, setTable] = useState<string | null>(null);
  const { output, loading, error } = useTaskQuery({
    slug: 'dbquery',
    params: {
      query: `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';`,
    },
  });

  return (
    <Stack>
      <Select
        id="table_select"
        placeholder="Select a table to view it's schema"
        task={{
          slug: 'dbquery',
          params: {
            query: `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';`,
          },
        }}
        outputTransform={tables => {
          return tables.map(table => table.table_name);
        }}
        onChange={value => {
          if (value && typeof value === 'string') {
            setTable(value);
          }
        }}
      />
      {table ? <TableSchema tableName={table}></TableSchema> : <></>}
    </Stack>
  );
};
const TableSchema = ({ tableName }) => {
  return (
    <Table
      id="schema"
      title="Schema"
      defaultPageSize={25}
      task={{
        slug: 'dbquery',
        params: {
          query: `
          select column_name, data_type, character_maximum_length, column_default, is_nullable
          from INFORMATION_SCHEMA.COLUMNS where table_name = '${tableName}';`,
        },
      }}
    ></Table>
  );
};

export default airplane.view(
  {
    slug: 'query_ui',
    name: 'Query UI',
    description: 'Run database queries (read only)',
  },
  QueryUI,
);
