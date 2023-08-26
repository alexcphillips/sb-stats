import express from 'express';
import { Request, Response } from 'express';
import http from 'http';
import morgan from 'morgan';
import cors from 'cors';
import * as path from 'path';

const app = express();
const port: number = Number(process.env.API_PORT) || 3000;
app.use(cors());

// app.use(function (req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   next();
// });

app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));
app.use(morgan('dev'));
// app.use('/api', router);
app.use(express.static(path.resolve('./') + '/build/ui'));

app.get('*', (req: Request, res: Response): void => {
	res.sendFile(path.resolve('./') + '/build/ui/index.html');
});

export const init = async () => {
	// await seedDb();
	app.listen(port, () =>
		console.log(`${process.env.NODE_ENV} server port: ${port}`)
	);
};
