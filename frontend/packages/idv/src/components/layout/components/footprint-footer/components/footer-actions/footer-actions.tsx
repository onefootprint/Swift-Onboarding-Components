import { FRONTPAGE_BASE_URL } from '@onefootprint/global-constants';
import { IcoCheckSmall16, IcoDotsHorizontal24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import {
  createOverlayBackground,
  Dropdown,
  Stack,
  Typography,
} from '@onefootprint/ui';
import i18n from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

type FooterActionsProps = {
  onWhatsThisClick?: () => void;
};

const FooterActions = ({ onWhatsThisClick }: FooterActionsProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'global.components.layout',
  });

  const handleLanguageChange = (newValue: string) => {
    i18n.changeLanguage(newValue);
  };

  i18n.languages = ['en', 'es'];
  const languageLabels = {
    en: 'English',
    es: 'Español',
  };

  return (
    <Dropdown.Root>
      <DropdownTrigger>
        <IcoDotsHorizontal24 />
      </DropdownTrigger>
      <DropdownContent align="end">
        <Stack direction="column" paddingBottom={2}>
          <Dropdown.Item onClick={onWhatsThisClick}>
            <Typography variant="caption-1" color="secondary" as="span">
              {t('whats-this')}
            </Typography>
          </Dropdown.Item>
          <Anchor
            href={`${FRONTPAGE_BASE_URL}/privacy-policy`}
            target="_blank"
            rel="noreferrer"
          >
            <Dropdown.Item onClick={event => event.stopPropagation()}>
              <Typography variant="caption-1" color="secondary" as="span">
                {t('privacy')}
              </Typography>
            </Dropdown.Item>
          </Anchor>
        </Stack>
        <LanguageList direction="column" paddingTop={2}>
          {i18n.languages.map(language => (
            <StyledItem
              key={language}
              onClick={() => handleLanguageChange(language)}
            >
              <Typography variant="caption-1" color="secondary" as="span">
                {languageLabels[language as keyof typeof languageLabels]}
              </Typography>
              {language === i18n.language && (
                <Stack align="center" justify="center">
                  <IcoCheckSmall16 color="tertiary" />
                </Stack>
              )}
            </StyledItem>
          ))}
        </LanguageList>
      </DropdownContent>
    </Dropdown.Root>
  );
};

const StyledItem = styled(Dropdown.Item)`
  ${({ theme }) => css`
    display: flex;
    justify-content: start;
    align-items: center;
    padding: ${theme.spacing[3]} ${theme.spacing[3]} ${theme.spacing[3]}
      ${theme.spacing[5]};
    border-radius: ${theme.borderRadius.default};
    background-color: ${theme.backgroundColor.primary};
    cursor: pointer;
    gap: ${theme.spacing[2]};

    &:hover {
      background-color: ${theme.backgroundColor.secondary};
    }
  `}
`;

const DropdownTrigger = styled(Dropdown.Trigger)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};

    &[data-state='open'] {
      ${createOverlayBackground('darken-1', 'senary')};
    }
  `}
`;

const Anchor = styled.a`
  text-decoration: none;
`;

const DropdownContent = styled(Dropdown.Content)`
  ${({ theme }) => css`
    min-width: fit-content;
    padding: ${theme.spacing[2]};
    border-radius: ${theme.borderRadius.default};
    background-color: ${theme.backgroundColor.primary};
    box-shadow: ${theme.elevation[3]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

const LanguageList = styled(Stack)`
  ${({ theme }) => css`
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: calc(-${theme.spacing[2]} / 2);
      width: calc(100% + ${theme.spacing[2]});
      height: ${theme.borderWidth[1]};
      border-top: ${theme.borderWidth[1]} dashed ${theme.borderColor.tertiary};
    }
  `}
`;

export default FooterActions;
