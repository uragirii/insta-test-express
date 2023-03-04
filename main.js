const http = require("http");
const puppeteer = require('puppeteer');

let globalBrowser;

const getBrowser = async () => {
  try {
    if (globalBrowser) {
      return globalBrowser;
    }
    console.log("Creating new Broswer", process.env.AWS_EXECUTION_ENV, chrome.headless);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    globalBrowser = await  puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      ignoreDefaultArgs: ["--disable-extensions"],
      headless: true,
      ignoreHTTPSErrors: true,
    });
  
    // Just open a new page in case we close all other pages
    void globalBrowser.newPage();

    return globalBrowser;
  } catch (err) {
    console.error(err);
    return null;
  }
}

getBrowser();

http.createServer(async (req, res) => {
  const url = req.url
  if(url.includes("username")){

    console.log("INSIDE")
    const browser = await getBrowser();
    const page = await browser.newPage();

    const username = url.split("=").pop();

    await page.goto(`https://instagram.com/${username}`, {
      waitUntil: "networkidle0",
    });

    const imageUrl = await page.evaluate(() => {
      let elements = document.getElementsByClassName("_aadp");
      if (elements.length === 0) {
        elements = document.getElementsByClassName("x6umtig");
      }
      const imageElement = elements[0];
      return imageElement?.getAttribute("src");
    });

    const data = {
      username,
      imageUrl
    }

    res.writeHead(200, {'Content-Type': 'application/json'});

    res.write(JSON.stringify(data));
    res.end();

  }
  else{
    res.end();
  }
}).listen(process.env.PORT || 3000)