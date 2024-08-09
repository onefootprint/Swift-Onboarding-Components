import { IcoChevronDown16 } from '@onefootprint/icons';
import { CodeInline, Stack, Text, createFontStyles } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

export type EnumProps = {
  enums: string[];
};

const THRESHOLD = 40;

const Enum = ({ enums }: EnumProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.api-reference' });
  const [expanded, setExpanded] = useState(() => enums.length < THRESHOLD);
  const shouldShowAllButton = enums.length > THRESHOLD;
  const items = expanded ? enums : enums.slice(0, THRESHOLD);

  const groupedItems = items.reduce((acc: string[][], item: string) => {
    const [first] = item.split('.');
    const groupElement = acc.find(group => group[0].startsWith(first));
    if (groupElement) {
      groupElement.push(item);
    } else {
      acc.push([item]);
    }
    return acc;
  }, []);

  return (
    <Container>
      <Text variant="body-4" color="tertiary">
        {t('allowed-values')}
      </Text>
      {groupedItems.map((group: string[]) => (
        <List flexWrap="wrap" marginBottom={2} marginTop={2}>
          {group.map((enumValue: string) => (
            <CodeInline size="compact" key={enumValue} disabled>
              {enumValue}
            </CodeInline>
          ))}
        </List>
      ))}
      <ButtonContainer expanded={expanded}>
        {shouldShowAllButton && (
          <ShowAllButton onClick={() => setExpanded(!expanded)}>
            {expanded ? t('show-less') : t('show-all')}
            <IconBounds expanded={expanded}>
              <IcoChevronDown16 color="tertiary" />
            </IconBounds>
          </ShowAllButton>
        )}
      </ButtonContainer>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: ${theme.spacing[2]};
    justify-content: flex-start;
    position: relative;
    overflow: hidden;
    transition: height 0.2s ease-in-out;
  `}
`;

const List = styled(Stack)`
  ${({ theme }) => css`
    ${createFontStyles('body-4')}
    color: ${theme.color.primary};
    gap: ${theme.spacing[2]};
  `}
`;

const ButtonContainer = styled.div<{ expanded: boolean }>`
  ${({ theme, expanded }) => css`
    position: ${expanded ? 'relative' : 'absolute'};
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding-top: ${expanded ? 0 : theme.spacing[5]};
    background: linear-gradient(
      180deg,
      ${theme.backgroundColor.transparent} 0%,
      ${theme.backgroundColor.primary} 50%,
      ${theme.backgroundColor.primary} 100%
    );
  `}
`;

const ShowAllButton = styled.button`
  ${({ theme }) => css`
    ${createFontStyles('body-4')}
    color: ${theme.color.secondary};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[1]};
    padding: ${theme.spacing[2]};
    border: none;
    background: none;
    cursor: pointer;

    &:hover {
      color: ${theme.color.primary};
      text-decoration: underline;
    }
  `}
`;

const IconBounds = styled.div<{ expanded: boolean }>`
  ${({ expanded }) => css`
    transition: all 0.2s ease-in-out;
    transform: rotate(${expanded ? '180deg' : '0deg'});
    display: flex;
    align-items: center;
    justify-content: center;
  `}
`;

export default Enum;
