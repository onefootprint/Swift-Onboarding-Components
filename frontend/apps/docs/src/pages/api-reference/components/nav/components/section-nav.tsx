import { Box, Text } from '@onefootprint/ui';

import { PageNavSection } from '../nav.types';
import NavigationScrollLink from './navigation-scroll-link';

type SubsectionProps = {
  section: PageNavSection;
  onLinkClick?: () => void;
};

const Section = ({ section, onLinkClick }: SubsectionProps) => {
  const { title, id, subsections } = section;
  return (
    <Box>
      {id ? (
        <NavigationScrollLink id={id} onClick={onLinkClick}>
          <Text variant="body-3">{title}</Text>
        </NavigationScrollLink>
      ) : (
        <Box paddingLeft={4} paddingRight={4} paddingTop={3} paddingBottom={3}>
          <Text variant="body-3">{title}</Text>
        </Box>
      )}
      {subsections.map(subsection => (
        <Box marginLeft={3}>
          <NavigationScrollLink id={subsection.id} onClick={onLinkClick}>
            <Text variant="body-4" color="tertiary">
              {subsection.title}
            </Text>
          </NavigationScrollLink>
        </Box>
      ))}
    </Box>
  );
};

export default Section;
