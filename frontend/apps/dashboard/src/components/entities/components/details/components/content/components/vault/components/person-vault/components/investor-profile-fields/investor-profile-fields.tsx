import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import {
  DocumentDI,
  InvestorProfileDI,
  isVaultDataEmpty,
} from '@onefootprint/types';
import React from 'react';
import { FieldOrPlaceholder } from 'src/components';
import useEntityVaultWithTransforms from 'src/components/entities/hooks/use-entity-vault-with-transforms';
import createStringList, {
  createCapitalStringList,
} from 'src/utils/create-string-list';

import type { WithEntityProps } from '@/entity/components/with-entity';

import Field from '../../../field';
import FieldSection from './components/field-section';

type InvestorProfileFieldsProps = WithEntityProps;

const InvestorProfileFields = ({ entity }: InvestorProfileFieldsProps) => {
  const { t } = useTranslation('pages.user.vault.investor-profile');
  const { data } = useEntityVaultWithTransforms(entity.id, entity);
  const vaultData = data?.vault;

  return (
    <Grid>
      <Column>
        <FieldSection title={t('employment-status.title')}>
          <Field
            di={InvestorProfileDI.employmentStatus}
            entity={entity}
            renderValue={(value, isValueDecrypted) =>
              !isValueDecrypted ? (
                <FieldOrPlaceholder data={value} />
              ) : (
                <FieldOrPlaceholder
                  data={t(`employment-status.options.${value}`)}
                />
              )
            }
          />
        </FieldSection>
        <FieldSection title={t('occupation.title')}>
          <Field di={InvestorProfileDI.occupation} entity={entity} />
          <Field di={InvestorProfileDI.employer} entity={entity} />
        </FieldSection>
        <FieldSection title={t('annual-income.title')}>
          <Field
            di={InvestorProfileDI.annualIncome}
            entity={entity}
            renderValue={(value, isValueDecrypted) =>
              !isValueDecrypted ? (
                <FieldOrPlaceholder data={value} />
              ) : (
                <FieldOrPlaceholder
                  data={t(`annual-income.options.${value}`)}
                />
              )
            }
          />
        </FieldSection>
        <FieldSection title={t('net-worth.title')}>
          <Field
            di={InvestorProfileDI.netWorth}
            entity={entity}
            renderValue={(value, isValueDecrypted) =>
              !isValueDecrypted ? (
                <FieldOrPlaceholder data={value} />
              ) : (
                <FieldOrPlaceholder data={t(`net-worth.options.${value}`)} />
              )
            }
          />
        </FieldSection>
      </Column>
      <Separator />
      <Column>
        <FieldSection title={t('investment-goals.title')}>
          <Field
            di={InvestorProfileDI.investmentGoals}
            entity={entity}
            renderValue={value => {
              if (Array.isArray(value)) {
                return (
                  <FieldOrPlaceholder
                    data={createCapitalStringList(
                      value.map(option =>
                        t(`investment-goals.options.${option}`),
                      ),
                    )}
                  />
                );
              }
              return <FieldOrPlaceholder data={value} />;
            }}
          />
        </FieldSection>
        <FieldSection title={t('risk-tolerance.title')}>
          <Field
            di={InvestorProfileDI.riskTolerance}
            entity={entity}
            renderValue={(value, isValueDecrypted) =>
              !isValueDecrypted ? (
                <FieldOrPlaceholder data={value} />
              ) : (
                <FieldOrPlaceholder
                  data={t(`risk-tolerance.options.${value}`)}
                />
              )
            }
          />
        </FieldSection>
        <FieldSection title={t('declarations.title')}>
          <Field
            di={InvestorProfileDI.declarations}
            entity={entity}
            renderValue={value => {
              if (Array.isArray(value)) {
                if (value.length === 0) {
                  return (
                    <FieldOrPlaceholder data={t('declarations.options.none')} />
                  );
                }
                return (
                  <FieldOrPlaceholder
                    data={createCapitalStringList(
                      value.map(option => t(`declarations.options.${option}`)),
                    )}
                  />
                );
              }
              return <FieldOrPlaceholder data={value} />;
            }}
          />
          {isVaultDataEmpty(
            vaultData?.[InvestorProfileDI.brokerageFirmEmployer],
          ) ? null : (
            <Field
              di={InvestorProfileDI.brokerageFirmEmployer}
              entity={entity}
            />
          )}
          {isVaultDataEmpty(
            vaultData?.[InvestorProfileDI.seniorExecutiveSymbols],
          ) ? null : (
            <Field
              di={InvestorProfileDI.seniorExecutiveSymbols}
              entity={entity}
              renderValue={value => {
                if (Array.isArray(value)) {
                  return (
                    <FieldOrPlaceholder
                      data={createStringList(value as string[])}
                    />
                  );
                }
                return <FieldOrPlaceholder data={value} />;
              }}
            />
          )}
          {isVaultDataEmpty(
            vaultData?.[InvestorProfileDI.familyMemberNames],
          ) ? null : (
            <Field
              di={InvestorProfileDI.familyMemberNames}
              entity={entity}
              renderValue={value => {
                if (Array.isArray(value)) {
                  return (
                    <FieldOrPlaceholder
                      data={createStringList(value as string[])}
                    />
                  );
                }
                return <FieldOrPlaceholder data={value} />;
              }}
            />
          )}
          {isVaultDataEmpty(
            vaultData?.[InvestorProfileDI.politicalOrganization],
          ) ? null : (
            <Field
              di={InvestorProfileDI.politicalOrganization}
              entity={entity}
            />
          )}
          {isVaultDataEmpty(
            vaultData?.[DocumentDI.finraComplianceLetter],
          ) ? null : (
            <Field di={DocumentDI.finraComplianceLetter} entity={entity} />
          )}
        </FieldSection>
      </Column>
    </Grid>
  );
};

const Grid = styled.div`
  display: flex;
`;

const Column = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: ${theme.spacing[9]};
  `};
`;

const Separator = styled.div`
  ${({ theme }) => css`
    width: ${theme.borderWidth[1]};
    background: ${theme.borderColor.primary};
    margin: 0 ${theme.spacing[7]};
  `};
`;

export default InvestorProfileFields;
