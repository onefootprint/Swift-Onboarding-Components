import { IcoEmail24, IcoFaceid16, IcoSmartphone24 } from '@onefootprint/icons';
import { Button, Shimmer, Stack } from '@onefootprint/ui';
import type { ComponentProps } from 'react';
import React from 'react';

import type { HeaderProps } from '@/src/types';

import EditDataButton from './components/edit-data-button/edit-data-button';

type ComponentTexts = {
  add: string;
  addDevice: string;
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
  status: 'empty' | 'set';
  onClick: React.MouseEventHandler<HTMLButtonElement>;
};

type ManageAccountComponentProps = {
  children?: JSX.Element | null;
  Header: (props: HeaderProps) => JSX.Element;
  entryEmail?: Entry;
  entryPasskey?: Entry;
  entryPhone?: Entry;
  texts: ComponentTexts;
  cta: {
    isLoading: boolean;
    variant?: ComponentProps<typeof Button>['variant'];
    onClick: React.MouseEventHandler<HTMLButtonElement>;
  };
};

const isEmpty = (x: unknown): x is 'empty' => x === 'empty';
const ButtonLoading = () => <Shimmer sx={{ width: 'auto', height: '48px' }} />;

const ManageAccountComponent = ({
  children,
  cta,
  entryEmail,
  entryPasskey,
  entryPhone,
  Header,
  texts,
}: ManageAccountComponentProps) => (
  <>
    <Stack direction="column" marginBottom={7}>
      <Header subtitle={texts.headerSubtitle} title={texts.headerTitle} />
    </Stack>
    <Stack direction="column" gap={5} marginBottom={7}>
      {entryEmail && entryEmail.isLoading ? <ButtonLoading /> : null}
      {entryEmail && !entryEmail.isLoading ? (
        <EditDataButton
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
        <EditDataButton
          label={entryPhone.label}
          icon={IcoSmartphone24}
          onClick={entryPhone.onClick}
          isVerified={entryPhone.isVerified}
          isEmpty={isEmpty(entryPhone.status)}
          texts={texts}
        />
      ) : null}

      {entryPasskey ? (
        <EditDataButton
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

export default ManageAccountComponent;
