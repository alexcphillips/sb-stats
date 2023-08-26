import { log } from '../lib';
import { createCollections, createIndex, find, insertMany } from './operations';
import { seedData } from './seedData';

export const seedDb = async () => {
  if (process.env.SKIP_DB_SEEDING) {
    log.info('Skipping db seed');
    return;
  }
  log.debug('creating collections');
  await createCollections(Object.keys(seedData));

  for (const collection in seedData) {
    log.debug('checking documents for collection:', collection);
    setupDocs(collection);
    setupIndexes(collection);
  }
};

async function setupDocs(collection) {
  if (!seedData[collection]?.docs) {
    return;
  }
  const { docs, filter, projection, comparisonField } = seedData[collection];
  const dbDocs = await find(collection, filter, projection);
  const comparisonValues = dbDocs.map((dbDoc) => dbDoc[comparisonField]);
  // log.debug('comparisonValues:', comparisonValues);
  const missingDocs = [];

  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    // log.debug('doc[comparisonField]:', doc[comparisonField]);
    if (!comparisonValues.includes(doc[comparisonField])) {
      missingDocs.push(doc);
    }
  }

  if (missingDocs.length) {
    log.debug('inserting missingDocs:', missingDocs);
    insertMany(collection, missingDocs);
  }
}

// https://www.mongodb.com/docs/drivers/node/current/fundamentals/indexes/
async function setupIndexes(collection) {
  if (!seedData[collection]?.indexes) {
    return;
  }

  const { indexes } = seedData[collection];

  for (let i = 0; i < indexes.length; i++) {
    const index = indexes[i];
    createIndex(collection, index);
  }
}
