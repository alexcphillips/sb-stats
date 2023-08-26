import * as path from 'path';

export const destination = (req, res) => {
	res.sendFile(path.join(__dirname, '../../build/index.html'), (err) => {
		if (err) res.status(500).send(err);
	});
};
