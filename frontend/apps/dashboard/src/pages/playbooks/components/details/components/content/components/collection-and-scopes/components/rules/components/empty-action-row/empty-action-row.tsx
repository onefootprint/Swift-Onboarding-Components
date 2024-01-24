import { useRequestErrorToast } from '@onefootprint/hooks';
import { IcoPlusSmall16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import type { RuleAction, RuleField } from '@onefootprint/types';
import { RuleOp } from '@onefootprint/types';
import { Button, LinkButton, Stack, useToast } from '@onefootprint/ui';
import { createFontStyles } from '@onefootprint/ui/src/utils/mixins/mixins';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import OpBadge from 'src/components/rules-action-row/components/op-badge';
import RiskSignalSelect from 'src/components/rules-action-row/components/risk-signal-select';
import { useEffectOnce } from 'usehooks-ts';

import useAddRule from '../../hooks/use-add-rule';

export type EmptyActionRowProps = {
  playbookId: string;
  action: RuleAction;
  onClick: () => void;
};

const EmptyActionRow = ({
  playbookId,
  action,
  onClick,
}: EmptyActionRowProps) => {
  const { t } = useTranslation('common');
  const addMutation = useAddRule();
  const toast = useToast();
  const showRequestErrorToast = useRequestErrorToast();
  const emptyExpressions = [
    {
      field: '',
      op: RuleOp.eq,
      value: true,
    } as RuleField,
  ];
  const [expressions, setExpressions] = useState(emptyExpressions);

  const ref = useRef<HTMLDivElement>(null);
  useEffectOnce(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  const handleToggleOp = (index: number) => (newOp: RuleOp) => {
    setExpressions(currentExpressions => {
      const newExpressions = [...currentExpressions];
      newExpressions[index] = { ...newExpressions[index], op: newOp };
      return newExpressions;
    });
  };

  const handleChangeField = (index: number) => (nextValue: string) => {
    setExpressions(currentExpressions => {
      const newExpressions = [...currentExpressions];
      newExpressions[index] = { ...newExpressions[index], field: nextValue };
      return newExpressions;
    });
  };

  const handleDeleteField = (index: number) => {
    setExpressions(currentExpressions =>
      currentExpressions
        .slice(0, index)
        .concat(currentExpressions.slice(index + 1)),
    );
  };

  const handleAddField = () => {
    setExpressions(currentExpressions => [
      ...currentExpressions,
      { field: '', op: RuleOp.eq, value: true },
    ]);
  };

  const handleCancelAdd = () => {
    onClick();
  };

  const handleSaveAdd = () => {
    const fields = {
      action,
      rule_expression: expressions[expressions.length - 1].field
        ? expressions
        : expressions.slice(0, -1),
    };

    addMutation.mutate(
      { playbookId, fields },
      {
        onSuccess: () => {
          toast.show({
            description: t(
              'pages.playbooks.details.rules.action-row.success-toast.add-description',
            ),
            title: t(
              'pages.playbooks.details.rules.action-row.success-toast.title',
            ),
            variant: 'default',
          });
          onClick();
        },
        onError: showRequestErrorToast,
      },
    );
  };

  return (
    <RulesListEmptyItem
      ref={ref}
      role="row"
      aria-label={t(
        'pages.playbooks.details.rules.action-row.empty-aria-label',
      )}
    >
      <div>
        {t('pages.playbooks.details.rules.action-row.if')}
        {expressions.map(({ field, op }, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <React.Fragment key={`${index} ${field}`}>
            {index > 0 && t('pages.playbooks.details.rules.action-row.and')}
            <OpBadge
              defaultValue={op}
              isEditable
              onClick={handleToggleOp(index)}
            />
            <RiskSignalSelect
              value={field}
              onDelete={
                expressions.length > 1
                  ? () => handleDeleteField(index)
                  : undefined
              }
              onChange={handleChangeField(index)}
            />
          </React.Fragment>
        ))}
      </div>
      <Stack direction="column" gap={7}>
        <LinkButton
          size="xTiny"
          sx={{ width: 'fit-content' }}
          iconComponent={IcoPlusSmall16}
          iconPosition="left"
          disabled={expressions.some(expression => expression.field === '')}
          onClick={handleAddField}
        >
          {t('pages.playbooks.details.rules.action-row.add')}
        </LinkButton>
        <Stack align="center" justify="space-between">
          <Stack align="center" gap={3}>
            <Button
              size="small"
              onClick={handleSaveAdd}
              disabled={expressions.length === 1 && !expressions[0].field}
            >
              {t('save')}
            </Button>
            <Button size="small" variant="secondary" onClick={handleCancelAdd}>
              {t('cancel')}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </RulesListEmptyItem>
  );
};

const RulesListEmptyItem = styled(Stack)`
  ${({ theme }) => css`
    flex-direction: column;
    gap: ${theme.spacing[4]};
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    ${createFontStyles('body-4')}
    line-height: 240%;
  `}
`;

export default EmptyActionRow;
