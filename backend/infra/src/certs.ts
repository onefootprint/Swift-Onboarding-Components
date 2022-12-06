import { DnsConfig } from './dns';
import { ec2, Region, route53 } from '@pulumi/aws';
import { Output } from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

export type CertConfig = {
  hostedZoneId: string;
  domain: string;
  region: Region;
};

export type Certificate = {
  cert: aws.acm.Certificate;
  arn: pulumi.Output<string>;
};

/**
 * Helper function to create a cert for a DnsConfig on a region
 */
export async function CreateRegionalWildCertificateForDnsConfig(
  dnsConfig: DnsConfig,
  region: Region,
): Promise<Certificate> {
  return await CreateWildcardCertificate({
    domain: dnsConfig.apiDomain,
    region: region,
    hostedZoneId: dnsConfig.hostedZone.id,
  });
}

export async function CreateWildcardCertificate(
  config: CertConfig,
): Promise<Certificate> {
  const nameSuffix = `${config.domain}-cert-${config.region}`;
  const provider = new aws.Provider(`provider-${nameSuffix}`, {
    region: config.region,
  });

  const domainName = `*.${config.domain}`;

  if (domainName.length >= 64) {
    throw `Domain ${domainName} must be < 64 characters`;
  }

  const cert = new aws.acm.Certificate(
    `cert-ecdsa-p256-${nameSuffix}`,
    {
      domainName,
      subjectAlternativeNames: [config.domain],
      validationMethod: 'DNS',
      keyAlgorithm: 'EC_prime256v1',
    } as aws.acm.CertificateArgs,
    { provider },
  );

  const records = cert.domainValidationOptions.apply(async ops => {
    return ops
      .map(vop => {
        return {
          name: vop.resourceRecordName,
          record: vop.resourceRecordValue,
          type: vop.resourceRecordType,
        };
      })
      .map((record, index) => {
        return new aws.route53.Record(
          `cert-validation-record-${nameSuffix}-${index}`,
          {
            allowOverwrite: true,
            name: record.name,
            records: [record.record],
            ttl: 60,
            type: record.type,
            zoneId: config.hostedZoneId,
          },
          { provider },
        );
      });
  });

  const certValidation = new aws.acm.CertificateValidation(
    `cert-validation-result-${nameSuffix}`,
    {
      certificateArn: cert.arn,
      validationRecordFqdns: records.apply(async recs => {
        return recs.map(record => record.fqdn);
      }),
    },
    { provider },
  );

  return { cert, arn: certValidation.certificateArn };
}
