import puppeteer from "puppeteer";

export default async function scraping(url: string) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });
  await page.waitForNetworkIdle();

  const images = await page.evaluate(() => {
    const container = document.querySelector(".sc-kszsFN.anCON");
    const imageElement = container!.querySelector("img");
    if (imageElement) {
      return { src: imageElement.src };
    } else {
      return null;
    }
  });

  const status = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll(".sc-fbWUsZ.eClvNc"),
      (titleElement, index) => ({
        status: titleElement.textContent,
        start:
          document.querySelectorAll(".sc-eZKLwX.eLqITE")[index].textContent,
        biling:
          document.querySelectorAll(".sc-ywFzA.dRunTB")[index].textContent,
        renewal:
          document.querySelectorAll(".sc-ywFzA.dRunTB")[index + 1].textContent,
      })
    )
  );

  const stats = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll(".sc-gDGHff.jmxQJH"),
      (titleElement, index) => ({
        title: titleElement.textContent,
        value:
          document.querySelectorAll(".sc-iLOkMM.bxlmoG")[index].textContent,
      })
    )
  );

  const tableData = await page.evaluate(() => {
    const table = document.querySelector("table");

    if (!table) return null;

    const headers = Array.from(table.querySelectorAll("th")).map((th) =>
      th.innerText.trim()
    );
    const rows = Array.from(table.querySelectorAll("tbody tr")).map((tr) => {
      const cells = Array.from(tr.querySelectorAll("td"));
      return cells.map((td) => td.innerText.trim());
    });

    const data = rows.map((row) => {
      return row.reduce(
        (acc, value, index) => ({
          ...acc,
          [headers[index].replace(/[\n]|arrow_downward/g, "")]: value.replace(
            /[\n]|arrow_downward/g,
            ""
          ),
        }),
        {}
      );
    });

    return data;
  });

  await browser.close();
  return { images, status, stats, tableData };
}
