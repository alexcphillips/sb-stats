// 3600000 = 1 hour (1000 * 60 * 60)

export const seedData = {
  applicationSettings: {
    filter: {},
    projection: {},
    comparisonField: 'name',
    docs: [{ name: 'config', emailVerificationExpireDays: 3, logLevel: 'debug' }],
  },
  timers: {
    filter: {},
    projection: {},
    comparisonField: 'name',
    indexes: [{ name: 1 }],
    docs: [
      {
        name: 'updateConfig',
        description: 'update config with new values in the application settings collection',
        intervalMs: 300000,
      },
      {
        name: 'removeExpiredEmailVerificationIds',
        description: 'remove email verification for users who have not responded in time',
        intervalMs: process.env.INTERVAL_REMOVE_EXPIRED_EMAIL_VERIFICATION_IDS || 3600000,
      },
      {
        name: 'startJobs',
        description: 'start all of the existing jobs and apply timer updates from the timers collection',
        intervalMs: process.env.INTERVAL_START_JOBS || 3600000,
      },
    ],
  },
  users: {
    indexes: [{ createDate: 1 }, { email: 1 }, { isActive: 1 }, { lastUpdated: 1 }, { userId: 1 }, { verifyId: 1 }, { isVerified: 1 }, { verifyIdCreateDate: 1 }],
  },
};
