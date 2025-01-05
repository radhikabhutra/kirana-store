export default () => ({
  port: parseInt(process.env.PORT, 10),

  mongo: {
    uri: process.env.MONGO_URI,
  },

  redis: {
    uri: process.env.REDIS_URI,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRATION,
  },

  fxRates: {
    api: process.env.FX_RATES_ENDPOINT,
  },
});
