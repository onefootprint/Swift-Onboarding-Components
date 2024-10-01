import { WhatsThisContent } from '@onefootprint/idv';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { Box, createFontStyles } from '@onefootprint/ui';
import { Popover } from '@onefootprint/ui';
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
      <Popover.Trigger asChild>
        <Trigger>{t('links.what-is-this')}</Trigger>
      </Popover.Trigger>
      <Popover.Content maxWidth="400px" paddingRight={7} paddingBottom={7} paddingLeft={7}>
        <WhatsThisContent config={config} />
      </Popover.Content>
    </Popover.Root>
  );
};

const Trigger = styled(Box)`
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

export default WhatsThisPopover;
