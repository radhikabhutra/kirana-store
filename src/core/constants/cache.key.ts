export const REDIX_PREFIX = 'kirana-register:';

export const CURRENCY_RATES = {
  key: `${REDIX_PREFIX}currency-rates`,
  expiry: 3600,
};

export const RATE_LIMIT = {
  key: (ip: string) => `${REDIX_PREFIX}rate-limit:${ip}`,
  expiry: 60,
};

export const LOCK = {
  key: (key: string) => `${REDIX_PREFIX}lock:${key}`,
  expiry: 10000,
};
