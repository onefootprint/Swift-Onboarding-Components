import { IcoChevronDown16 } from '@onefootprint/icons';
import type { Entity } from '@onefootprint/types';
import { CopyButton, Dropdown, Stack, Text, Tooltip, useToast } from '@onefootprint/ui';
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
        <Text variant="snippet-2">{mainId?.value}</Text>
        <CopyButton size="compact" tooltipPosition="top" contentToCopy={mainId?.value || ''} />
      </Main>
      {hasSingleId ? null : (
        <Dropdown.Root>
          <ChevronContainer>
            <IcoChevronDown16 className="chevronIcon" />
          </ChevronContainer>
          <Dropdown.Content sideOffset={4}>
            <Dropdown.Group>
              {ids.map(item => {
                return (
                  <Dropdown.Item height="56px" key={item.label} onClick={() => handleCopy(item)}>
                    <Tooltip text={t('copy-to-clipboard')}>
                      <Stack direction="column" gap={2}>
                        <Text variant="caption-2" color="tertiary">
                          {item.label}
                        </Text>
                        <Text variant="snippet-2">{item.value}</Text>
                      </Stack>
                    </Tooltip>
                  </Dropdown.Item>
                );
              })}
            </Dropdown.Group>
          </Dropdown.Content>
        </Dropdown.Root>
      )}
    </Container>
  );
};

const Container = styled(Stack)`
  ${({ theme }) => css`
    align-items: center;
    background-color: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.full};
    display: flex;
  `}
`;

const Main = styled(Stack)`
  ${({ theme }) => css`
    padding: ${theme.spacing[2]} ${theme.spacing[3]} ${theme.spacing[2]} calc(${theme.spacing[4]} - ${theme.spacing[1]});
    gap: ${theme.spacing[3]};
    align-items: center;
  `}
`;

const ChevronContainer = styled(Dropdown.Trigger)`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-left: ${theme.spacing[2]};
    width: fit-content;
    height: 100%;
    border-radius: 0 ${theme.borderRadius.full} ${theme.borderRadius.full} 0;
    width: ${theme.spacing[7]};
    position: relative;

    .chevronIcon {
      transition: transform 0.1s ease-in-out;
      transform: rotate(0deg);
    }

    &[data-state='open'] {
      background-color: ${theme.backgroundColor.secondary};
      .chevronIcon {
        transform: rotate(180deg);
      }
    }

    &:before {
      content: '';
      width: 1px;
      height: ${theme.spacing[4]};
      background-color: ${theme.borderColor.tertiary};
      position: absolute;
      top: 50%;
      left: 0;
      transform: translate(-50%, -50%);
    }
  `}
`;

export default IdDropdown;
