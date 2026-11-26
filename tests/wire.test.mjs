// The request row's network and connection fields, in motdang.net's positions (Nan, 2026-11-26).
//   node tests/wire.test.mjs
import assert from 'node:assert/strict';
import { onRequest } from '../functions/_middleware.js';

const CF = { country: 'TH', asn: 131445, asOrganization: 'Advanced Wireless Network Company Limited', colo: 'BKK',
  httpProtocol: 'HTTP/2', tlsVersion: 'TLSv1.3', tlsCipher: 'AEAD-AES128-GCM-SHA256',
  tlsClientCiphersSha1: 'GXSPDLP4G3X+prK73a4wBuOaHRc=', tlsClientExtensionsSha1: 'T1dGaU0ySTVaRGM=',
  tlsClientHelloLength: '508', clientTcpRtt: 22, tlsClientRandom: 'cmFuZG9tLXBlci1jb25uZWN0aW9u' };

async function hit(cf) {
  const rows = [], waits = [];
  const request = { url: 'https://hongdam.net/api/fx', method: 'GET',
    headers: new Headers({ 'user-agent': 'curl/8.7.1', 'cf-connecting-ip': '203.0.113.44' }), cf };
  const context = { request, env: { TRAFFIC: { writeDataPoint: (r) => rows.push(r) } },
    next: async () => new Response('{}', { headers: { 'content-type': 'application/json' } }),
    waitUntil: (p) => waits.push(p) };
  await onRequest(context);
  await Promise.all(waits);
  return rows;
}

const [r] = await hit(CF);
assert.equal(r.blobs.length, 20);
assert.equal(r.doubles.length, 7);
assert.deepEqual(r.blobs.slice(8, 14), ['', '', '', '', '', '']);
assert.deepEqual(r.blobs.slice(14), ['131445', 'Advanced Wireless Network Company Limited', 'BKK',
  'HTTP/2 TLSv1.3 AEAD-AES128-GCM-SHA256', CF.tlsClientCiphersSha1, CF.tlsClientExtensionsSha1]);
assert.deepEqual(r.doubles.slice(3), [0, 0, 22, 508]);
const s = JSON.stringify(r);
for (const leak of ['203.0.113.44', CF.tlsClientRandom]) assert.ok(!s.includes(leak), leak + ' reached the row');

const [e] = await hit(undefined);
assert.equal(e.blobs.length, 20);
assert.deepEqual(e.blobs.slice(14), ['', '', '', '', '', '']);
assert.deepEqual(e.doubles.slice(5), [-1, -1]);
console.log('wire: all green');
