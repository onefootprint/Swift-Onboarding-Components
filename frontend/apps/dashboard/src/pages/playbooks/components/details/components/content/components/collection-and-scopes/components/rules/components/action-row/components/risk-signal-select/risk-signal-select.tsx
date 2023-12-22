import { useTranslation } from '@onefootprint/hooks';
import { IcoChevronDown16, IcoTrash16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import {
  Badge,
  Box,
  createFontStyles,
  createOverlayBackground,
  LinkButton,
  Typography,
} from '@onefootprint/ui';
import * as SelectPrimitive from '@radix-ui/react-select';
import React, { useMemo, useState } from 'react';

import useRiskSignals from './hooks/use-risk-signals';

type RiskSignalSelectProps = {
  value?: string;
  onDelete?: () => void;
  onChange: (value: string) => void;
};

const RiskSignalSelect = ({
  value,
  onDelete,
  onChange,
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
  const [selectedSignal, setSelectedSignal] = useState(value);

  return (
    <Box position="relative" display="inline-block">
      <SelectPrimitive.Root
        defaultValue={value}
        value={value}
        onValueChange={onChange}
      >
        <Trigger aria-label={t('aria-label')} type="button" asChild>
          <Badge variant="info" sx={{ gap: 2 }}>
            {selectedSignal || t('placeholder')}
            <IcoChevronDown16 color="info" />
          </Badge>
        </Trigger>
        <Content position="popper" sideOffset={4} align="end">
          <Header>
            <Typography variant="label-4">{t('title')}</Typography>
            <LinkButton
              size="tiny"
              variant="destructive"
              iconComponent={IcoTrash16}
              iconPosition="left"
              disabled={!onDelete}
              onClick={onDelete}
            >
              {t('delete')}
            </LinkButton>
          </Header>
          <Viewport>
            {options.map(option => (
              <Item
                key={option.value}
                value={option.value}
                textValue={option.label}
                onClick={() => setSelectedSignal(option.label)}
              >
                <Typography variant="body-4" sx={{ overflow: 'hidden' }}>
                  {option.label}
                </Typography>
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

export default RiskSignalSelect;

const Trigger = styled(SelectPrimitive.Trigger)`
  ${({ theme }) => css`
    ${createFontStyles('caption-1')};
    display: inline-flex;
    justify-content: center;
    align-items: center;
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    background-color: ${theme.backgroundColor.info};
    border-radius: ${theme.borderRadius.large};
    border: 0;
    color: ${theme.color.info};
    cursor: pointer;
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
    width: 360px;
    z-index: ${theme.zIndex.dropdown};
  `}
`;

const Viewport = styled(SelectPrimitive.Viewport)`
  ${({ theme }) => css`
    width: 100%;
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
