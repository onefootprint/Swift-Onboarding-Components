import { Text } from '@onefootprint/ui';
import NavigationSectionTitle from 'src/components/navigation-section-title';
import styled from 'styled-components';

import ApiNavigationScrollLink from '../components/api-navigation-scroll-link';
import NavigationScrollLink from '../components/navigation-scroll-link';
import { SubSection } from '../nav.types';

type SubsectionProps = {
  subsection: SubSection;
  onLinkClick?: () => void;
};

const Subsection = ({ subsection, onLinkClick }: SubsectionProps) => {
  const { title, id, apiArticles } = subsection;
  return (
    <Group key={title}>
      {id ? (
        <NavigationScrollLink id={id} onClick={onLinkClick}>
          <Text variant="body-3">{title}</Text>
        </NavigationScrollLink>
      ) : (
        <NavigationSectionTitle>{title}</NavigationSectionTitle>
      )}
      {apiArticles
        .filter(article => !article.api.isHidden)
        .map(article => (
          <ApiNavigationScrollLink article={article} onClick={onLinkClick} />
        ))}
    </Group>
  );
};

const Group = styled.div`
  & > span {
    width: 100%;
  }
`;

export default Subsection;
