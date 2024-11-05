import themes from '@onefootprint/design-tokens';
import { DesignSystemProvider } from '@onefootprint/ui';

const StoryDecorator = Story => {
  return (
    <DesignSystemProvider theme={themes.light}>
      <Story />
    </DesignSystemProvider>
  );
};

export const decorators = [StoryDecorator];

const preview = {
  //👇 Enables auto-generated documentation for all stories
  tags: ['autodocs'],
};

export default preview;
