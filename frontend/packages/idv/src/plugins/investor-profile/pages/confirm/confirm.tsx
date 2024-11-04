import { getErrorMessage } from '@onefootprint/request';
import { DocumentDI, InvestorProfileDI } from '@onefootprint/types';
import { useState } from 'react';

import { getLogger } from '@/idv/utils';
import { Button, Divider, LinkButton, Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { useUploadFile } from '../../../../queries';
import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';
import useSyncData from '../../hooks/use-sync-data';
import Declarations from '../declarations';
import Employment from '../employment/employment';
import FundingSources from '../funding-sources';
import Income from '../income';
import InvestmentGoals from '../investment-goals';
import NetWorth from '../net-worth';
import RiskTolerance from '../risk-tolerance';

type EmploymentStatus = 'employed' | 'unemployed' | 'retired' | 'student';

const { logError } = getLogger({ location: 'investor-profile-confirm' });

const Confirm = () => {
  const [state, send] = useInvestorProfileMachine();
  const { authToken, data, declarationFiles } = state.context;
  const { t } = useTranslation('idv', { keyPrefix: 'investor-profile.pages' });

  const [isEmploymentStatusOpen, setIsEmploymentStatusOpen] = useState(false);
  const [isAnnualIncomeOpen, setIsAnnualIncomeOpen] = useState(false);
  const [isNetWorthOpen, setIsNetWorthOpen] = useState(false);
  const [isFundingSourcesOpen, setIsFundingSourcesOpen] = useState(false);
  const [isInvestmentGoalsOpen, setIsInvestmentGoals] = useState(false);
  const [isRiskToleranceOpen, setIsRiskToleranceOpen] = useState(false);
  const [isDeclarationsOpen, setIsDeclarationsOpen] = useState(false);

  const { mutation: mutSyncData, syncData } = useSyncData();
  const uploadFileMutation = useUploadFile();
  const isLoading = mutSyncData.isPending || uploadFileMutation.isPending;

  const valueEmploymentStatus = data?.[InvestorProfileDI.employmentStatus] as EmploymentStatus | undefined;
  const valueOccupation = data?.[InvestorProfileDI.occupation];
  const valueEmployer = data?.[InvestorProfileDI.employer];
  const valueAnnualIncome = data?.[InvestorProfileDI.annualIncome];
  const valueNetWorth = data?.[InvestorProfileDI.netWorth];
  const listFundingSources = data?.[InvestorProfileDI.fundingSources];
  const listInvestmentGoals = data?.[InvestorProfileDI.investmentGoals];
  const valueRiskTolerance = data?.[InvestorProfileDI.riskTolerance];
  const listDeclarations = data?.[InvestorProfileDI.declarations];

  const handleConfirm = () => {
    syncData({
      authToken,
      data: state.context.data,
      onSuccess: () => {
        if (!declarationFiles?.length) {
          send({ type: 'confirmed' });
          return;
        }

        if (uploadFileMutation.isPending) return;
        uploadFileMutation.mutate(
          {
            file: declarationFiles[0],
            documentKind: DocumentDI.finraComplianceLetter,
            authToken: authToken ?? '',
          },
          {
            onSuccess: () => {
              send({ type: 'confirmed' });
            },
            onError: (error: unknown) => {
              const fileType = declarationFiles[0].type;
              logError(`Upload declarations files of type ${fileType}: ${getErrorMessage(error)}`, error);
            },
          },
        );
      },
      onError: (err: string) => {
        logError(`error vaulting data on investor profile declarations page: ${err}`, err);
      },
    });
  };

  return (
    <>
      <Container>
        {valueEmploymentStatus ? (
          <>
            <Stack direction="row" justify="space-between" alignItems="center" marginBottom={6}>
              <Text variant="label-2" isPrivate>
                {t('employment.title')}
              </Text>
              {!isEmploymentStatusOpen ? (
                <LinkButton
                  type="button"
                  onClick={() => setIsEmploymentStatusOpen(!isEmploymentStatusOpen)}
                  data-dd-action-name="investor-profile:edit-employment-status"
                >
                  {t('edit')}
                </LinkButton>
              ) : null}
            </Stack>
            {isEmploymentStatusOpen ? (
              <Employment
                onSuccess={() => setIsEmploymentStatusOpen(false)}
                renderFooter={(loading: boolean) => (
                  <Stack direction="row" justifyContent="end" gap={3}>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsEmploymentStatusOpen(!isEmploymentStatusOpen)}
                    >
                      {t('cancel')}
                    </Button>
                    <Button type="submit" loading={loading} disabled={loading} loadingAriaLabel={t('loading')}>
                      {t('save')}
                    </Button>
                  </Stack>
                )}
              />
            ) : (
              <>
                {valueEmploymentStatus ? (
                  <Stack flexDirection="column" data-dd-privacy="mask">
                    <Text tag="div" variant="label-3" color="tertiary">
                      {t('employment.employment-status.label')}
                    </Text>
                    <Text tag="div" variant="body-3" color="primary">
                      {t(`employment.employment-status.${valueEmploymentStatus}`)}
                    </Text>
                  </Stack>
                ) : null}
                {valueOccupation ? (
                  <Stack flexDirection="column" data-dd-privacy="mask" marginTop={7}>
                    <Text tag="div" variant="label-3" color="tertiary">
                      {t('employment.occupation.label')}
                    </Text>
                    <Text tag="div" variant="body-3" color="primary">
                      {valueOccupation}
                    </Text>
                  </Stack>
                ) : null}
                {valueEmployer ? (
                  <Stack flexDirection="column" data-dd-privacy="mask" marginTop={7}>
                    <Text tag="div" variant="label-3" color="tertiary">
                      {t('employment.employer.label')}
                    </Text>
                    <Text tag="div" variant="body-3" color="primary">
                      {valueEmployer}
                    </Text>
                  </Stack>
                ) : null}
              </>
            )}
            <Divider marginTop={7} marginBottom={7} />
          </>
        ) : null}
        {valueAnnualIncome ? (
          <>
            <Stack direction="row" justify="space-between" alignItems="center" marginBottom={6}>
              <Text variant="label-2" isPrivate>
                {t('income.title')}
              </Text>
              {!isAnnualIncomeOpen ? (
                <LinkButton
                  type="button"
                  onClick={() => setIsAnnualIncomeOpen(!isAnnualIncomeOpen)}
                  data-dd-action-name="investor-profile:edit-income"
                >
                  {t('edit')}
                </LinkButton>
              ) : null}
            </Stack>
            {isAnnualIncomeOpen ? (
              <Income
                onSuccess={() => setIsAnnualIncomeOpen(false)}
                renderFooter={(loading: boolean) => (
                  <Stack direction="row" justifyContent="end" gap={3}>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsAnnualIncomeOpen(!isAnnualIncomeOpen)}
                    >
                      {t('cancel')}
                    </Button>
                    <Button type="submit" loading={loading} disabled={loading} loadingAriaLabel={t('loading')}>
                      {t('save')}
                    </Button>
                  </Stack>
                )}
              />
            ) : (
              <Text tag="span" variant="body-3" color="primary" data-dd-privacy="mask">
                {t(`income.${valueAnnualIncome}`)}
              </Text>
            )}
            <Divider marginTop={7} marginBottom={7} />
          </>
        ) : null}
        {valueNetWorth ? (
          <>
            <Stack direction="row" justify="space-between" alignItems="center" marginBottom={6}>
              <Text variant="label-2" isPrivate>
                {t('net-worth.title')}
              </Text>
              {!isNetWorthOpen ? (
                <LinkButton
                  type="button"
                  onClick={() => setIsNetWorthOpen(!isNetWorthOpen)}
                  data-dd-action-name="investor-profile:edit-net-worth"
                >
                  {t('edit')}
                </LinkButton>
              ) : null}
            </Stack>
            {isNetWorthOpen ? (
              <NetWorth
                onSuccess={() => setIsNetWorthOpen(false)}
                renderFooter={(loading: boolean) => (
                  <Stack direction="row" justifyContent="end" gap={3}>
                    <Button type="button" variant="secondary" onClick={() => setIsNetWorthOpen(!isNetWorthOpen)}>
                      {t('cancel')}
                    </Button>
                    <Button type="submit" loading={loading} disabled={loading} loadingAriaLabel={t('loading')}>
                      {t('save')}
                    </Button>
                  </Stack>
                )}
              />
            ) : (
              <Text tag="span" variant="body-3" color="primary" data-dd-privacy="mask">
                {t(`net-worth.${valueNetWorth}`)}
              </Text>
            )}
            <Divider marginTop={7} marginBottom={7} />
          </>
        ) : null}
        {listFundingSources ? (
          <>
            <Stack direction="row" justify="space-between" alignItems="center" marginBottom={6}>
              <Text variant="label-2" isPrivate>
                {t('funding-sources.title')}
              </Text>
              {!isFundingSourcesOpen ? (
                <LinkButton
                  type="button"
                  onClick={() => setIsFundingSourcesOpen(!isFundingSourcesOpen)}
                  data-dd-action-name="investor-profile:edit-funding-sources"
                >
                  {t('edit')}
                </LinkButton>
              ) : null}
            </Stack>
            {isFundingSourcesOpen ? (
              <FundingSources
                onSuccess={() => setIsFundingSourcesOpen(false)}
                renderFooter={(loading: boolean) => (
                  <Stack direction="row" justifyContent="end" gap={3}>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsFundingSourcesOpen(!isFundingSourcesOpen)}
                    >
                      {t('cancel')}
                    </Button>
                    <Button type="submit" loading={loading} disabled={loading} loadingAriaLabel={t('loading')}>
                      {t('save')}
                    </Button>
                  </Stack>
                )}
              />
            ) : listFundingSources.length > 1 ? (
              listFundingSources.map(source => (
                <Text key={source} tag="div" variant="body-3" color="primary" data-dd-privacy="mask">
                  &#8226; {t(`funding-sources.${source}`)}
                </Text>
              ))
            ) : listFundingSources.length === 1 ? (
              <Text tag="span" variant="body-3" color="primary" data-dd-privacy="mask">
                {t(`funding-sources.${listFundingSources[0]}`)}
              </Text>
            ) : (
              <Text tag="span" variant="body-3" color="primary" data-dd-privacy="mask">
                {t('none')}
              </Text>
            )}
            <Divider marginTop={7} marginBottom={7} />
          </>
        ) : null}
        {listInvestmentGoals ? (
          <>
            <Stack direction="row" justify="space-between" alignItems="center" marginBottom={6}>
              <Text variant="label-2" isPrivate>
                {t('investment-goals.title')}
              </Text>
              {!isInvestmentGoalsOpen ? (
                <LinkButton
                  type="button"
                  onClick={() => setIsInvestmentGoals(!isInvestmentGoalsOpen)}
                  data-dd-action-name="investor-profile:edit-investment-goals"
                >
                  {t('edit')}
                </LinkButton>
              ) : null}
            </Stack>
            {isInvestmentGoalsOpen ? (
              <InvestmentGoals
                onSuccess={() => setIsInvestmentGoals(false)}
                renderFooter={(loading: boolean) => (
                  <Stack direction="row" justifyContent="end" gap={3}>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsInvestmentGoals(!isInvestmentGoalsOpen)}
                    >
                      {t('cancel')}
                    </Button>
                    <Button type="submit" loading={loading} disabled={loading} loadingAriaLabel={t('loading')}>
                      {t('save')}
                    </Button>
                  </Stack>
                )}
              />
            ) : listInvestmentGoals.length > 1 ? (
              listInvestmentGoals.map(goal => (
                <Text key={goal} tag="div" variant="body-3" color="primary" data-dd-privacy="mask">
                  &#8226; {t(`investment-goals.${goal}`)}
                </Text>
              ))
            ) : listInvestmentGoals.length === 1 ? (
              <Text tag="span" variant="body-3" color="primary" data-dd-privacy="mask">
                {t(`investment-goals.${listInvestmentGoals[0]}`)}
              </Text>
            ) : (
              <Text tag="span" variant="body-3" color="primary" data-dd-privacy="mask">
                {t('none')}
              </Text>
            )}
            <Divider marginTop={7} marginBottom={7} />
          </>
        ) : null}
        {valueRiskTolerance ? (
          <>
            <Stack direction="row" justify="space-between" alignItems="center" marginBottom={6}>
              <Text variant="label-2" isPrivate>
                {t('risk-tolerance.title')}
              </Text>
              {!isRiskToleranceOpen ? (
                <LinkButton
                  type="button"
                  onClick={() => setIsRiskToleranceOpen(!isRiskToleranceOpen)}
                  data-dd-action-name="investor-profile:edit-risk-tolerance"
                >
                  {t('edit')}
                </LinkButton>
              ) : null}
            </Stack>
            {isRiskToleranceOpen ? (
              <RiskTolerance
                onSuccess={() => setIsRiskToleranceOpen(false)}
                renderFooter={(loading: boolean) => (
                  <Stack direction="row" justifyContent="end" gap={3}>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsRiskToleranceOpen(!isRiskToleranceOpen)}
                    >
                      {t('cancel')}
                    </Button>
                    <Button type="submit" loading={loading} disabled={loading} loadingAriaLabel={t('loading')}>
                      {t('save')}
                    </Button>
                  </Stack>
                )}
              />
            ) : (
              <Text tag="span" variant="body-3" color="primary" data-dd-privacy="mask">
                {t(`risk-tolerance.${valueRiskTolerance}.label`)}
              </Text>
            )}
            <Divider marginTop={7} marginBottom={7} />
          </>
        ) : null}
        {listDeclarations ? (
          <>
            <Stack direction="row" justify="space-between" alignItems="flex-start" marginBottom={6}>
              <Text variant="label-2" isPrivate>
                {t('declarations.title')}
              </Text>
              {!isDeclarationsOpen ? (
                <LinkButton
                  type="button"
                  onClick={() => setIsDeclarationsOpen(!isDeclarationsOpen)}
                  data-dd-action-name="investor-profile:edit-declarations"
                >
                  {t('edit')}
                </LinkButton>
              ) : null}
            </Stack>
            {isDeclarationsOpen ? (
              <Declarations
                onSuccess={() => setIsDeclarationsOpen(false)}
                renderFooter={loading => (
                  <Stack direction="row" justifyContent="end" gap={3}>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsDeclarationsOpen(!isDeclarationsOpen)}
                    >
                      {t('cancel')}
                    </Button>
                    <Button type="submit" loading={loading} disabled={loading} loadingAriaLabel={t('loading')}>
                      {t('save')}
                    </Button>
                  </Stack>
                )}
              />
            ) : listDeclarations.length > 1 ? (
              listDeclarations.map(opt => (
                <Text key={opt} tag="div" variant="body-3" color="primary" data-dd-privacy="mask">
                  &#8226; {t(`declarations.options.${opt}`)}
                </Text>
              ))
            ) : listDeclarations.length === 1 ? (
              <Text tag="span" variant="body-3" color="primary" data-dd-privacy="mask">
                {t(`declarations.options.${listDeclarations[0]}`)}
              </Text>
            ) : (
              <Text tag="span" variant="body-3" color="primary" data-dd-privacy="mask">
                {t('none')}
              </Text>
            )}
          </>
        ) : null}
      </Container>
      <Button
        fullWidth
        type="button"
        size="large"
        loading={isLoading}
        disabled={isLoading}
        onClick={!isLoading ? handleConfirm : undefined}
        data-dd-action-name="investor-profile:confirm"
      >
        {t('confirm-continue')}
      </Button>
    </>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    width: 100%;
    border: 1px solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    padding: ${theme.spacing[6]};
    margin-bottom: ${theme.spacing[7]};
    display: flex;
    flex-direction: column;
  `}
`;

export default Confirm;
