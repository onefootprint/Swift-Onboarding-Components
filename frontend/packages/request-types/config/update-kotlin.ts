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

  // Replace the trailing comma with semicolon from the line containing "investor_profile.funding_sources"
  const trailingCommaRegex = /(investor_profile\.funding_sources.*?),$/gm;
  fileContent = fileContent.replace(trailingCommaRegex, '$1;');

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

const updateModernRawUserDataRequest = async (dir: string) => {
  const files = ['ModernRawUserDataRequest.kt', 'ModernUserDecryptResponse.kt', 'DataIdentifier.kt'];
  const basePath = 'src/commonMain/kotlin/org/openapitools/client/models/';

  files.forEach(async file => {
    const filePath = path.join(dir, basePath + file);
    let fileContent = await fs.readFile(filePath, 'utf8');

    const keywords = ['bank.', 'card.', 'custom.', 'document.', 'business.'];

    // Create a regular expression to match lines containing any of the keywords
    const regex = new RegExp(`.*(${keywords.join('|')}).*\\n?`, 'gi');

    // Replace matching lines with an empty string
    fileContent = fileContent
      .replace(regex, '')
      // Remove any consecutive empty lines
      .replace(/(\r?\n){2,}/g, '\n\n')
      .trim();
    await fs.writeFile(filePath, fileContent);
  });
};

const updateSdkArgs = async (dir: string) => {
  const verifyPath = path.join(dir, 'src/commonMain/kotlin/org/openapitools/client/models/sdkArgsVerifyV1.kt');
  const sdkPath = path.join(dir, 'src/commonMain/kotlin/org/openapitools/client/models/SdkArgs.kt');
  let fileContent = await fs.readFile(verifyPath, 'utf8');
  fileContent = fileContent.replace(/SdkArgsVerifyV1/g, 'SdkArgs');
  await fs.writeFile(sdkPath, fileContent);
};

const updateVerifyV1SdkArgs = async (dir: string) => {
  const verifyPath = path.join(dir, 'src/commonMain/kotlin/org/openapitools/client/models/VerifyV1SdkArgs.kt');
  let fileContent = await fs.readFile(verifyPath, 'utf8');
  fileContent = fileContent.replace(/userData: kotlin\.String\?/, 'userData: ModernUserDecryptResponse?');
  await fs.writeFile(verifyPath, fileContent);
};

export const updateKotlin = async (dir: string) => {
  await updateCollectedDataOption(dir);
  await updateDataIdentifierVarNaming(dir);
  await updateOnboardingRequirements(dir);
  await updateOnboardingRequirementSerializer(dir);
  await updateOnboardingRequirementCollectDocument(dir);
  await updateOnboardingRequirementDataClasses(dir);
  await updateModernRawUserDataRequest(dir);
  await updateSdkArgs(dir);
  await updateVerifyV1SdkArgs(dir);
};
