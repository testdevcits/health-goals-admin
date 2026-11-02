let sequence = 0;

// Submission identifiers are for retry deduplication, not authentication.
export function createEntryId(cryptoApi = globalThis.crypto) {
  if (typeof cryptoApi?.randomUUID === 'function') return cryptoApi.randomUUID();
  if (typeof cryptoApi?.getRandomValues === 'function') {
    const bytes = cryptoApi.getRandomValues(new Uint8Array(16));
    return `entry-${Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')}`;
  }
  sequence += 1;
  return `entry-${Date.now().toString(36)}-${sequence.toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}
