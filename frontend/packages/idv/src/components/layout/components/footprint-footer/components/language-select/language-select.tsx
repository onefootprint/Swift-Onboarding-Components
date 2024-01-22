import { IcoCheckSmall16, IcoLang16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { createFontStyles, Typography } from '@onefootprint/ui';
import * as Select from '@radix-ui/react-select';
import React from 'react';

import type { LanguageSelectProps } from './language-select-types';
import { languageBaseList } from './language-select-types';

const LanguageSelect = ({
  languageList = languageBaseList,
  onLanguageChange,
  activeLanguage,
}: LanguageSelectProps) => {
  const handleLanguageChange = (lang: string) => {
    const selectedLanguage = languageList.find(
      language => language.code === lang,
    );
    if (selectedLanguage) {
      onLanguageChange(selectedLanguage);
    }
  };

  return (
    <Select.Root
      onValueChange={handleLanguageChange}
      value={activeLanguage.code}
    >
      <StyledTrigger>
        <IcoLang16 />
        <Typography variant="caption-1">{activeLanguage.name}</Typography>
      </StyledTrigger>
      <StyledContent sideOffset={8} position="popper" align="center">
        <Select.Group>
          {languageList.map(language => (
            <StyledItem key={language.code} value={language.code}>
              <Select.ItemText>{language.name}</Select.ItemText>
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
        border-radius: ${theme.borderRadius.compact};
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
    gap: ${theme.spacing[2]};
    padding: ${theme.spacing[2]} ${theme.spacing[2]} ${theme.spacing[2]}
      ${theme.spacing[3]};
    border-radius: ${theme.borderRadius.compact};
    cursor: pointer;

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
