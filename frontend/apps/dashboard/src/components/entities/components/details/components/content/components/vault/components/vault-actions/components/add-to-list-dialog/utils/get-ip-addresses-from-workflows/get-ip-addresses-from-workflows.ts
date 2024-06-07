import type { EntityWorkflow, InsightEvent } from '@onefootprint/types';

const getIpAddressesFromWorkflows = (workflows: EntityWorkflow[]) => {
  const insightEvents = (workflows.map(wf => wf.insightEvent).filter(ie => !!ie) as InsightEvent[]).flat();
  const ipAddresses = insightEvents.map(event => event.ipAddress).filter(ip => !!ip) as string[];
  return ipAddresses;
};

export default getIpAddressesFromWorkflows;
