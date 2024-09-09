import { IcoCheckSmall24, IcoCloseSmall24 } from '@onefootprint/icons';
import { Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

export type SingleItemType = 'usResidents' | 'nonUSResidents' | 'investorProfile';

type SingleItemProps = {
  name: SingleItemType;
  value: boolean;
};

const SingleItem = ({ name, value }: SingleItemProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'details.data-collection' });

  const singleItemMap: Record<SingleItemType, { title: string; enabled: string; disabled: string }> = {
    usResidents: {
      title: t('us-residents.title'),
      enabled: t('us-residents.enabled'),
      disabled: t('us-residents.disabled'),
    },
    nonUSResidents: {
      title: t('non-us-residents.title'),
      enabled: t('non-us-residents.enabled'),
      disabled: t('non-us-residents.disabled'),
    },
    investorProfile: {
      title: t('investor_profile.title'),
      enabled: t('investor_profile.enabled'),
      disabled: t('investor_profile.disabled'),
    },
  };

  const item = singleItemMap[name];

  return (
    <Container>
      {item && <Text variant="label-3">{item.title}</Text>}
      <OptionsContainer>
        <OptionItem>
          {value ? <IcoCheckSmall24 /> : <IcoCloseSmall24 />}
          <Label variant="body-2">{value ? item.enabled : item.disabled}</Label>
        </OptionItem>
      </OptionsContainer>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[3]};
  `}
`;

const OptionsContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
  `}
`;

const OptionItem = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[3]};
    height: ${theme.spacing[7]};
    justify-content: flex-start;
    width: 100%;
  `}
`;

const Label = styled(Text)`
  white-space: nowrap;
  text-align: right;
`;

export default SingleItem;
