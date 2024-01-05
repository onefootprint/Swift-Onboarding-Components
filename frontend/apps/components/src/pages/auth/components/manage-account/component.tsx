import type { Spacings } from '@onefootprint/design-tokens';
import {
  IcoCheckSmall16,
  IcoEmail24,
  IcoFaceid16,
  IcoSmartphone24,
} from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Button, Stack, Typography } from '@onefootprint/ui';
import type { ComponentProps } from 'react';
import React from 'react';

import type { HeaderProps } from '../../types';

type ComponentTexts = {
  addDevice: string;
  change: string;
  cta: string;
  deviceAdded: string;
  headerSubtitle: string;
  headerTitle: string;
  verified: string;
  verify: string;
};

type Entry = {
  label: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  status: 'verified' | 'unverified';
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

const isVerified = (x: unknown): x is 'verified' => x === 'verified';

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
      {entryEmail ? (
        <ButtonTile
          type="button"
          disabled={isVerified(entryEmail.status)}
          onClick={entryEmail.onClick}
        >
          <FlexRow gap={3}>
            <IcoEmail24 />
            <Typography as="span" variant="label-3" color="primary">
              {entryEmail.label}
            </Typography>
          </FlexRow>
          <FlexRow gap={2}>
            <IcoCheckSmall16 color="quaternary" />
            <Typography as="span" variant="label-4" color="quaternary">
              {isVerified(entryEmail.status) ? texts.verified : texts.verify}
            </Typography>
          </FlexRow>
        </ButtonTile>
      ) : null}

      {entryPhone ? (
        <ButtonTile
          type="button"
          disabled={isVerified(entryPhone.status)}
          onClick={entryPhone.onClick}
        >
          <FlexRow gap={3}>
            <IcoSmartphone24 />
            <Typography as="span" variant="label-3" color="primary">
              {entryPhone.label}
            </Typography>
          </FlexRow>
          <FlexRow gap={2}>
            <Typography as="span" variant="label-4" color="accent">
              {isVerified(entryPhone.status) ? texts.verified : texts.verify}
            </Typography>
          </FlexRow>
        </ButtonTile>
      ) : null}
      {entryPasskey ? (
        <ButtonTile
          type="button"
          disabled={isVerified(entryPasskey.status)}
          onClick={entryPasskey.onClick}
        >
          <FlexRow gap={3}>
            <IcoFaceid16 />
            <Typography as="span" variant="label-3" color="primary">
              {entryPasskey.label}
            </Typography>
          </FlexRow>
          <FlexRow gap={2}>
            <Typography as="span" variant="label-4" color="accent">
              {isVerified(entryPasskey.status)
                ? texts.deviceAdded
                : texts.addDevice}
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
