import type { LogsEvent, LogsInitConfiguration } from '@datadog/browser-logs';
import { datadogLogs } from '@datadog/browser-logs';
import type { RumInitConfiguration } from '@datadog/browser-rum';
import { datadogRum } from '@datadog/browser-rum';

const { NODE_ENV } = process.env;
const VERCEL_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV;
const GIT_COMMIT_SHA = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
const IS_DDOG_ENABLED = process.env.NEXT_PUBLIC_IS_DDOG_ENABLED === 'true';
const rumPercentage = Number(process.env.NEXT_PUBLIC_DDOG_RUM_PERCENTAGE);
const DDOG_RUM_PERCENTAGE =
  Number.isNaN(rumPercentage) || rumPercentage < 0 || rumPercentage > 100
    ? 100
    : rumPercentage;

/**
 * For each application, we need to set the service name and application ID in the Datadog configuration.
 * 1. Include the applicationId in an ENV with a NEXT_PUBLIC_ prefix.
 * 2. Include ENV in turbo.json
 * 3. Include in the list below
 */
const appServiceMap: Record<
  string,
  { service: string; id?: string; token?: string }
> = {
  bifrost: {
    service: 'bifrost',
    id: process.env.NEXT_PUBLIC_DDOG_RUM_APPLICATION_BIFROST,
    token: process.env.NEXT_PUBLIC_DDOG_CLIENT_TOKEN_BIFROST,
  },
  handoff: {
    service: 'handoff',
    id: process.env.NEXT_PUBLIC_DDOG_RUM_APPLICATION_HANDOFF,
    token: process.env.NEXT_PUBLIC_DDOG_CLIENT_TOKEN_HANDOFF,
  },
  hosted: {
    service: 'hosted',
    id: process.env.NEXT_PUBLIC_DDOG_RUM_APPLICATION_HOSTED,
    token: process.env.NEXT_PUBLIC_DDOG_CLIENT_TOKEN_HOSTED,
  },
};

const shouldAvoidLog = (log?: string) =>
  [
    'A component is changing a controlled',
    'A component is changing an uncontrolled',
    'Google Maps Places API library must be loaded',
    'If you want to write it to the DOM, pass a string instead',
    'React does not recognize',
  ].some(str => log?.includes(str));

const initDataDogLogs = (config: LogsInitConfiguration): void => {
  // https://docs.datadoghq.com/logs/log_collection/javascript/#configuration
  datadogLogs.init({
    clientToken: config.clientToken,
    env: config.env,
    service: config.service,
    site: 'datadoghq.com', // `site` refers to the Datadog site parameter of your organization. see https://docs.datadoghq.com/getting_started/site/
    version: `${config.env}:${GIT_COMMIT_SHA}`, // Specify a version number to identify the deployed version of your application in Datadog.

    forwardErrorsToLogs: true, // Set to false to stop forwarding console.error logs, uncaught exceptions and network errors to Datadog.
    sessionSampleRate: 100, // The percentage of sessions to track: 100 for all, 0 for none. Only tracked sessions send logs.
    storeContextsAcrossPages: true, // Store global context and user context in localStorage to preserve them along the user navigation.
    beforeSend: (log: LogsEvent /* , context: LogsEventDomainContext */) => {
      // Discard 200 network logs
      if (log.http && log.http.status_code === 200) return false;

      if (shouldAvoidLog(log.message) || shouldAvoidLog(log.error?.message)) {
        return false;
      }

      return true;
    },
  });
};

const initDataDogRum = (config: RumInitConfiguration): void => {
  datadogRum.init({
    ...config,
    applicationId: config.applicationId, // The RUM application ID.
    clientToken: config.clientToken, // Client tokens are unique to your organization.
    env: config.env,
    service: config.service,
    site: 'datadoghq.com', // `site` refers to the Datadog site parameter of your organization. see https://docs.datadoghq.com/getting_started/site/
    version: `${config.env}:${GIT_COMMIT_SHA}`, // Specify a version number to identify the deployed version of your application in Datadog

    defaultPrivacyLevel: 'mask', // `mask`, `mask-user-input`, or `allow`
    sessionReplaySampleRate: DDOG_RUM_PERCENTAGE, // The percentage of tracked sessions with Browser RUM & Session Replay pricing features: 100 for all, 0
    sessionSampleRate: 100, // The percentage of sessions to track: 100 for all, 0 for none.
    trackLongTasks: true, // Enables collection of long task events.
    trackResources: true, // Enables collection of resource events.
    trackUserInteractions: true, // The trackUserInteractions parameter enables the automatic collection of user clicks in your application. Sensitive and private data contained in your pages may be included to identify the elements interacted with.
  });
};

const initDataDog = (appName: string): boolean => {
  const app = appServiceMap[appName];
  const isTest = NODE_ENV === 'test';
  const baseError = 'Datadog not initialized';

  if (isTest || !IS_DDOG_ENABLED) {
    console.warn(baseError);
    return false;
  }
  if (!app || !app.service || !app.id || !app.token) {
    console.warn(`${baseError}: ${appName} is not configured`);
    return false;
  }
  if (!VERCEL_ENV) {
    console.warn(`${baseError}: VERCEL_ENV is not defined`);
    return false;
  }

  const config = {
    clientToken: app.token,
    env: VERCEL_ENV,
    service: app.service,
  };

  initDataDogLogs(config);
  initDataDogRum({ ...config, applicationId: app.id });
  return true;
};

export const dataDogErrorEvent = (
  err: Error,
  msg = 'unhandledrejection',
  msgContext?: object,
) => datadogLogs.logger.error(msg, msgContext, err);

export const dataDogTrackEvent = (
  msg: string,
  msgContext?: object,
  err?: Error,
) => datadogLogs.logger.debug(msg, msgContext, err);

export const dataDogWarnEvent = (
  msg: string,
  msgContext?: object,
  err?: unknown,
) => {
  datadogLogs.logger.warn(
    msg,
    msgContext,
    err instanceof Error ? err : undefined,
  );
};

export const dataDogInfoEvent = (
  msg: string,
  msgContext?: object,
  err?: unknown,
) =>
  datadogLogs.logger.info(
    msg,
    msgContext,
    err instanceof Error ? err : undefined,
  );

export default initDataDog;
