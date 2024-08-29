import { IcoEmail24, IcoFaceid24, IcoSmartphone24 } from '@onefootprint/icons';
import { Button, Shimmer, Stack } from '@onefootprint/ui';
import type { ComponentProps } from 'react';
import type React from 'react';

import type { HeaderProps } from '../../../../types';
import EditButton from './edit-button';

type ComponentTexts = {
  add: string;
  added: string;
  cta: string;
  edit: string;
  headerSubtitle: string;
  headerTitle: string;
  replace: string;
  verified: string;
};

type Entry = {
  isDisabled?: boolean;
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

const Component = ({ children, cta, entryEmail, entryPasskey, entryPhone, Header, texts }: Props) => (
  <>
    <Stack direction="column" marginBottom={7}>
      <Header subtitle={texts.headerSubtitle} title={texts.headerTitle} />
    </Stack>
    <Stack direction="column" gap={3} marginBottom={7}>
      {entryEmail?.isLoading ? <ButtonLoading /> : null}
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

      {entryPhone?.isLoading ? <ButtonLoading /> : null}
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

      {entryPasskey?.isLoading ? <ButtonLoading /> : null}
      {entryPasskey && !entryPasskey.isLoading ? (
        <EditButton
          isDisabled={entryPasskey?.isDisabled}
          label={entryPasskey.label}
          icon={IcoFaceid24}
          onClick={entryPasskey.onClick}
          isVerified={entryPasskey.isVerified}
          isEmpty={isEmpty(entryPasskey.status)}
          texts={{
            ...texts,
            verified: texts.added,
            edit: texts.replace,
          }}
        />
      ) : null}
    </Stack>
    <Button type="button" size="large" fullWidth loading={cta.isLoading} onClick={cta.onClick} variant={cta.variant}>
      {texts.cta}
    </Button>
    {children}
  </>
);

export default Component;
