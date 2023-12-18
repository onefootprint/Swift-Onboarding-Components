import { useTranslation } from '@onefootprint/hooks';
import { IcoChevronDown16, IcoTrash16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import {
  Box,
  createFontStyles,
  createOverlayBackground,
  LinkButton,
  Typography,
} from '@onefootprint/ui';
import * as SelectPrimitive from '@radix-ui/react-select';
import React, { useMemo } from 'react';

import useRiskSignals from './hooks/use-risk-signals';

type RiskSignalSelectProps = {
  value?: string;
  onChange: (value: string) => void;
  onDelete: () => void;
};

const RiskSignalSelect = ({
  value,
  onChange,
  onDelete,
}: RiskSignalSelectProps) => {
  const { t } = useTranslation(
    'pages.playbooks.details.rules.action-row.risk-signals-select',
  );
  const riskSignalsQuery = useRiskSignals();
  const options = useMemo(
    () =>
      riskSignalsQuery.data?.map(riskSignal => ({
        id: riskSignal.id,
        label: riskSignal.reasonCode,
        value: riskSignal.reasonCode,
        description: riskSignal.description,
      })) || [],
    [riskSignalsQuery.data],
  );

  return (
    <Box position="relative" display="inline-block">
      <SelectPrimitive.Root
        value={value}
        defaultValue={value}
        onValueChange={onChange}
      >
        <Trigger aria-label={t('aria-label')} type="button">
          <SelectPrimitive.Value placeholder={t('placeholder')} />
          <IcoChevronDown16 color="info" />
        </Trigger>
        <Content position="popper" sideOffset={4} align="end">
          <Header>
            <Typography variant="label-4">{t('title')}</Typography>
            <LinkButton
              iconComponent={IcoTrash16}
              iconPosition="left"
              onClick={onDelete}
              size="tiny"
              variant="destructive"
            >
              {t('delete')}
            </LinkButton>
          </Header>
          <Viewport>
            {options.map(option => (
              <Item
                value={option.value}
                key={option.value}
                textValue={option.label}
              >
                <Typography variant="body-4">{option.label}</Typography>
                <Typography variant="caption-4" color="tertiary">
                  {option.description}
                </Typography>
              </Item>
            ))}
          </Viewport>
        </Content>
      </SelectPrimitive.Root>
    </Box>
  );
};

const Trigger = styled(SelectPrimitive.Trigger)`
  ${({ theme }) => css`
    ${createFontStyles('caption-1')};
    align-items: center;
    background-color: ${theme.backgroundColor.info};
    border-radius: ${theme.borderRadius.large};
    border: 0;
    color: ${theme.color.info};
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
  `}
`;

const Header = styled.header`
  ${({ theme }) => css`
    align-items: center;
    background-color: ${theme.backgroundColor.secondary};
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    display: flex;
    height: 40px;
    justify-content: space-between;
    padding: 0 ${theme.spacing[5]};
  `}
`;

const Content = styled(SelectPrimitive.Content)`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    border: 1px solid ${theme.borderColor.tertiary};
    box-shadow: ${theme.elevation[2]};
    height: 350px;
    overflow: auto;
    width: 340px;
    z-index: ${theme.zIndex.dropdown};
  `}
`;

const Viewport = styled(SelectPrimitive.Viewport)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[3]};
    padding: ${theme.spacing[3]} 0;
  `}
`;

const Item = styled(SelectPrimitive.Item)`
  ${({ theme }) => css`
    padding: ${theme.spacing[2]} ${theme.spacing[5]};
    cursor: pointer;
    outline: none;

    @media (hover: hover) {
      :hover {
        ${createOverlayBackground('darken-1', 'primary')};
      }
    }
    :focus {
      ${createOverlayBackground('darken-1', 'primary')};
    }
  `}
`;

export default RiskSignalSelect;
