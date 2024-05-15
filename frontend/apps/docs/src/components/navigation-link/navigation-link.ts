import { createFontStyles } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

const NavigationLink = styled.div<{ $isSelected?: boolean }>`
  ${({ theme, $isSelected }) => css`
    ${createFontStyles('body-4')};
    border-radius: ${theme.borderRadius.default};
    display: block;
    margin-bottom: ${theme.spacing[2]};
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    text-decoration: none;
    color: ${$isSelected ? theme.color.primary : theme.color.tertiary};
    background-color: ${$isSelected
      ? theme.backgroundColor.secondary
      : 'transparent'};

    &:hover {
      background-color: ${!$isSelected && theme.backgroundColor.secondary};
    }
  `}
`;

export default NavigationLink;
