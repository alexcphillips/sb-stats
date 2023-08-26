import * as express from 'express';
import { verifyToken } from './middleware/auth';
import { health } from './health';
import * as redirect from './redirect';
import * as user from './user';
import * as excel from './excel';

export const router = express.Router();

router.get('/health', health);

router.get('/user/:userId', user.find);
router.put('/user/:userId', user.update);
router.delete('/user/:userId', user.findAndDelete);
router.delete('/user/email/:email', user.findAndDeleteByEmail);

router.get('/excel/:bucket/:key', excel.readFromS3);

router.get('/verify/:verifyId', user.verify);
router.post('/register', user.register);
router.post('/login', user.login);
router.post('/logout', user.logout);
router.post('/verification-email', user.resendVerificationEmail);
router.post('/forgot-password', user.forgotPassword);
router.post('/password', user.resetPassword);

// missed get requests
router.get('*', redirect.destination);
