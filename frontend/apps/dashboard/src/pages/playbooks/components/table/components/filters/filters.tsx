import { Stack, Toggle } from '@onefootprint/ui';

const Filters = () => {
  return (
    <Stack>
      <Toggle label="Hide disabled playbooks" checked={false} onChange={e => console.log(e)} />
    </Stack>
  );
};

export default Filters;
