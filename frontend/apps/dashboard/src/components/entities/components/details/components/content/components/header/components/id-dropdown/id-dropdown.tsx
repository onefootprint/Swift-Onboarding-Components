import { IcoChevronDown16 } from '@onefootprint/icons';
import type { Entity } from '@onefootprint/types';
import { CopyButton, Dropdown, Stack, Text, createFontStyles, useToast } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { keyframes } from 'styled-components';

type IdDropdownProps = {
  entity: Entity;
};

const IdDropdown = ({ entity }: IdDropdownProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.entity.header.id-dropdown' });
  const toast = useToast();
  const IdArray = [
    {
      translation: t('footprint-id'),
      value: entity.id,
    },
    {
      translation: t('sandbox-id'),
      value: entity.sandboxId,
    },
    {
      translation: t('external-id'),
      value: entity.externalId,
    },
  ];

  const hasSingleId = IdArray.filter(item => item.value).length === 1;
  const mainId = hasSingleId ? IdArray.find(item => item.value) : IdArray[0];

  const handleCopy = (item: { translation: string; value: string | undefined }) => {
    navigator.clipboard.writeText(item.value || '');
    toast.show({
      title: t('copied'),
      description: `${item.translation} ${t('copied-to-clipboard')}`,
    });
  };

  return (
    <Container>
      <Main>
        {mainId?.value}
        <CopyButton size="small" tooltipPosition="top" contentToCopy={mainId?.value || ''} />
      </Main>
      {hasSingleId || (
        <Dropdown.Root>
          <ChevronContainer>
            <IcoChevronDown16 />
          </ChevronContainer>
          <DropdownContent sideOffset={4}>
            {IdArray.map(
              item =>
                item.value && (
                  <Item key={item.translation} onClick={() => handleCopy(item)}>
                    <Stack direction="column" gap={2}>
                      <Text variant="caption-2" color="tertiary">
                        {item.translation}
                      </Text>
                      <Text variant="snippet-2">{item.value}</Text>
                    </Stack>
                    <CopyButton contentToCopy={item.value || ''} size="small" />
                  </Item>
                ),
            )}
          </DropdownContent>
        </Dropdown.Root>
      )}
    </Container>
  );
};

const fadeInDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeOutUp = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-8px);
  }
`;

const DropdownContent = styled(Dropdown.Content)`
  animation: ${fadeInDown} 0.3s ease-out forwards;

  &[data-state='open'] {
    animation: ${fadeInDown} 0.05s ease-out forwards;
  }

  &[data-state='closed'] {
    animation: ${fadeOutUp} 0.05s ease-in forwards;
  }
`;

const Container = styled(Stack)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.full};
    display: flex;
    align-items: center;
    background-color: ${theme.backgroundColor.secondary};
  `}
`;

const Main = styled(Stack)`
  ${({ theme }) => css`
    ${createFontStyles('snippet-2')}
    padding: ${theme.spacing[2]} ${theme.spacing[3]} ${theme.spacing[2]} ${theme.spacing[4]};
    align-items: center;
    gap: ${theme.spacing[3]};
  `}
`;

const ChevronContainer = styled(Dropdown.Trigger)`
${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    height: 100%;
    padding: ${theme.spacing[2]} ${theme.spacing[3]} ${theme.spacing[2]} ${theme.spacing[2]};
    border-radius: 0 ${theme.borderRadius.full} ${theme.borderRadius.full} 0;

    &:hover {
       svg {
        path {
          fill: ${theme.color.tertiary};
        }
      }
    }
  `}
`;

const Item = styled(Dropdown.Item)`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.spacing[5]};
    padding: ${theme.spacing[4]} ${theme.spacing[4]};
  `}
`;

export default IdDropdown;
