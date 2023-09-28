import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { CodeInline, createFontStyles } from '@onefootprint/ui';
import React from 'react';

type HeaderProps = {
  title: string;
  type: string;
  isRequired?: boolean;
};

const Header = ({ title, type, isRequired }: HeaderProps) => {
  const { t } = useTranslation('pages.api-reference');

  return (
    <Container>
      <Column>
        <CodeInline disabled>{title}</CodeInline>
        <Separator>·</Separator>
        <Type>{type}</Type>
      </Column>
      {isRequired && <Required>{t('required')}</Required>}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('snippet-2')}
    background: ${theme.backgroundColor.primary};
    display: flex;
    justify-content: space-between;
    padding: ${theme.spacing[3]} 0;
    position: sticky;
    top: 0;
    z-index: 1;
  `}
`;

const Column = styled.div`
  ${({ theme }) => css`
    align-items: center;
    color: ${theme.color.secondary};
    display: flex;
    gap: ${theme.spacing[2]};
    position: relative;

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

const Required = styled.div`
  ${({ theme }) => css`
    color: ${theme.color.warning};
  `}
`;

export default Header;
