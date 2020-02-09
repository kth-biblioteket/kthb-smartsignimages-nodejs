require('dotenv').config()

const puppeteer = require('puppeteer')
const winston = require('winston');
const fs = require('fs');

const timezoned = () => {
    let options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        timeZone: 'Europe/Stockholm'
    };
    return new Date().toLocaleString('sv-SE', options);
};

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: timezoned
          }),
        winston.format.json()
    ),
    defaultMeta: { service: process.env.SERVICNAME },
    transports: [
      new winston.transports.File({ filename: process.env.LOGFILENAME })
    ]
});

async function savepage(url) {
    if(process.env.DEBUG.indexOf("true") !== -1 ) {
        logger.log('info','Begin ' + url);
    }
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setViewport({
        width: 1080,
        height: 1920,
        deviceScaleFactor: 1,
    });

    try {
        await page.goto(url, {
            waitUntil: 'networkidle0', timeout: process.env.TIMEOUT
        });
        let n = url.lastIndexOf("/");
        let imagefilename = url.substr(n + 1, url.length -n +1) + '.jpg';
        await page.screenshot({path: process.env.WWWIMAGEDIR + imagefilename, quality: parseInt(process.env.IMAGEQUALITY)});
    } 
    catch(error) {
        console.log(error)
        logger.log('error',error);
        browser.close();
        process.exit();
    }

    await browser.close();

    if(process.env.DEBUG.indexOf("true") !== -1 ) {
        logger.log('info','End ' + url);
    }

    setTimeout(function() {
        savepage(url);
    }, process.env.INTERVAL)
    
}

logger.log('info','Service started');

let urls_to_save = process.env.URLS_TO_SAVE.split(",");
urls_to_save.forEach(function(url) {
    savepage(url);
})