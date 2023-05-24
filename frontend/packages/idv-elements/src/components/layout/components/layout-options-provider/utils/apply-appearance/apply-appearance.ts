import { FootprintAppearance } from '@onefootprint/footprint-js';

import createAppearanceRules from './utils/create-appearance-rules';
import createAppearanceVariables from './utils/create-appearance-variables';
import createStyle from './utils/create-style';

const applyAppearance = (
  appearance?: FootprintAppearance,
  fixContainerSizeAndPosition?: boolean,
) => {
  const { fontSrc, rules, variables } = appearance || {};
  if (fontSrc) {
    createStyle('footprint-custom-fonts', `@import url('${fontSrc}');`);
  }

  if (variables) {
    const css = createAppearanceVariables(variables);
    if (css) {
      const styles = `
          :root {
            ${css}
          }
        `;
      createStyle('footprint-variables', styles);
    }
  }

  if (rules) {
    const css = createAppearanceRules(rules, fixContainerSizeAndPosition);
    if (!css) return;
    createStyle('footprint-rules', css);
  }
};

export default applyAppearance;
