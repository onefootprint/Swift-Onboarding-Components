import { BusinessDI, CorporationType, type VaultValue } from '@onefootprint/types';
import { Form } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import EMPTY_SELECT_VALUE from '../../../../constants';
import editFormFieldName from '../utils/edit-form-field-name';

export type CorporationTypeSelectProps = {
  value: VaultValue;
};

const CorporationTypeSelect = ({ value }: CorporationTypeSelectProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.business.vault',
  });
  const { register } = useFormContext();
  const formField = editFormFieldName(BusinessDI.corporationType);

  const options = [
    { value: EMPTY_SELECT_VALUE, label: t('basic.select-corporation-type') },
    { value: CorporationType.agent, label: t('basic.corporation-type.agent') },
    { value: CorporationType.c_corporation, label: t('basic.corporation-type.c_corporation') },
    { value: CorporationType.s_corporation, label: t('basic.corporation-type.s_corporation') },
    { value: CorporationType.b_corporation, label: t('basic.corporation-type.b_corporation') },
    { value: CorporationType.llc, label: t('basic.corporation-type.llc') },
    { value: CorporationType.llp, label: t('basic.corporation-type.llp') },
    { value: CorporationType.non_profit, label: t('basic.corporation-type.non_profit') },
    { value: CorporationType.partnership, label: t('basic.corporation-type.partnership') },
    { value: CorporationType.sole_proprietorship, label: t('basic.corporation-type.sole_proprietorship') },
    { value: CorporationType.trust, label: t('basic.corporation-type.trust') },
    { value: CorporationType.unknown, label: t('basic.corporation-type.unknown') },
  ];

  return (
    <ValueContainer>
      <Form.Select
        data-dd-privacy="mask"
        defaultValue={(value as string) || EMPTY_SELECT_VALUE}
        {...register(formField)}
      >
        {options.map(corpType => (
          <option key={corpType.value} value={corpType.value}>
            {corpType.label}
          </option>
        ))}
      </Form.Select>
    </ValueContainer>
  );
};

const ValueContainer = styled.div`
  ${({ theme }) => css`
    height: ${theme.spacing[8]};
    max-width: 278px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    flex: 1;
  `};
`;

export default CorporationTypeSelect;
