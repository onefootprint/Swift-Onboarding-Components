import { IcoFilter16 } from '@onefootprint/icons';
import { Button, Checkbox, Drawer, LinkButton, Stack, createFontStyles } from '@onefootprint/ui';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import useInitialSOSFilingsFilters from '../../hooks/use-initial-sos-filings-filters';
import useSOSFilingsFilters from '../../hooks/use-sos-filings-filters';

export type FormData = {
  states: string[];
};

type DrawerFilterProps = {
  states: string[];
};

const DrawerFilter = ({ states }: DrawerFilterProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.business-insights.sos-filings.filters',
  });
  const [open, setOpen] = useState(false);
  const filters = useSOSFilingsFilters();
  const { hasFilters } = filters;
  const { defaultValues, emptyValues } = useInitialSOSFilingsFilters();
  const methods = useForm<FormData>({
    defaultValues,
  });
  const { register, handleSubmit, reset } = methods;

  const openDrawer = () => {
    reset(defaultValues);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    reset(defaultValues);
  };

  const onSubmit = (formData: FormData) => {
    filters.push({ filings_states: [...formData.states] });
    close();
  };

  const handleReset = () => {
    reset(emptyValues);
    filters.push({
      filings_states: undefined,
    });
    close();
  };

  return (
    <>
      <DrawerTrigger onClick={openDrawer} data-checked={hasFilters}>
        <IcoFilter16 />
        {t('trigger')}
      </DrawerTrigger>
      <Drawer title={t('title')} open={open} onClose={close}>
        <FormProvider {...methods}>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Stack direction="column" justify="space-between" height="100%" gap={7}>
              <fieldset>
                <Legend>{t('states.label')}</Legend>
                <Stack direction="column" gap={3}>
                  {states.map(state => (
                    <Checkbox key={state} label={state} value={state} {...register('states')} />
                  ))}
                </Stack>
              </fieldset>
              <Footer justify="space-between" align="center" tag="footer">
                <LinkButton onClick={handleReset}>{t('reset')}</LinkButton>
                <Button type="submit">{t('cta')}</Button>
              </Footer>
            </Stack>
          </Form>
        </FormProvider>
      </Drawer>
    </>
  );
};

const DrawerTrigger = styled.button`
  ${({ theme }) => css`
    height: 32px;
    width: fit-content;
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    background: ${theme.backgroundColor.primary};
    border-color: ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    border-style: dashed;
    border-width: ${theme.borderWidth[1]};
    ${createFontStyles('label-4')};
    color: ${theme.color.secondary};
    cursor: pointer;
    display: flex;
    gap: ${theme.spacing[2]};
    align-items: center;
    transition: all 200ms ease-in-out;

    @media (hover: hover) {
      &:hover {
        background: ${theme.backgroundColor.secondary};
      }
    }

    &[data-checked='true'] {
      background: ${theme.backgroundColor.tertiary};
      border-color: transparent;
      color: ${theme.color.quinary};

      path {
        stroke: ${theme.color.quinary};
      }
    }
  `}
`;

const Form = styled.form`
  height: 100%;
  width: 100%;
`;

const Legend = styled.legend`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    margin-bottom: ${theme.spacing[5]};
  `}
`;

const Footer = styled(Stack)`
  ${({ theme }) => css`
    border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    margin: 0 -${theme.spacing[7]} -${theme.spacing[7]};
    padding: ${theme.spacing[4]} ${theme.spacing[7]};
  `}
`;

export default DrawerFilter;
