const subProcess = require('child_process');

subProcess.exec(`token-transformer src/figma src/tokens/light.json`);
