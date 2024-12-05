import path from 'path';
import fs from 'fs/promises';
import { camelCase } from 'lodash';

const updateCollectedDataOption = async (dir: string) => {
  const filePath = path.join(dir, 'src/commonMain/kotlin/org/openapitools/client/models/CollectedDataOption.kt');
  let fileContent = await fs.readFile(filePath, 'utf8');
  // Replace name("name") with person_name("name") in the content
  fileContent = fileContent.replace(/name\("name"\)/g, 'person_name("name")');
  await fs.writeFile(filePath, fileContent);
};

const updateDataIdentifierVarNaming = async (dir: string) => {
  const filePath = path.join(dir, 'src/commonMain/kotlin/org/openapitools/client/models/DataIdentifier.kt');

  let fileContent = await fs.readFile(filePath, 'utf8');

  fileContent = fileContent.replace(/\b\w*Period\w*\b/gi, match => {
    const updatedWord = match.replace(/Period|Star/gi, ''); // Remove "Period" and "Star"
    return camelCase(updatedWord); // Convert to camelCase
  });

  await fs.writeFile(filePath, fileContent);
};

const updateOnboardingRequirements = async (dir: string) => {
  const filePath = path.join(dir, 'src/commonMain/kotlin/org/openapitools/client/models/ApiOnboardingRequirement.kt');
  let fileContent = await fs.readFile(filePath, 'utf8');
  fileContent = fileContent.replace(
    '@SerialName(value = "requirement") @Required val requirement: OnboardingRequirement',
    `@SerialName(value = "requirement") 
    @Serializable(with = OnboardingRequirementSerializer::class)
    @Required val requirement: OnboardingRequirement`,
  );
  await fs.writeFile(filePath, fileContent);
};

const updateOnboardingRequirementSerializer = async (dir: string) => {
  const filePath = path.join(dir, 'src/commonMain/kotlin/org/openapitools/client/models/OnboardingRequirement.kt');

  const fileContent = await fs.readFile(path.join('config/kotlin/OnboardingRequirement.kt'), 'utf8');

  await fs.writeFile(filePath, fileContent);
};

const updateOnboardingRequirementDataClasses = async (dir: string) => {
  const basePath = 'src/commonMain/kotlin/org/openapitools/client/models/';

  const files = [
    'OnboardingRequirementAuthorize.kt',
    'OnboardingRequirementCollectBusinessData.kt',
    'OnboardingRequirementCollectData.kt',
    'OnboardingRequirementCollectDocument.kt',
    'OnboardingRequirementCollectInvestorProfile.kt',
    'OnboardingRequirementCreateBusinessOnboarding.kt',
    'OnboardingRequirementProcess.kt',
    'OnboardingRequirementRegisterAuthMethod.kt',
    'OnboardingRequirementRegisterPasskey.kt',
  ];

  files.forEach(async file => {
    const filePath = path.join(dir, basePath + file);
    let fileContent = await fs.readFile(filePath, 'utf8');

    fileContent = fileContent.replace(') {', '): OnboardingRequirement() {');

    await fs.writeFile(filePath, fileContent);
  });
};

const updateOnboardingRequirementCollectDocument = async (dir: string) => {
  const filePath = path.join(
    dir,
    'src/commonMain/kotlin/org/openapitools/client/models/OnboardingRequirementCollectDocument.kt',
  );
  let fileContent = await fs.readFile(filePath, 'utf8');
  fileContent = fileContent.replace(
    /^(\s*)(.*(config|upload_settings).*)$/gm, // Match lines with proper indentation
    (_, leadingWhitespace, line) => `${leadingWhitespace}// ${line.trim()}`, // Comment out with preserved indentation
  );

  await fs.writeFile(filePath, fileContent);
};

export const updateKotlin = async (dir: string) => {
  await updateCollectedDataOption(dir);
  await updateDataIdentifierVarNaming(dir);
  await updateOnboardingRequirements(dir);
  await updateOnboardingRequirementSerializer(dir);
  await updateOnboardingRequirementCollectDocument(dir);
  await updateOnboardingRequirementDataClasses(dir);
};
