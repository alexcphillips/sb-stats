import {
	findOne,
	insertOne,
	findOneAndUpdate,
	findOneAndDelete,
} from '../db/operations';
import { makeId, removeObjectKeys, verifyPropsExist } from '../lib/utils';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sendForgotPasswordEmail, sendVerificationEmail } from '../lib/email';
import { log } from '../lib';

verifyPropsExist(process.env, ['TOKEN_KEY'], '[routes/user]');

/*s
const allRoles = [
  'owner', // can do anything a lower role can do plus delete the account
  'admin', // can do anything a lower role can do plus invite users and update configurations
  'manager', // can do anything a lower role can do plus approve documents
  'user', // can read and create invoices and other documents
];
*/

export const find = async (req, res) => {
	const result = await findOne('users', { _id: req.params.id });
	res.status(200).send(result);
};

type RegisterResponseJSON = {
	_id: string; // 63d56fc10c9bd6...
	acknowledged: boolean; // true
	insertedId: string; // 63d56fc10c9bd6...
	token: string; // eyJhbGciOiJIUzI1Ni...
	lastErrorObject?: {
		updatedExisting?: boolean;
	};
};

export const resetPassword = async (req, res) => {
	let email;
	let password;
	let resetPasswordId;

	try {
		verifyPropsExist(
			req.body,
			['email', 'password', 'resetPasswordId'],
			'[routes/user createPassword]'
		);
		email = req.body.email;
		password = req.body.password;
		resetPasswordId = req.body.resetPasswordId;
	} catch (err) {
		return res.status(400).send(err.message);
	}

	try {
		const encryptedPassword = await bcrypt.hash(password, 10);
		const now = new Date();
		const result = await findOneAndUpdate(
			'users',
			{ email, resetPasswordId },
			{ resetPasswordId: null, lastUpdated: now, password: encryptedPassword }
		);

		log.debug('result:', result);

		/* 
    // result for id that does not exist
    result: {
      lastErrorObject: { n: 0, updatedExisting: false },
      value: null,
      ok: 1
    }
    // result for successful update
    {
      lastErrorObject: { n: 1, updatedExisting: true },
      value: {
        _id: new ObjectId("63d988e875785d16ff881a64"),
        userId: 'c902fda6-2b03-4cd4-8418-5c270dbdefac',
        email: 'curtwphillips@gmail.com',
        password: '$2a$10$v0yMez398Bg0n1iOvVyN4O/mLSd9Vkm0/fLhL.O6.SXhVQ6mafKue',
        isActive: true,
        createDate: 2023-01-31T21:32:24.826Z,
        lastUpdated: 2023-01-31T21:32:24.826Z
      },
      ok: 1
    }
    */

		if (!result.lastErrorObject.updatedExisting) {
			return res.status(500).json({ text: 'Something went wrong' });
		}

		return res.status(201).json({ created: true });
	} catch (err) {
		log.error(err);
		return res.status(500).json({ text: 'Something went wrong' });
	}
};

export const register = async (req, res) => {
	try {
		// inviteId exists for a user who gets an invite to join the business group of an existing user
		const { email, inviteId, password } = req.body;

		if (!email) {
			return res.status(400).send('Email is required');
		}

		if (!password) {
			return res.status(400).send('Password is required');
		}

		const existingUser = await findOne('users', { email });

		log.debug('existingUser:', existingUser);

		if (existingUser && existingUser.isVerified) {
			return res
				.status(409)
				.json({ text: 'User already exists. Please login' });
		}

		const encryptedPassword = await bcrypt.hash(password, 10);

		const now = new Date();
		const userId = makeId();
		const verifyId = makeId();

		let invite;
		let businessId;
		let roles;

		if (inviteId) {
			invite = await findOne('invites', { inviteId, email });
			if (!invite) {
				res.status(400).json({
					message:
						'The invitation to join was not found. Please request a new invitation.',
				});
			}
			businessId = invite.businessId;
			roles = invite.roles;
		} else {
			businessId = makeId();
			roles = ['owner'];
		}

		const updateValues = {
			userId,
			email: email.toLowerCase(),
			password: encryptedPassword,
			isActive: true,
			businessId,
			roles,
			verifyId,
			isVerified: false,
			verifyIdCreateDate: now,
			createDate: now,
			lastUpdated: now,
		};

		let registerResponse: RegisterResponseJSON;
		if (existingUser) {
			// a user who never verified their account is re-registering the same email
			registerResponse = await findOneAndUpdate(
				'users',
				{ email },
				updateValues
			);
		} else {
			// registerResponse: {
			//   lastErrorObject: { n: 1, updatedExisting: true },
			//   value: {
			//     _id: new ObjectId("63ddfcbb9dcd2c1380e7e898"),
			//     userId: 'caa26024-6cc8-4453-8786-45bf8f565177',
			//     email: 'curtwphillips@gmail.com',
			//     ...
			//   },
			//   ok: 1
			// }
			registerResponse = await insertOne('users', updateValues);
		}

		if (
			!registerResponse.acknowledged &&
			!registerResponse.lastErrorObject?.updatedExisting
		) {
			console.log('registerResponse:', registerResponse);
			return res.status(500).json({ text: 'Failed to register user' });
		}

		// registerResponse.token = jwt.sign({ user_id: registerResponse._id, email }, process.env.TOKEN_KEY, {
		//   expiresIn: '2h',
		// });

		sendVerificationEmail({ to: email.toLowerCase(), verifyId });

		return res.status(201).json(registerResponse);
	} catch (err) {
		log.error(err);
		return res.status(500).json({ text: 'Something went wrong' });
	}
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email) {
			log.debug('Missing email');
			return res.status(400).send('Email is required');
		}

		if (!password) {
			log.debug('Missing password');
			return res.status(400).send('Password is required');
		}

		const user = await findOne('users', {
			email,
			isActive: true,
			isVerified: true,
		});

		if (user && (await bcrypt.compare(password, user.password))) {
			const filteredUser = removeObjectKeys(user, ['password']);
			log.debug('filteredUser:', JSON.stringify(filteredUser, null, 2));
			/*
      filteredUser: {
        "_id": "63e2c83535cdafa4e58d58e6",
        "userId": "f5d402c9-bf0c-4cc9-bb85-1f93f6e89abf",
        "email": "curtwphillips@gmail.com",
        "isActive": true,
        "businessId": "85a98b3f-872d-4d21-b8f8-d6fcabbda7a3",
        "roles": [
          "owner"
        ],
        "verifyId": "cef18228-1ae5-405d-94fd-17987d33349e",
        "isVerified": true,
        "verifyIdCreateDate": "2023-02-07T21:52:53.775Z",
        "createDate": "2023-02-07T21:52:53.775Z",
        "lastUpdated": "2023-02-07T21:53:06.129Z",
        "verifiedAt": "2023-02-07T21:53:06.129Z"
      }
      */
			user.token = jwt.sign({ user: filteredUser }, process.env.TOKEN_KEY, {
				expiresIn: '2h',
			});
			return res.status(200).json({ token: user.token });
		}

		res.status(400).json({ text: 'Invalid Credentials' });
	} catch (err) {
		log.error(err);
		return res.status(500).json({ text: 'Something went wrong' });
	}
};

export const logout = async (req, res) => {
	try {
		const { token } = req.body;

		if (!token) {
			// nothing to do
			return res.sendStatus();
		}
	} catch (err) {
		log.error(err);
		return res.status(500).json({ text: 'Something went wrong' });
	}
};

export const resendVerificationEmail = async (req, res) => {
	const { email } = req.body;

	if (!email) {
		return res.status(400).send('Missing email for verification');
	}

	const existingUser = await findOne('users', { email });

	if (!existingUser) {
		return res.status(400).json({ text: 'Bad Request' });
	}

	sendVerificationEmail({
		to: email.toLowerCase(),
		verifyId: existingUser.verifyId,
	});

	return res.status(200).json({ text: 'Sent verification email' });
};

export const forgotPassword = async (req, res) => {
	const { email } = req.body;

	if (!email) {
		return res.status(400).send('Missing email');
	}

	const now = new Date();
	const resetPasswordId = makeId();

	const updateResponse = await findOneAndUpdate(
		'users',
		{ email },
		{
			lastUpdated: now,
			resetPasswordId,
			forgotPasswordIdCreateDate: now,
		}
	);

	log.debug('updateResponse:', updateResponse);
	const emailInfo = await sendForgotPasswordEmail({
		to: email.toLowerCase(),
		resetPasswordId,
	});
	log.debug('emailInfo:', emailInfo);
	return res.status(201).json({ text: 'email sent' });
};

export const verify = async (req, res) => {
	try {
		const { verifyId } = req.params;
		log.info('verifying id:', verifyId);

		if (!verifyId) {
			return res.status(400).send('Missing verifyId');
		}

		const now = new Date();
		const result = await findOneAndUpdate(
			'users',
			{ verifyId, isVerified: false },
			{ isVerified: true, verifiedAt: new Date(), lastUpdated: now }
		);

		log.debug('result:', result);

		/* 
    // result for id that does not exist
    result: {
      lastErrorObject: { n: 0, updatedExisting: false },
      value: null,
      ok: 1
    }
    // result for already verified user
    {
      lastErrorObject: { n: 0, updatedExisting: false },
      value: null,
      ok: 1
    }
    // result for successful verification
    {
      lastErrorObject: { n: 1, updatedExisting: true },
      value: {
        _id: new ObjectId("63d988e875785d16ff881a64"),
        userId: 'c902fda6-2b03-4cd4-8418-5c270dbdefac',
        email: 'curtwphillips@gmail.com',
        password: '$2a$10$v0yMez398Bg0n1iOvVyN4O/mLSd9Vkm0/fLhL.O6.SXhVQ6mafKue',
        isActive: true,
        createDate: 2023-01-31T21:32:24.826Z,
        lastUpdated: 2023-01-31T21:32:24.826Z
      },
      ok: 1
    }
    */

		if (!result.lastErrorObject.updatedExisting) {
			return res
				.status(400)
				.send(
					'This verification email has expired or the account is already verified. Try logging in or re-registering the account.'
				);
		}

		return res.status(200).json({ isVerified: true });
	} catch (err) {
		log.error(err);
		return res.status(500).json({ text: 'Something went wrong' });
	}
};

export const update = async (req, res) => {
	const result = await findOneAndUpdate(
		'users',
		{ _id: req.params.id },
		{ $set: req.body }
	);

	return res.status(200).send(result);
};

export const findAndDelete = async (req, res) => {
	const result = await findOneAndDelete('users', {
		userId: req.params.userId,
	});
	log.debug(result);
	return res.status(200).send(result);
};

export const findAndDeleteByEmail = async (req, res) => {
	const result = await findOneAndDelete('users', {
		email: req.params.email,
	});
	log.debug('result', result);
	/*
  // failed to delete
  {"lastErrorObject":{"n":0},"value":null,"ok":1}
  // success
  {
    "lastErrorObject": {
        "n": 1
    },
    "value": {
        "_id": "63d998596f98bf4b2c0d1843",
        "userId": "781f1b30-4111-4ed7-9198-32667f4c20fa",
        "email": "curtwphillips@gmail.com",
        "password": "$2a$10$RLOvtgymhh1pg2DS3vHubOgFcF0bsapFuRw.uu4Zg.Pm5suXT2Hiy",
        "isActive": true,
        "createDate": "2023-01-31T22:38:17.594Z",
        "lastUpdated": "2023-01-31T22:38:17.594Z",
        "verifiedAt": "2023-01-31T22:39:02.676Z"
    },
    "ok": 1
  }
  */
	return res.status(200).send(result);
};

export const findKeybinds = async (req, res) => {
	const result = await findOne('users', { _id: req.params.id });

	return res.status(200).send(result);
};

export const updateKeybinds = async (req, res) => {
	const result = await findOneAndUpdate(
		'users',
		{ _id: req.params.id },
		{ $set: req.body }
	);

	return res.status(200).send(result);
};
