import { IcoEmail24, IcoFaceid16, IcoSmartphone24 } from '@onefootprint/icons';
import { Button, Shimmer, Stack } from '@onefootprint/ui';
import type { ComponentProps } from 'react';
import React from 'react';

import type { HeaderProps } from '../../../../types';
import EditButton from './edit-button';

type ComponentTexts = {
  add: string;
  cta: string;
  deviceAdded: string;
  edit: string;
  headerSubtitle: string;
  headerTitle: string;
  verified: string;
};

type Entry = {
  isLoading: boolean;
  isVerified: boolean;
  label: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  status: 'empty' | 'set';
};

type Props = {
  children?: JSX.Element | null;
  entryEmail?: Entry;
  entryPasskey?: Entry;
  entryPhone?: Entry;
  Header: (props: HeaderProps) => JSX.Element;
  texts: ComponentTexts;
  cta: {
    isLoading: boolean;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    variant?: ComponentProps<typeof Button>['variant'];
  };
};

const isEmpty = (x: unknown): x is 'empty' => x === 'empty';

const ButtonLoading = () => <Shimmer height="48px" width="auto" />;

const Component = ({
  children,
  cta,
  entryEmail,
  entryPasskey,
  entryPhone,
  Header,
  texts,
}: Props) => (
  <>
    <Stack direction="column" marginBottom={7}>
      <Header subtitle={texts.headerSubtitle} title={texts.headerTitle} />
    </Stack>
    <Stack direction="column" gap={5} marginBottom={7}>
      {entryEmail && entryEmail.isLoading ? <ButtonLoading /> : null}
      {entryEmail && !entryEmail.isLoading ? (
        <EditButton
          label={entryEmail.label}
          icon={IcoEmail24}
          onClick={entryEmail.onClick}
          isVerified={entryEmail.isVerified}
          isEmpty={isEmpty(entryEmail.status)}
          texts={texts}
        />
      ) : null}

      {entryPhone && entryPhone.isLoading ? <ButtonLoading /> : null}
      {entryPhone && !entryPhone.isLoading ? (
        <EditButton
          label={entryPhone.label}
          icon={IcoSmartphone24}
          onClick={entryPhone.onClick}
          isVerified={entryPhone.isVerified}
          isEmpty={isEmpty(entryPhone.status)}
          texts={texts}
        />
      ) : null}

      {entryPasskey ? (
        <EditButton
          label={entryPasskey.label}
          icon={IcoFaceid16}
          onClick={entryPasskey.onClick}
          isVerified={entryPasskey.isVerified}
          isEmpty={isEmpty(entryPasskey.status)}
          texts={texts}
        />
      ) : null}
    </Stack>
    <Button
      type="button"
      size="large"
      fullWidth
      loading={cta.isLoading}
      onClick={cta.onClick}
      variant={cta.variant}
    >
      {texts.cta}
    </Button>
    {children}
  </>
);

export default Component;
