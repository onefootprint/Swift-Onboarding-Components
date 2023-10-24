import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import {
  CodeInline,
  createFontStyles,
  Stack,
  Typography,
} from '@onefootprint/ui';
import React from 'react';

type HeaderProps = {
  title: string;
  type: string;
  isRequired?: boolean;
  isInBrackets?: boolean;
};

const Header = ({ title, type, isRequired, isInBrackets }: HeaderProps) => {
  const { t } = useTranslation('pages.api-reference');

  const typeLabel = !isRequired ? `${t('optional')} ${type}` : type;

  return (
    <StyledStack align="center" justify="flex-start" gap={3}>
      <Column isInBrackets={isInBrackets}>
        <CodeInline disabled>{title}</CodeInline>
        <Separator>·</Separator>
        <Typography variant="snippet-3" color="quaternary">
          {typeLabel}
        </Typography>
      </Column>
    </StyledStack>
  );
};

const StyledStack = styled(Stack)`
  ${({ theme }) => css`
    ${createFontStyles('snippet-2')}
    padding: ${theme.spacing[3]} 0;
    top: 0;
    z-index: 1;
    position: sticky;
    background: ${theme.backgroundColor.primary};
    top: 0;
  `}
`;

const Column = styled.div<{ isInBrackets?: boolean }>`
  ${({ theme, isInBrackets }) => css`
    align-items: center;
    color: ${theme.color.secondary};
    display: flex;
    gap: ${theme.spacing[2]};
    position: relative;

    ${isInBrackets &&
    css`
      &:before {
        content: '';
        background: ${theme.borderColor.tertiary};
        height: ${theme.borderWidth[1]};
        width: ${theme.spacing[4]};
        left: calc(-1 * ${theme.spacing[4]});
        position: absolute;
        transform: translateY(-50%);
        top: 50%;
      }
    `}
  `}
`;

const Separator = styled.span`
  ${({ theme }) => css`
    ${createFontStyles('label-3')}
    color: ${theme.color.secondary};
    padding: 0 ${theme.spacing[2]};
  `}
`;

export default Header;
