import {test,expect} from '@playwright/test';
async function login(page,name){await page.goto('/login');await page.getByLabel('E-mail').fill(name+'@exemplo.test');await page.getByLabel('Senha').fill('Senha-Exemplo-'+name[0].toUpperCase()+name.slice(1)+'-2026!');await page.getByRole('button',{name:'Entrar'}).click();await expect(page).toHaveURL(/\/feed/);}
async function token(page){return page.locator('input[name="_csrf"]').first().inputValue();}
test('curtidas repetidas nao duplicam e sao idempotentes',async({page})=>{
  await login(page,'elisa');
  const csrf=await token(page);
  const actions=await Promise.all(Array.from({length:4},()=>page.request.post('/publicacao/1/curtir',{form:{_csrf:csrf}})));
  expect(actions.every(r=>r.ok()||r.status()===302)).toBeTruthy();
  await page.goto('/publicacao/1');
  await expect(page.locator('article').first().locator('[aria-label="4 curtidas"]')).toHaveCount(1);
  const rm=await Promise.all(Array.from({length:2},()=>page.request.post('/publicacao/1/descurtir',{form:{_csrf:csrf}})));
  expect(rm.every(r=>r.ok()||r.status()===302)).toBeTruthy();
  await page.reload();
  await expect(page.locator('article').first().locator('[aria-label="3 curtidas"]')).toHaveCount(1);
});
test('rejeita texto vazio e maior que 280 grafemas no servidor',async({page})=>{
  await login(page,'diego');const csrf=await token(page);
  const empty=await page.request.post('/publicar',{form:{_csrf:csrf,body:'    '}});expect(empty.status()).toBe(400);
  const long=await page.request.post('/publicar',{form:{_csrf:csrf,body:'x'.repeat(281)}});expect(long.status()).toBe(400);
  const emoji='🦊'.repeat(280);
  const accepted=await page.request.post('/publicar',{form:{_csrf:csrf,body:emoji}});
  expect(accepted.status()).toBe(200);
  const text=await accepted.text();expect(text).toContain(emoji.slice(0,4));
});
test('nao permite seguir a propria conta',async({page})=>{
  await login(page,'ana');const csrf=await token(page);
  const response=await page.request.post('/perfil/1/seguir',{form:{_csrf:csrf}});
  expect(response.status()).toBe(400);
});
test('cache de Ana invalida quando Bruno remove curtida',async({page,browser})=>{
  await login(page,'ana');
  const first=await page.request.get('/atividade');expect(first.headers()['x-cache']).toBe('MISS');
  const second=await page.request.get('/atividade');expect(second.headers()['x-cache']).toBe('HIT');
  await expect(page.goto('/atividade')).resolves.toBeTruthy();
  await expect(page.locator('.stat').filter({hasText:'Curtidas recebidas'}).locator('b')).toHaveText('4');
  const other=await browser.newContext();const brunopage=await other.newPage();
  await login(brunopage,'bruno');const csrf=await token(brunopage);
  const response=await brunopage.request.post('/publicacao/1/descurtir',{form:{_csrf:csrf}});
  expect(response.ok()).toBeTruthy();
  const after=await page.request.get('/atividade');expect(after.headers()['x-cache']).toBe('MISS');
  await page.reload();await expect(page.locator('.stat').filter({hasText:'Curtidas recebidas'}).locator('b')).toHaveText('3');
  await other.close();
});
