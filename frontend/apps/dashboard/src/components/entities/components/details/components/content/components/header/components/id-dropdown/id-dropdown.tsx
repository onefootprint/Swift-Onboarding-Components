import { IcoChevronDown16 } from '@onefootprint/icons';
import type { Entity } from '@onefootprint/types';
import { CopyButton, Dropdown, Stack, Text, createFontStyles, useToast } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type IdDropdownProps = {
  entity: Entity;
};

const IdDropdown = ({ entity }: IdDropdownProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.entity.header.id-dropdown' });
  const toast = useToast();
  const ids = [
    {
      label: t('footprint-id'),
      value: entity.id,
    },
    {
      label: t('sandbox-id'),
      value: entity.sandboxId,
    },
    {
      label: t('external-id'),
      value: entity.externalId,
    },
  ].filter(item => item.value);

  const hasSingleId = ids.length === 1;
  const mainId = hasSingleId ? ids.find(item => item.value) : ids[0];

  const handleCopy = async (item: { label: string; value: string | undefined }) => {
    try {
      navigator.clipboard.writeText(item.value || '');
      toast.show({
        title: t('copied'),
        description: `${item.label} ${t('copied-to-clipboard')}`,
      });
    } catch (_) {
      // do nothing
    }
  };

  return (
    <Container>
      <Main>
        {mainId?.value}
        <CopyButton size="small" tooltipPosition="top" contentToCopy={mainId?.value || ''} />
      </Main>
      {hasSingleId ? null : (
        <Dropdown.Root>
          <ChevronContainer>
            <IcoChevronDown16 />
          </ChevronContainer>
          <Dropdown.Content sideOffset={4}>
            {ids.map(item => {
              return (
                <Item key={item.label} onClick={() => handleCopy(item)}>
                  <Stack direction="column" gap={2}>
                    <Text variant="caption-2" color="tertiary">
                      {item.label}
                    </Text>
                    <Text variant="snippet-2">{item.value}</Text>
                  </Stack>
                  <CopyButton contentToCopy={item.value || ''} size="small" />
                </Item>
              );
            })}
          </Dropdown.Content>
        </Dropdown.Root>
      )}
    </Container>
  );
};

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

const Item = styled(Dropdown.Item)`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.spacing[5]};
    padding: ${theme.spacing[4]} ${theme.spacing[4]};
    height: 62px;
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
      svg path {
        fill: ${theme.color.tertiary};
      }
    }
  `}
`;

export default IdDropdown;
