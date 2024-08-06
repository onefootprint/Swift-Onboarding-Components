import { describe, expect, it } from 'bun:test';
import isIpAddress from './is-ip-address';

describe('isIpAddress', () => {
  describe('valid ip addresses', () => {
    it('should return true', () => {
      const ipv4 = [
        '192.168.0.1',
        '0.0.0.0',
        '115.42.150.37',
        '192.168.0.1',
        '110.234.52.124',
        '115.42.150.37',
        '115.42.150.38',
        '115.42.150.50',
        '192.168.1.70',
      ];
      ipv4.forEach(ip => {
        expect(isIpAddress(ip)).toBe(true);
      });

      const ipv6 = [
        '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        '2001:db8:3333:4444:5555:6666:7777:8888',
        '2001:db8:3333:4444:CCCC:DDDD:EEEE:FFFF',
      ];
      ipv6.forEach(ip => {
        expect(isIpAddress(ip)).toBe(true);
      });
    });
  });

  describe('invalid ip addresses', () => {
    it('should return false', () => {
      const invalidIps = [
        '2321313132131232',
        '',
        '210.110',
        '255',
        'y.y.y.y',
        '255.0.0.y',
        '666.10.10.20',
        '4444.11.11.11',
        '33.3333.33.3',
        '0192.168.1.70',
      ];

      invalidIps.forEach(ip => {
        expect(isIpAddress(ip)).toBe(false);
      });
    });
  });
});
