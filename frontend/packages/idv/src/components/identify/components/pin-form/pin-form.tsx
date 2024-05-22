import { PinInput, Stack, Text } from '@onefootprint/ui';
import type { ComponentProps } from 'react';
import React from 'react';
import styled, { css } from 'styled-components';

import { getLogger } from '../../../../utils/logger';
import InlineAction from '../inline-action';
import type { ResendButtonProps } from './components/resend-button';
import ResendButton from './components/resend-button';
import Success from './components/success';
import Verifying from './components/verifying';

type InlineActionProps = ComponentProps<typeof InlineAction>;
export type PinFormProps = Omit<ResendButtonProps, 'texts'> & {
  hasError?: boolean;
  isPending?: boolean;
  isSuccess?: boolean;
  isVerifying?: boolean;
  onComplete: (code: string) => void;
  title?: string;
  texts: ResendButtonProps['texts'] & {
    codeError: string;
    success: string;
    verifying: string;
  };
  tryOtherAction?: InlineActionProps;
};

const { logInfo } = getLogger({ location: 'pin-form' });

const PinForm = ({
  hasError,
  isPending,
  isResendLoading,
  isSuccess,
  isVerifying,
  onComplete,
  onResend,
  resendDisabledUntil,
  texts,
  title,
  tryOtherAction,
}: PinFormProps) => {
  if (isSuccess) return <Success text={texts.success} />;
  if (isVerifying) return <Verifying text={texts.verifying} />;

  return (
    <StyledForm
      autoComplete="off"
      role="presentation"
      data-pending={!!isPending}
    >
      {title && (
        <Text isPrivate variant="body-2" color="secondary" tag="h3">
          {title}
        </Text>
      )}
      <PinInput
        disabled={isPending}
        onComplete={onComplete}
        hasError={hasError}
        hint={hasError ? texts.codeError : undefined}
        testID="verification-form-pin-input"
        autoFocus
      />
      <Stack
        direction="column"
        width="100%"
        align="center"
        justify="center"
        gap={3}
        marginBottom={5}
      >
        <ResendButton
          isResendLoading={isResendLoading}
          onResend={onResend}
          resendDisabledUntil={resendDisabledUntil}
          texts={{
            resendCountDown: texts.resendCountDown,
            resendCta: texts.resendCta,
          }}
        />
        {tryOtherAction ? (
          <InlineAction
            isDisabled={tryOtherAction.isDisabled}
            label={tryOtherAction.label}
            labelCta={tryOtherAction.labelCta}
            onClick={ev => {
              logInfo('User clicked on try other action');
              tryOtherAction.onClick(ev);
            }}
          />
        ) : null}
      </Stack>
    </StyledForm>
  );
};

const StyledForm = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    justify-content: center;
    align-items: center;
    text-align: center;
  `}
`;

export default PinForm;
