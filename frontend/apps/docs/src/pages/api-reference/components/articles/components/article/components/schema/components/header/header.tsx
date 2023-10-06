import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { CodeInline, createFontStyles, Stack } from '@onefootprint/ui';
import React from 'react';

type HeaderProps = {
  title: string;
  type: string;
  isRequired?: boolean;
  isInBrackets?: boolean;
};

const Header = ({ title, type, isRequired, isInBrackets }: HeaderProps) => {
  const { t } = useTranslation('pages.api-reference');

  return (
    <StyledStack align="center" justify="flex-start" gap={3}>
      <Column isInBrackets={isInBrackets}>
        <CodeInline disabled>{title}</CodeInline>
        <Separator>·</Separator>
        <Type>{type}</Type>
      </Column>

      <Separator>·</Separator>
      {isRequired ? (
        <RequiredType data-required="true">{t('required')}</RequiredType>
      ) : (
        <RequiredType>{t('optional')}</RequiredType>
      )}
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

const Type = styled.div`
  ${({ theme }) => css`
    color: ${theme.color.secondary};
  `}
`;

const RequiredType = styled.div`
  ${({ theme }) => css`
    color: ${theme.color.quaternary};

    &[data-required='true'] {
      color: ${theme.color.warning};
    }
  `}
`;

export default Header;
