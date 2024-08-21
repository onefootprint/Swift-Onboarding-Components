import { Button, RadioSelect, Stack } from '@onefootprint/ui';
import type { ComponentProps } from 'react';
import type React from 'react';

import type { HeaderProps } from '../../types';

type RadioProps = ComponentProps<typeof RadioSelect>;
type TComponentProps = {
  children?: JSX.Element | null;
  Header: (props: HeaderProps) => JSX.Element;
  isCtaDisabled: boolean;
  isLoading: boolean;
  methodOptions: RadioProps['options'];
  methodSelected: string;
  onMethodChange: (value: string) => void;
  onSubmit: React.FormEventHandler<HTMLFormElement> | undefined;
  texts: {
    cta: string;
    headerSubtitle: string;
    headerTitle: string;
  };
};

const Component = ({
  children,
  Header,
  isCtaDisabled,
  isLoading,
  methodOptions,
  methodSelected,
  onMethodChange,
  onSubmit,
  texts,
}: TComponentProps) => (
  <form onSubmit={onSubmit}>
    <Stack direction="column" gap={6}>
      <Header subtitle={texts.headerSubtitle} title={texts.headerTitle} />
      <RadioSelect onChange={onMethodChange} options={methodOptions} size="compact" value={methodSelected} />
      <Button
        disabled={isCtaDisabled}
        fullWidth
        loading={isLoading}
        type="submit"
        size="large"
        data-dd-action-name="challenge:continue"
      >
        {texts.cta}
      </Button>
      {children}
    </Stack>
  </form>
);

export default Component;
