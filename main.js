const http = require("http");
const puppeteer = require('puppeteer-extra')

const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

let globalBrowser;

const getBrowser = async () => {
  try {
    if (globalBrowser) {
      return globalBrowser;
    }

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

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36')

    const username = url.split("=").pop();

    await page.goto(`https://instagram.com/${username}`, {
      waitUntil: "networkidle0",
    });

    await page.waitForTimeout(5000)
  //   await page.goto('https://bot.sannysoft.com')
  // await page.waitForTimeout(5000)

    const imageUrl = await page.evaluate(() => {
      let elements = document.getElementsByClassName("_aadp");
      if (elements.length === 0) {
        elements = document.getElementsByClassName("x6umtig");
      }
      const imageElement = elements[0];
      console.log(imageElement);
      return imageElement?.getAttribute("src");
    });

    if(!imageUrl){
      console.log(await page.content(), page.url());
      res.write('data:image/png;base64,'+await page.screenshot({encoding:"base64", fullPage:true}));
      res.end();
      return ;
    }

    const data = {
      username,
      imageUrl,  
    }

    res.writeHead(200, {'Content-Type': 'application/json'});

    res.write(JSON.stringify(data));
    res.end();

  }
  else{
    res.end();
  }
}).listen(process.env.PORT || 3000)