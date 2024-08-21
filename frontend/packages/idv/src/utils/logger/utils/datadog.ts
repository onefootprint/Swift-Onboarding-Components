import type { LogsEvent } from '@datadog/browser-logs';
import { datadogLogs } from '@datadog/browser-logs';
import type { RumEvent, RumEventDomainContext } from '@datadog/browser-rum';
import { datadogRum } from '@datadog/browser-rum';
import type { RumInitConfiguration } from '@datadog/browser-rum-core';

type BaseConfig = { applicationId: string; clientToken: string; env: string; service: string };

const { NODE_ENV } = process.env;
const VERCEL_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV;
const GIT_COMMIT_SHA = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
const IS_DDOG_ENABLED = process.env.NEXT_PUBLIC_IS_DDOG_ENABLED === 'true';
const rumPercentage = Number(process.env.NEXT_PUBLIC_DDOG_RUM_PERCENTAGE);
const DDOG_RUM_PERCENTAGE =
  Number.isNaN(rumPercentage) || rumPercentage < 0 || rumPercentage > 100 ? 100 : rumPercentage;

/**
 * For each application, we need to set the service name and application ID in the Datadog configuration.
 * 1. Include the applicationId in an ENV with a NEXT_PUBLIC_ prefix.
 * 2. Include ENV in turbo.json
 * 3. Include in the list below
 */
const appServiceMap: Record<string, { service: string; id?: string; token?: string }> = {
  auth: {
    service: 'auth',
    id: process.env.NEXT_PUBLIC_DDOG_RUM_APPLICATION_AUTH,
    token: process.env.NEXT_PUBLIC_DDOG_CLIENT_TOKEN_AUTH,
  },
  components: {
    service: 'components',
    id: process.env.NEXT_PUBLIC_DDOG_RUM_APPLICATION_COMPONENTS,
    token: process.env.NEXT_PUBLIC_DDOG_CLIENT_TOKEN_COMPONENTS,
  },
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

const hasMessageToOmit = (log?: string) =>
  Boolean(log) &&
  [
    'A component is changing a controlled',
    'A component is changing an uncontrolled',
    'Google Maps Places API library must be loaded',
    'If you want to write it to the DOM, pass a string instead',
    'Minified React error #', // https://linear.app/footprint/issue/FP-7692/error-minified-react-error-418-423-425
    'React does not recognize',
  ].some(str => log?.includes(str));

const hasUrlToOmit = (log?: string) =>
  Boolean(log) &&
  ['ingest-lr.com', 'launchdarkly.com', 'maps.googleapis.com', 'neuro-id.com', 'neuroid.cloud', 'stytch.com'].some(
    str => log?.includes(str),
  );

const getDataDogConfig = (appName: string): undefined | BaseConfig => {
  const app = appServiceMap[appName];
  const isTest = NODE_ENV === 'test';
  const baseError = 'Datadog not initialized';

  if (isTest || !IS_DDOG_ENABLED) {
    console.warn(baseError);
    return;
  }
  if (!app || !app.service || !app.id || !app.token) {
    console.warn(`${baseError}: ${appName} is not configured`);
    return;
  }
  if (!VERCEL_ENV) {
    console.warn(`${baseError}: VERCEL_ENV is not defined`);
    return;
  }

  return {
    applicationId: app.id,
    clientToken: app.token,
    env: VERCEL_ENV,
    service: app.service,
  };
};

export const initDataDogLogs = (appName: string): boolean => {
  const config = getDataDogConfig(appName);
  if (!config) return false;

  // https://docs.datadoghq.com/logs/log_collection/javascript/#configuration
  datadogLogs.init({
    clientToken: config.clientToken,
    env: config.env,
    service: config.service,
    site: 'datadoghq.com', // `site` refers to the Datadog site parameter of your organization. see https://docs.datadoghq.com/getting_started/site/
    version: `${config.env}:${GIT_COMMIT_SHA}`, // Specify a version number to identify the deployed version of your application in Datadog.

    allowFallbackToLocalStorage: true, // If useCrossSiteSessionCookie is true, then useLocalStorage is ignored. If usePartitionedCrossSiteSessionCookie is true, then useLocalStorage is ignored.
    forwardErrorsToLogs: true, // Set to false to stop forwarding console.error logs, uncaught exceptions and network errors to Datadog.
    sessionSampleRate: 100, // The percentage of sessions to track: 100 for all, 0 for none. Only tracked sessions send logs.
    storeContextsAcrossPages: true, // Store global context and user context in localStorage to preserve them along the user navigation.
    trackSessionAcrossSubdomains: true, // Track sessions across subdomains.
    useCrossSiteSessionCookie: true, // Store session cookies in cross-site cookies.
    usePartitionedCrossSiteSessionCookie: true, // Store session cookies in partitioned cross-site cookies.

    beforeSend: (log: LogsEvent /* , context: LogsEventDomainContext */) => {
      // Discard 200 network logs
      if (log.http && log.http.status_code === 200) return false;

      if (hasMessageToOmit(log.message) || hasMessageToOmit(log.error?.message)) {
        return false;
      }

      if (hasUrlToOmit(log.http?.url)) {
        return false;
      }

      return true;
    },
  });

  return true;
};

export const initDataDogRum = (appName: string): boolean => {
  const config = getDataDogConfig(appName);
  if (!config) return false;

  const localBackendTracing: RumInitConfiguration['allowedTracingUrls'] =
    NODE_ENV === 'development' ? [{ match: 'http://localhost:8000', propagatorTypes: ['tracecontext'] }] : [];

  // https://docs.datadoghq.com/real_user_monitoring/browser/setup/#initialization-parameters
  datadogRum.init({
    ...config,
    applicationId: config.applicationId, // The RUM application ID.
    clientToken: config.clientToken, // Client tokens are unique to your organization.
    env: config.env,
    service: config.service,
    site: 'datadoghq.com', // `site` refers to the Datadog site parameter of your organization. see https://docs.datadoghq.com/getting_started/site/
    version: `${config.env}:${GIT_COMMIT_SHA}`, // Specify a version number to identify the deployed version of your application in Datadog

    allowFallbackToLocalStorage: true, // If useCrossSiteSessionCookie is true, then useLocalStorage is ignored. If usePartitionedCrossSiteSessionCookie is true, then useLocalStorage is ignored.
    defaultPrivacyLevel: 'mask-user-input', // `mask`, `mask-user-input`, or `allow`
    sessionReplaySampleRate: DDOG_RUM_PERCENTAGE, // The percentage of tracked sessions with Browser RUM & Session Replay pricing features: 100 for all, 0
    sessionSampleRate: 100, // The percentage of sessions to track: 100 for all, 0 for none.
    startSessionReplayRecordingManually: true, // Manually start the Session Replay
    storeContextsAcrossPages: true, // Store global context and user context in localStorage to preserve them along the user navigation.
    trackLongTasks: true, // Enables collection of long task events.
    trackResources: true, // Enables collection of resource events.
    trackSessionAcrossSubdomains: true, // Track session across subdomains
    trackUserInteractions: true, // The trackUserInteractions parameter enables the automatic collection of user clicks in your application. Sensitive and private data contained in your pages may be included to identify the elements interacted with.
    usePartitionedCrossSiteSessionCookie: true, // Use partitioned cross-site session cookies.
    allowedTracingUrls: [
      { match: 'https://api.onefootprint.com', propagatorTypes: ['tracecontext'] },
      { match: 'https://api.dev.onefootprint.com', propagatorTypes: ['tracecontext'] },
      ...localBackendTracing,
    ],
    beforeSend: (ev: RumEvent, _ctx: RumEventDomainContext) => {
      ev.view.url = ev.view.url.replace(/#.*/, '#fragment');
      return true; // Discard a RUM event by returning false
    },
  });

  return true;
};

export const dataDogErrorEvent = (err: Error, msg = 'unhandledrejection', msgContext?: object) =>
  datadogLogs.logger.error(msg, msgContext, err);

export const dataDogTrackEvent = (msg: string, msgContext?: object, err?: Error) =>
  datadogLogs.logger.debug(msg, msgContext, err);

export const dataDogWarnEvent = (msg: string, msgContext?: object, err?: unknown) => {
  datadogLogs.logger.warn(msg, msgContext, err instanceof Error ? err : undefined);
};

export const dataDogInfoEvent = (msg: string, msgContext?: object, err?: unknown) =>
  datadogLogs.logger.info(msg, msgContext, err instanceof Error ? err : undefined);

export const dataDogAction = (act: string, actContext?: object) => {
  try {
    const rumGlobal = datadogRum.getGlobalContext();
    const logGlobal = datadogLogs.getGlobalContext();
    return datadogRum.addAction(act, { ...rumGlobal, ...logGlobal, ...actContext });
  } catch (_e) {
    return undefined;
  }
};
