#!/usr/bin/env node

import { Command } from 'commander';
import { API } from './lib/API';
import { Auth } from './lib/Auth';
import { URL } from 'url';
import * as readline from 'readline';

const input = (question: string) => new Promise<string>((resolve) => {
  const rl = readline.createInterface(process.stdin, process.stdout);
  rl.question(question, (answer) => resolve(answer));
});

const program = new Command();

const options = {
  country: 'US',
  language: 'en-US',
};

program
  .option('-c, --country <type>', 'Country code for account', options.country)
  .on('option:country', (value) => options.country = value)
  .option('-l, --language <type>', 'Language code for account', options.language)
  .on('option:language', (value) => options.language = value);

program
  .command('login')
  .description('Obtain refresh_token from LG account')
  .argument('<username>', 'LG username')
  .argument('<password>', 'LG password')
  .action(async (username, password) => {
    // eslint-disable-next-line max-len,no-console
    console.info('Start login: username =', username, ', password =', password, ', country =', options.country, ', language =', options.language);
    try {
      const api = new API(options.country, options.language);
      const gateway = await api.gateway();
      const auth = new Auth(gateway);
      const session = await auth.login(username, password);

      // eslint-disable-next-line no-console
      console.info('Your refresh_token:', session.refreshToken);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }

    process.exit(0);
  });

program
  .command('auth')
  .description('Obtain refresh_token from account logged by Google Account, Apple ID')
  .action(async () => {
    const api = new API(options.country, options.language);
    const gateway = await api.gateway();
    const auth = new Auth(gateway);

    const loginUrl = new URL(await auth.getLoginUrl());
    const origin = loginUrl.origin;
    loginUrl.host = 'us.m.lgaccount.com';
    loginUrl.searchParams.set('division', 'ha'); // enable Apple ID
    loginUrl.searchParams.set('redirect_uri', origin + '/login/iabClose');
    loginUrl.searchParams.set('callback_url', origin + '/login/iabClose');

    // eslint-disable-next-line no-console
    console.info('Log in here:', loginUrl.href);

    const callbackUrl = await input('Then paste the URL where the browser is redirected: ');

    const url = new URL(callbackUrl);
    const refresh_token = url.searchParams.get('refresh_token');

    if (refresh_token) {
      // eslint-disable-next-line no-console
      console.info('Your refresh_token:', refresh_token);
      process.exit(0);
    }

    const username = url.searchParams.get('user_id'),
      thirdparty_token = url.searchParams.get('user_thirdparty_token'),
      id_type = url.searchParams.get('user_id_type') || '';

    const thirdparty = {
      APPL: 'apple',
      FBK: 'facebook',
      GGL: 'google',
      AMZ: 'amazon',
    };

    if (!username || !thirdparty_token || typeof thirdparty[id_type] === 'undefined') {
      // eslint-disable-next-line no-console
      console.error('redirected url not valid, please try again or use LG account method');
      process.exit(0);
    }

    try {
      const session = await auth.loginStep2(username, thirdparty_token, {
        third_party: thirdparty[id_type],
      });

      // eslint-disable-next-line no-console
      console.info('Your refresh_token:', session.refreshToken);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }

    process.exit(0);
  });

program.parse(process.argv);
