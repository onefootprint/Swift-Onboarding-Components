import { IcoInfo16 } from '@onefootprint/icons';
import { Box, Radio, Select, Tooltip } from '@onefootprint/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import useSandboxOutcomeOptions from '../../../../hooks/use-sandbox-outcome-options';

type SimulatedOutcomesProps = {
  onSelect: () => void;
  isSelected: boolean;
  allowRealOutcome?: boolean;
};

const SimulatedOutcomes = ({ onSelect, isSelected, allowRealOutcome }: SimulatedOutcomesProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'global.pages.sandbox-outcome.id-doc-outcome',
  });
  const {
    overallOutcomeOptions: { overallOutcomeSuccess },
    idDocOutcomeOptions: {
      simulatedOutcomeOptions: { idDocOutcomeSuccess, idDocOutcomeFail },
    },
  } = useSandboxOutcomeOptions();
  const { control, setValue, watch } = useFormContext();
  const watchIdDocOutcome = watch('outcomes.idDocOutcome');

  const options = [idDocOutcomeSuccess, idDocOutcomeFail];

  const handleOutcomeTypeChange = () => {
    onSelect();
    if (!isSelected) {
      setValue('outcomes.idDocOutcome', idDocOutcomeSuccess);
      setValue('outcomes.overallOutcome', overallOutcomeSuccess);
    }
  };

  return (
    <Container>
      {allowRealOutcome ? (
        <>
          <Box display="flex" gap={2} alignItems="center">
            <Controller
              control={control}
              name="outcomes.idDocOutcome"
              render={() => (
                <Radio label={t('simulated-outcome.title')} onChange={handleOutcomeTypeChange} checked={isSelected} />
              )}
            />
            <Tooltip text={t('simulated-outcome.description')} alignment="start" position="top">
              <IcoInfo16 />
            </Tooltip>
          </Box>
          {isSelected && (
            <DropdownOptionsContainer>
              <Controller
                control={control}
                name="outcomes.idDocOutcome"
                render={({ field }) => (
                  <Select
                    options={options}
                    disabled={!isSelected}
                    value={isSelected ? field.value : null}
                    onChange={field.onChange}
                    testID="simulatedOutcomeOptions"
                    placeholder="-"
                  />
                )}
              />
            </DropdownOptionsContainer>
          )}
        </>
      ) : (
        <RadioOptionsContainer data-testid="simulatedOutcomeOptions">
          {options.map(option => (
            <Radio
              key={option.value}
              label={option.label}
              value={option.value}
              testID={`overallOutcomeRadioOption-${option.value}`}
              onChange={() => {
                setValue('outcomes.idDocOutcome', option);
              }}
              checked={watchIdDocOutcome.value === option.value}
            />
          ))}
        </RadioOptionsContainer>
      )}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: start;
    gap: ${theme.spacing[4]};
  `}
`;

const DropdownOptionsContainer = styled.div`
  ${({ theme }) => css`
    padding-left: calc(${theme.spacing[5]} + ${theme.spacing[4]});
  `}
`;

const RadioOptionsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
  `}
`;

export default SimulatedOutcomes;
