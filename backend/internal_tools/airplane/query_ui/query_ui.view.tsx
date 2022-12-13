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
} from '@airplane/views';
import { useState } from 'react';

// Views documentation: https://docs.airplane.dev/views/getting-started
const QueryUI = () => {
  const query = useComponentState();

  const { output, loading, error, mutate } = useTaskMutation({
    slug: 'dbquery',
    params: { query: query.value },
  });

  return (
    <Stack spacing="xl">
      <Stack>
        <Title>Query UI</Title>
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

        <Button
          onClick={() => {
            mutate();
          }}
          disabled={loading}
        >
          {loading ? <Loader variant="dots" /> : <>Run Query</>}
        </Button>

        {error ? (
          <Text color="error">{error.message}</Text>
        ) : (
          <Table title="Results" defaultPageSize={100} data={output ?? []} />
        )}
      </Stack>
    </Stack>
  );
};

export default QueryUI;
