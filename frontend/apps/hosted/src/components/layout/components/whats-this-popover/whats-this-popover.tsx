import { IcoClose16 } from '@onefootprint/icons';
import { WhatsThisContent } from '@onefootprint/idv';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { IconButton, Stack, createFontStyles } from '@onefootprint/ui';
import * as Popover from '@radix-ui/react-popover';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type WhatsThisPopoverProps = {
  config?: PublicOnboardingConfig;
};

const WhatsThisPopover = ({ config }: WhatsThisPopoverProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.layout.app-footer',
  });
  return (
    <Popover.Root>
      <Trigger>{t('links.what-is-this')}</Trigger>
      <PopoverContent sideOffset={8}>
        <Stack direction="row" align="center" height="52px" justify="start" marginLeft={3}>
          <CloseBounds asChild>
            <IconButton aria-label="close">
              <IcoClose16 />
            </IconButton>
          </CloseBounds>
        </Stack>
        <Stack paddingLeft={7} paddingRight={7} paddingBottom={7}>
          <WhatsThisContent config={config} />
        </Stack>
        <Popover.Arrow asChild>
          <StyledSvg width="16" height="8" viewBox="0 0 16 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0H0L8 8L16 0Z" fill="white" />
          </StyledSvg>
        </Popover.Arrow>
      </PopoverContent>
    </Popover.Root>
  );
};

const PopoverContent = styled(Popover.Content)`
  ${({ theme }) => css`
    max-width: 400px;
    background-color: ${theme.backgroundColor.primary};
    box-shadow: ${theme.elevation[3]};
    border-radius: ${theme.borderRadius.default};
    z-index: ${theme.zIndex.popover};
    position: relative;

    a {
      text-decoration: none;
    }
  `};
`;

const Trigger = styled(Popover.Trigger)`
  ${({ theme }) => css`
    all: unset;
    ${createFontStyles('caption-1')}
    color: ${theme.color.secondary};
    cursor: pointer;

    &:hover {
      text-decoration: underline;
      text-decoration-thickness: 1.5px;
      display: inline-block;
    }
  `}
`;

const CloseBounds = styled(Popover.Close)`
  all: unset;
`;

const StyledSvg = styled.svg`
  ${({ theme }) => css`
    elevation: ${theme.elevation[3]};
  `}
`;

export default WhatsThisPopover;
