import React from 'react';
import styled, { css } from 'styled-components';

import ListItem from './components/list-item';
import useOnboardingConfigs from './hooks/use-onboarding-configs';

const List = () => {
  const { data } = useOnboardingConfigs();

  if (data) {
    return (
      <ListContainer>
        {data.map(onboardingConfig => (
          <ListItem key={onboardingConfig.id} data={onboardingConfig} />
        ))}
      </ListContainer>
    );
  }

  return null;
};

const ListContainer = styled.div`
  ${({ theme }) => css`
    table {
      margin-bottom: ${theme.spacing[7]}px;
    }
  `}
`;

export default List;
