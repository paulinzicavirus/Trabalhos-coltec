import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./tests',workers:1,retries:0,timeout:30000,
  use:{baseURL:'http://127.0.0.1:3001',viewport:{width:1440,height:900},trace:'retain-on-failure',screenshot:'only-on-failure'},
  webServer:{command:'npm run test:seed && npm start',url:'http://127.0.0.1:3001/feed',reuseExistingServer:false,timeout:120000,
    env:{...process.env,PORT:'3001',DB_PATH:'./data/xwitter.test.db',SESSION_SECRET:'TEST_ONLY_SECRET_CHANGE_ME_1234567891234567'}}
});
