// Tira os prints do README do panda-cooking-front.
// Uso, com o `docker compose up` rodando e um banco recém-criado (make seed):
//   cd panda-cooking-front
//   npm i --no-save playwright && npx playwright install chromium
//   node ../tirar-prints.mjs            (ou o caminho onde este arquivo estiver)
// Grava em docs/telas/ da pasta atual. BASE_URL muda o endereço do site.
import { mkdirSync } from "node:fs"
import { createRequire } from "node:module"
import { join } from "node:path"

const require = createRequire(join(process.cwd(), "package.json"))
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright")

const BASE = process.env.BASE_URL || "http://localhost:3000"
const OUT = join(process.cwd(), "docs", "telas")
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()

async function login(page) {
  await page.goto(`${BASE}/auth/login`)
  await page.getByLabel("E-mail").fill("maria@pandacooking.com")
  await page.getByLabel("Senha").fill("panda-cooking-demo")
  await page.locator('button[type="submit"]').click()
  await page.waitForURL((url) => !url.pathname.startsWith("/auth"))
}

async function settle(page) {
  await page.waitForLoadState("networkidle")
  // espera as fotos terminarem de carregar
  await page.waitForFunction(() => [...document.images].every((img) => img.complete))
  await page.waitForTimeout(500)
}

// Desktop: página inicial e lista de receitas com busca e categorias
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/`)
  await settle(page)
  await page.screenshot({ path: join(OUT, "inicio.png") })
  await page.goto(`${BASE}/dashboard`)
  await settle(page)
  await page.screenshot({ path: join(OUT, "receitas.png"), fullPage: true })
  await ctx.close()
}

// Celular: receita, nova receita e perfil, logado como a Maria
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  })
  const page = await ctx.newPage()
  await login(page)

  // uma receita de outra pessoa, com comentários
  await page.goto(`${BASE}/dashboard?q=coxinha`)
  await settle(page)
  await page.locator('a[href^="/recipes/"]', { hasText: "Coxinha de Frango" }).first().click()
  await page.waitForURL(/\/recipes\//)
  await settle(page)
  await page.screenshot({ path: join(OUT, "receita.png") })

  await page.goto(`${BASE}/recipes/new`)
  await settle(page)
  await page.screenshot({ path: join(OUT, "nova-receita.png") })

  await page.goto(`${BASE}/profile`)
  await settle(page)
  await page.screenshot({ path: join(OUT, "perfil.png") })
  await ctx.close()
}

await browser.close()
console.log(`Prints gravados em ${OUT}`)
