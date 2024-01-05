import { Button, RadioSelect, Stack } from '@onefootprint/ui';
import type { ComponentProps } from 'react';
import React from 'react';

import type { HeaderProps } from '../../types';

type RadioProps = ComponentProps<typeof RadioSelect>;
type MethodSelectComponentProps = {
  children?: JSX.Element | null;
  Header: (props: HeaderProps) => JSX.Element;
  isLoading: boolean;
  methodOptions: RadioProps['options'];
  methodSelected: string;
  onMethodChange: (value: string) => void;
  texts: {
    cta: string;
    headerSubtitle: string;
    headerTitle: string;
  };
};

const MethodSelectComponent = ({
  children,
  Header,
  isLoading,
  methodOptions,
  methodSelected,
  onMethodChange,
  texts,
}: MethodSelectComponentProps) => (
  <>
    <Stack direction="column" gap={6}>
      <Header subtitle={texts.headerSubtitle} title={texts.headerTitle} />
      <RadioSelect
        onChange={onMethodChange}
        options={methodOptions}
        size="compact"
        value={methodSelected}
      />
      <Button fullWidth loading={isLoading} type="submit">
        {texts.cta}
      </Button>
    </Stack>
    {children}
  </>
);

export default MethodSelectComponent;
