import { IcoFootprint16 } from '@onefootprint/icons';
import { createFontStyles } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

const Footer = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.cmdk.footer',
  });
  return (
    <Container>
      <IcoFootprint16 />
      <Instructions>
        <Instruction>
          {t('navigate-up')}
          <KeyCap>↑</KeyCap>
        </Instruction>
        <Instruction>
          {t('navigate-down')}
          <KeyCap>↓</KeyCap>
        </Instruction>
        <Instruction>
          {t('trigger-action')}
          <KeyCap>↩</KeyCap>
        </Instruction>
      </Instructions>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: ${theme.backgroundColor.secondary};
    border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    padding: 10px ${theme.spacing[5]};
  `}
`;

const Instructions = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    align-items: center;
    gap: ${theme.spacing[4]};
  `}
`;

const Instruction = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('caption-2')}
    color: ${theme.color.tertiary};
    display: flex;
    align-items: center;
    gap: ${theme.spacing[3]};

    &:not(:last-child) {
      &::after {
        content: '';
        display: block;
        width: 1px;
        height: 12px;
        background-color: ${theme.borderColor.primary};
      }
    }
  `}
`;

const KeyCap = styled.span`
  ${({ theme }) => css`
    ${createFontStyles('caption-3')}
    color: ${theme.color.tertiary};
    background-color: ${theme.backgroundColor.senary};
    width: ${theme.spacing[6]};
    height: ${theme.spacing[6]};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: ${theme.borderRadius.sm};
  `}
`;

export default Footer;
