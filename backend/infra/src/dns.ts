import * as aws from '@pulumi/aws';
import { Config } from './config';
import * as crypto from 'crypto';

export type DnsConfig = {
  domainBaseName: string;
  apiPrefixHost: string;
  hostedZone: aws.route53.GetZoneResult;
  apiDomain: string;
};

// hostname's cannot be longer than 64 characters
// we truncate to prevent certificate creation errors for subdomains
const MAX_HOST_NAME_LENGTH = 22;
const TRUNCATE_LENGTH = 12;

export async function LoadDnsConfig(constants: Config): Promise<DnsConfig> {
  let apiPrefix = constants.domain.prefix.toLowerCase();

  if (apiPrefix.length > MAX_HOST_NAME_LENGTH) {
    const hostHash = crypto
      .createHash('sha256')
      .update(apiPrefix)
      .digest('hex')
      .substring(0, 9);

    const truncated = apiPrefix.substring(0, TRUNCATE_LENGTH);
    apiPrefix = `${truncated}-${hostHash}.`;
  }

  return {
    hostedZone: await aws.route53.getZone({ name: constants.domain.base }),
    domainBaseName: constants.domain.base,
    apiPrefixHost: apiPrefix,
    apiDomain: `${apiPrefix}${constants.domain.base}`,
  };
}
