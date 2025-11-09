import fs from "fs";
import puppeteer from "puppeteer";

const cookies = JSON.parse(fs.readFileSync("./ml-cookies.json", "utf-8"));


export async function searchProducts(query, limit = 5, userPriceRange) {
  console.time('searchProducts execution time');
  const startTime = Date.now();
  const searchUrl = `https://lista.mercadolivre.com.br/${encodeURIComponent(query)}_PriceRange_0-${userPriceRange}_NoIndex_True`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(35000);

  // Define user-agent real para evitar SSR fallback sem React
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119 Safari/537.36"
  );

  await page.goto(searchUrl, { waitUntil: "domcontentloaded" });

  // Força hidratação (ML só carrega a lista após interação/scroll de 1px)
  await page.evaluate(() => window.scrollBy(0, 50));

  // Aguarda especificamente esta classe
  await page.waitForSelector(".poly-card__content", { visible: true });

  const products = await page.evaluate((limit) => {
    const cards = document.querySelectorAll(".poly-card__content");
    const results = [];

    for (let card of cards) {
      if (results.length >= limit) break;

      const linkEl = card.querySelector(".poly-component__title-wrapper a");
      if (!linkEl) continue;

      const title = linkEl.innerText.trim();
      let link = linkEl.href.trim().split("?")[0];

      const priceWhole = card.querySelector(".andes-money-amount__fraction")?.innerText?.trim() ?? null;
      const priceCents = card.querySelector(".andes-money-amount__cents")?.innerText?.trim() ?? null;
      const price = priceCents ? `${priceWhole},${priceCents}` : priceWhole;

      results.push({ title, price, link });
    }

    return results;
  }, limit);

  await browser.close();

  const endTime = Date.now();
  const executionTime = (endTime - startTime) / 1000; // Convert to seconds
  console.log(`[searchProducts] Scraping completed in ${executionTime.toFixed(2)} seconds`);
  console.timeEnd('searchProducts execution time');

  return products;
}

export async function generateMercadolivreLinks(links) {
  const browser = await puppeteer.launch({
    headless: false, // mude para true quando estiver estável
    defaultViewport: null
  });

  const page = await browser.newPage();
  await page.setCookie(...cookies);

  await page.goto("https://www.mercadolivre.com.br/afiliados/linkbuilder#hubs", {
    waitUntil: "networkidle2"
  });

  await page.waitForSelector("textarea");

  await page.type("textarea", links.join("\n"));

  // Dispara evento para habilitar botão
  await page.evaluate(() => {
    const textarea = document.querySelector("textarea");
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  });

  const botaoSelector = "button.button_generate-links";

  // Aguarda botão habilitar
  await page.waitForFunction((sel) => {
    const btn = document.querySelector(sel);
    return btn && !btn.classList.contains("andes-button--disabled");
  }, {}, botaoSelector);

  await page.click(botaoSelector);

  // Aguarda textareas com links prontos
  await page.waitForSelector("textarea[id^='textfield-copyLink']", { timeout: 20000 });

  // EXTRAI OS LINKS CERTOS
  const linksGerados = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("textarea[id^='textfield-copyLink']"))
      .map(t => t.value.trim());
  });

  await browser.close();
  return linksGerados;
}
