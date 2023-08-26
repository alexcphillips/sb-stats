// import * as path from 'path';
// import * as dotenv from 'dotenv';
// dotenv.config({ path: path.join(__dirname, '.env') });
// import { connect } from './server/db/mongo';
// import { loadConfig } from './server/config';
import { init as initApp } from './server/app';

async function init() {
	// await connect(process.env.MONGO_URI);
	// await loadConfig('/index.ts');
	await initApp();
}

init();
