import moment from 'moment';
import config, { loadConfig } from '../config';
import { log } from './log';
import { find, updateMany } from '../db/operations';
import { combineTextsWithPadding } from './utils';

// details for each job to start, timers can be overridden in db timers collection
const jobTimers = {
  updateConfig: {
    fn: loadConfigFromDb,
    intervalMs: 300000,
    timer: null,
  },
  removeExpiredEmailVerificationIds: {
    fn: removeExpiredEmailVerificationIds,
    intervalMs: 3600000, // 1 hour
    timer: null,
  },
  startJobs: {
    fn: startJobs,
    intervalMs: 300000, // 5 minutes
    timer: null,
  },
};

// update config that has changed in the db
async function loadConfigFromDb() {
  await loadConfig('lib/jobs.ts');
}

// start each of the jobTimer jobs
async function startJobs() {
  const timersFromDb = await find('timers', {}); // [{ name: 'name', intervalMs: <int> }, ...]
  log.info(`Starting ${Object.keys(jobTimers).length} jobs, with ${timersFromDb.length} updates from db timers collection`);
  Object.keys(jobTimers).forEach((jobName) => {
    const timerDocument = timersFromDb.find((timer) => timer.name === jobName);
    startJob(timerDocument, jobName);
  });
}

// start the job if it hasn't started or restart it if the interval changed in the db
function startJob(timerDocument, jobName: string) {
  if (jobTimers[jobName].timer) {
    if (!timerDocument) {
      // timer started already, interval did not change without db entry
      return;
    }
    if (jobTimers[jobName].intervalMs === timerDocument.intervalMs) {
      // the timer is running and the interval did not change, do nothing
      return;
    }
    // the timer is running and the interval changed, clear the interval and restart with new interval
    clearInterval(jobTimers[jobName].timer);
  }
  if (timerDocument) {
    jobTimers[jobName].intervalMs = timerDocument.intervalMs;
  }
  jobTimers[jobName].timer = setInterval(jobTimers[jobName].fn, jobTimers[jobName].intervalMs);
  log.info(combineTextsWithPadding(`job ${jobName}:`, `${jobTimers[jobName].intervalMs} ms`, 40));
}

// expire email verifications if the user does not verify their email in time
// this will make users need to re-register to use their unverified account
async function removeExpiredEmailVerificationIds() {
  try {
    const now = moment();
    const expireDate = now.subtract(config.emailVerificationExpireDays, 'days');
    const result = await updateMany('users', { verifyId: { $exists: true }, verifyIdCreateDate: { $lte: expireDate } }, { verifyId: null, verifyIdCreateDate: null });
    log.info('removing expired verification tokens job result:', result);
  } catch (err) {
    log.error('removing expired verification tokens err:', err);
  }
}

export default startJobs;
