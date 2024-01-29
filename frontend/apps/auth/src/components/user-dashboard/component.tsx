import type { Spacings } from '@onefootprint/design-tokens';
import {
  IcoCheckSmall16,
  IcoEmail24,
  IcoFaceid16,
  IcoSmartphone24,
} from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Button, Shimmer, Stack, Typography } from '@onefootprint/ui';
import type { ComponentProps } from 'react';
import React from 'react';

import type { HeaderProps } from '@/src/types';

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
const Verified = ({ text }: { text: string }) => (
  <>
    <IcoCheckSmall16 color="quaternary" />
    <Typography as="span" variant="label-4" color="quaternary">
      {`${text} · `}
    </Typography>
  </>
);

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
        <ButtonTile type="button" onClick={entryEmail.onClick}>
          <FlexRow gap={3}>
            <IcoEmail24 />
            <Typography as="span" variant="label-3" color="primary">
              {entryEmail.label}
            </Typography>
          </FlexRow>
          <FlexRow gap={2}>
            {entryEmail.isVerified ? <Verified text={texts.verified} /> : null}
            <Typography as="span" variant="label-4" color="accent">
              {isEmpty(entryEmail.status) ? texts.add : texts.edit}
            </Typography>
          </FlexRow>
        </ButtonTile>
      ) : null}

      {entryPhone && entryPhone.isLoading ? <ButtonLoading /> : null}
      {entryPhone && !entryPhone.isLoading ? (
        <ButtonTile type="button" onClick={entryPhone.onClick}>
          <FlexRow gap={3}>
            <IcoSmartphone24 />
            <Typography as="span" variant="label-3" color="primary">
              {entryPhone.label}
            </Typography>
          </FlexRow>
          <FlexRow gap={2}>
            {entryPhone.isVerified ? <Verified text={texts.verified} /> : null}
            <Typography as="span" variant="label-4" color="accent">
              {isEmpty(entryPhone.status) ? texts.add : texts.edit}
            </Typography>
          </FlexRow>
        </ButtonTile>
      ) : null}

      {entryPasskey ? (
        <ButtonTile type="button" onClick={entryPasskey.onClick}>
          <FlexRow gap={3}>
            <IcoFaceid16 />
            <Typography as="span" variant="label-3" color="primary">
              {entryPasskey.label}
            </Typography>
          </FlexRow>
          <FlexRow gap={2}>
            <Typography as="span" variant="label-4" color="accent">
              {entryPasskey.isVerified ? texts.deviceAdded : texts.addDevice}
            </Typography>
          </FlexRow>
        </ButtonTile>
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

const ButtonTile = styled.button`
  ${({ theme }) => css`
    border: none;
    cursor: pointer;
    user-select: none;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    min-height: 48px;
    padding: ${theme.spacing[4]} ${theme.spacing[5]};
    border-radius: ${theme.borderRadius.default};
    background-color: ${theme.backgroundColor.secondary};
  `}
`;

const FlexRow = styled.div<{ gap: keyof Spacings }>`
  ${({ theme, gap }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: ${theme.spacing[gap]};
  `}
`;
