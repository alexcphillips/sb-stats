import nodemailer from 'nodemailer';
import { buildOutput, log } from './log';
import { verifyPropsExist } from './utils';

verifyPropsExist(process.env, ['DOMAIN', 'EMAIL_PASSWORD', 'PORT'], buildOutput());

const { DOMAIN, EMAIL_PASSWORD, PORT } = process.env;

const defaultConfig = {
  host: 'mail.privateemail.com', // 'mail.privateemail.com', or smtp.privateemail.com
  port: 465, // 465 or 587
  secure: true,
  auth: {
    user: 'support@nodecoders.com',
    pass: EMAIL_PASSWORD,
  },
};

export const sendForgotPasswordEmail = async (opts) => {
  try {
    verifyPropsExist(opts, ['to', 'resetPasswordId'], buildOutput());
    const { to, resetPasswordId } = opts;
    const transporter = nodemailer.createTransport(defaultConfig);

    const link = `${DOMAIN}:${PORT}/reset-password/${resetPasswordId}`;

    const html = `<b>Forgot Node Coders Password</b>
<p><a href="${link}"><b>Click Here</b></a> to create a new password, or visit ${link}</p>
<p>If you did not recently attempt to reset your password please ignore this email</p>`;

    log.info('sending email to:', to, ', with body:', html);

    const info = await transporter.sendMail({
      from: '"Node Coders Support" <support@nodecoders.com>',
      to, // list of receivers: 'first, second' (not an array)
      subject: 'Create new password for nodecoders.com',
      html,
    });

    log.info('mail envelope:', info.envelope);
    return info;
  } catch (err) {
    log.error('error with err:', err);
  }
};

export const sendVerificationEmail = async (opts) => {
  try {
    verifyPropsExist(opts, ['to', 'verifyId'], buildOutput());
    const { to, verifyId } = opts;
    const transporter = nodemailer.createTransport(defaultConfig);
    const link = `${DOMAIN}:${PORT}/verify/${verifyId}`;

    const html = `<b>Welcome to Node Coders!</b>
<p><a href="${link}"><b>Click Here</b></a> to verify your account, or visit ${link}</p>
<p>If you did not register an account with us please ignore this email</p>`;

    log.info('sending email to:', to, ', with body:', html);

    const info = await transporter.sendMail({
      from: '"Node Coders Support" <support@nodecoders.com>',
      to, // list of receivers: 'first, second' (not an array)
      subject: 'Verify your email for nodecoders.com',
      html,
    });

    log.info('mail envelope:', info.envelope);
    return info;
  } catch (err) {
    log.error('error with err:', err);
  }
};
