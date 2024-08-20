import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils/mixins';
import type { BoxProps } from '../box';
import Box from '../box';
import LinkButton from '../link-button';
import Stack from '../stack';
import type { InlineAlertVariant } from './inline-alert.types';
import { createVariantStyles, getIconForVariant } from './inline-alert.utils';

export type InlineAlertProps = BoxProps & {
  variant: InlineAlertVariant;
  cta?: {
    label: string;
    onClick: () => void;
  };
};

const InlineAlert = ({ cta, children, variant = 'info', ...props }: InlineAlertProps) => {
  const IconComponent = getIconForVariant(variant);

  return (
    <InlineAlertContainer role="alert" $variant={variant} {...props}>
      <Stack marginRight={3}>
        <IconComponent color={variant} />
      </Stack>
      <Box>
        {children}
        {cta && (
          <LinkButton variant="label-3" onClick={cta.onClick} $paddingLeft={2} $paddingBottom={1}>
            {cta.label}
          </LinkButton>
        )}
      </Box>
    </InlineAlertContainer>
  );
};

const InlineAlertContainer = styled(Box)<{
  $variant: InlineAlertVariant;
}>`
  ${({ theme, $variant }) => css`
    ${createFontStyles('body-3')};
    ${createVariantStyles($variant)};
    border-radius: ${theme.borderRadius.default};
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[2]};
    padding: ${theme.spacing[4]} ${theme.spacing[5]};
    width: 100%;

    a,
    button {
      ${createFontStyles('label-3')};
      color: currentColor;
      background: unset;
      border: unset;
      cursor: pointer;
      text-decoration: underline;

      &:active {
        color: currentColor;
        opacity: 0.85;
      }

      @media (hover: hover) {
        &:hover {
          color: currentColor;
          opacity: 0.7;
        }
      }
    }
  `};
`;

export default InlineAlert;
