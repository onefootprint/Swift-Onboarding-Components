import { IcoCheckSmall16, IcoLang16 } from '@onefootprint/icons';
import { Text, createFontStyles } from '@onefootprint/ui';
import * as Select from '@radix-ui/react-select';
import i18n from 'i18next';
import styled, { css } from 'styled-components';

type SupportedLanguage = 'en' | 'es';
const LanguageLabels: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Español',
};

const LanguageSelect = () => {
  // Add some basic safety to avoid breaking if we add a new language to the app
  // without updating the language labels dictionary above
  const allLanguages = Object.keys(LanguageLabels) as SupportedLanguage[];
  const language = i18n.language as SupportedLanguage;
  const label = LanguageLabels[language];
  if (!label) {
    return null;
  }

  const handleLanguageChange = (newValue: string) => {
    if (newValue === language) {
      // Performance optimization: No need to re-render the page if the lang didn't change
      return;
    }
    i18n.changeLanguage(newValue);
    document.documentElement.setAttribute('lang', newValue);
  };

  return (
    <Select.Root value={language} onValueChange={handleLanguageChange}>
      <StyledTrigger>
        <IcoLang16 color="secondary" />
        <Text variant="caption-1" color="secondary">
          {language.toUpperCase()}
        </Text>
      </StyledTrigger>
      <StyledContent sideOffset={8} position="popper" align="center">
        <Select.Group>
          {allLanguages.map(lng => (
            <StyledItem key={lng} value={lng}>
              <Select.ItemText>{LanguageLabels[lng]}</Select.ItemText>
              <IndicatorContainer>
                <IcoCheckSmall16 color="tertiary" />
              </IndicatorContainer>
            </StyledItem>
          ))}
        </Select.Group>
      </StyledContent>
    </Select.Root>
  );
};

const StyledTrigger = styled(Select.Trigger)`
  ${({ theme }) => css`
    all: unset;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[1]};
    cursor: pointer;

    &[data-state='open'] {
      &::after {
        content: '';
        position: absolute;
        top: calc(-${theme.spacing[2]} / 2);
        left: calc(-${theme.spacing[3]} / 2);
        width: calc(100% + ${theme.spacing[3]});
        height: calc(100% + ${theme.spacing[2]});
        z-index: -1;
        background-color: ${theme.backgroundColor.senary};
        border-radius: ${theme.borderRadius.sm};
      }
    }

    &:hover {
      p {
        text-decoration: underline;
        text-decoration-thickness: 1.5px;
      }
    }
  `}
`;

const StyledItem = styled(Select.Item)`
  ${({ theme }) => css`
    all: unset;
    ${createFontStyles('caption-1')}
    display: flex;
    align-items: center;
    justify-content: start;
    padding: ${theme.spacing[2]} ${theme.spacing[2]} ${theme.spacing[2]}
      ${theme.spacing[3]};
    border-radius: ${theme.borderRadius.sm};
    cursor: pointer;
    gap: ${theme.spacing[2]};

    &:hover {
      background-color: ${theme.backgroundColor.senary};
    }
  `}
`;

const StyledContent = styled(Select.Content)`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    box-shadow: ${theme.elevation[2]};
    overflow: hidden;
    z-index: ${theme.zIndex.sticky};
    padding: ${theme.spacing[2]};
  `}
`;

const IndicatorContainer = styled(Select.ItemIndicator)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default LanguageSelect;
