import { test, expect } from '@playwright/test';
const credentials={email:'ana@exemplo.test',password:'Senha-Exemplo-Ana-2026!'};
async function login(page,who=credentials){await page.goto('/login');await page.getByLabel('E-mail').fill(who.email);await page.getByLabel('Senha').fill(who.password);await page.getByRole('button',{name:'Entrar'}).click();await expect(page).toHaveURL(/\/feed/);}

test('apresentação, login, cadastro e páginas públicas', async({page})=>{
 await page.goto('/');await expect(page.getByRole('heading',{name:/Suas palavras criam/})).toBeVisible();
 await page.goto('/cadastro');await expect(page.getByRole('heading',{name:/Uma conta/})).toBeVisible();
 await page.goto('/feed');await expect(page.getByText('Explorando novas ideias sobre #web')).toBeVisible();
 await expect(page.locator('form[action="/publicar"]')).toHaveCount(0);
 await page.goto('/explorar?q=%23web');await expect(page.getByText('Explorando novas ideias sobre #web')).toBeVisible();
});

test('login inválido, login válido, perfil, seguir, curtir e publicar',async({page})=>{
 await page.goto('/login');await page.getByLabel('E-mail').fill(credentials.email);await page.getByLabel('Senha').fill('invalida');await page.getByRole('button',{name:'Entrar'}).click();
 await expect(page.getByRole('alert')).toContainText('E-mail ou senha inválidos');
 await login(page);await page.goto('/atividade');await expect(page.getByText('Curtidas recebidas')).toBeVisible();
 await expect(page.locator('#days')).toBeVisible();
 await page.goto('/perfil/bruno');await expect(page.getByRole('button',{name:/Deixar de seguir/})).toBeVisible();
 await page.goto('/feed');await page.getByLabel('O que está acontecendo?').fill('Nova postagem do Playwright #teste');await page.getByRole('button',{name:/Publicar/}).click();
 await expect(page.getByText('Nova postagem do Playwright #teste')).toBeVisible();
 await page.getByRole('button',{name:'Excluir publicação'}).last().click();
 await expect(page.getByText('Nova postagem do Playwright #teste')).toHaveCount(0);
});

test('responder e não executar conteúdo HTML',async({page})=>{
 await login(page,{email:'elisa@exemplo.test',password:'Senha-Exemplo-Elisa-2026!'});
 await page.goto('/feed');await page.getByLabel('O que está acontecendo?').fill('<img src=x onerror=alert(1)> #web');await page.getByRole('button',{name:/Publicar/}).click();
 await expect(page.getByText('<img src=x onerror=alert(1)> #web')).toBeVisible();
 await expect(page.locator('article img')).toHaveCount(0);
 await page.getByRole('button',{name:'Excluir publicação'}).click();
 await page.goto('/perfil/ana');await page.getByRole('button',{name:/Seguir/}).click();await expect(page.getByRole('button',{name:/Deixar de seguir/})).toBeVisible();
});

test('CSRF, alterações indevidas e cache de atividade', async({page,request})=>{
 await login(page);
 const csrf=await page.locator('input[name="_csrf"]').first().inputValue();
 const cookies=await page.context().cookies();const auth=cookies.find(c=>c.name==='xwitter.sid');expect(auth).toBeTruthy();
 const noCsrf=await page.request.post('/publicar',{form:{body:'Sem csrf'}});expect(noCsrf.status()).toBe(403);
 const other=await page.request.post('/publicacao/3/excluir',{form:{_csrf:csrf}});expect(other.status()).toBe(403);
 const first=await page.request.get('/atividade');expect(first.headers()['x-cache']).toBe('MISS');
 const second=await page.request.get('/atividade');expect(second.headers()['x-cache']).toBe('HIT');
});

test('tema e layout mobile',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/login');await page.getByRole('button',{name:'Alternar tema'}).click();
 await expect(page.locator('html')).toHaveAttribute('data-bs-theme','light');
 await expect(page.getByLabel('E-mail')).toBeVisible();
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);expect(overflow).toBe(false);
});
