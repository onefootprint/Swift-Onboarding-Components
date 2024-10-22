import { IcoChevronDown16 } from '@onefootprint/icons';
import { Stack } from '@onefootprint/ui';

type BaseTriggerProps = {
  open: boolean;
  value?: string;
  placeholder?: string;
};

const BaseTrigger = ({ value, placeholder, open }: BaseTriggerProps) => {
  return (
    <>
      {value || placeholder}
      <Stack
        align="center"
        justify="center"
        style={{
          transform: open ? 'rotate(180deg)' : undefined,
          transition: 'transform 0.1s ease-in-out',
        }}
      >
        <IcoChevronDown16 />
      </Stack>
    </>
  );
};

export default BaseTrigger;
