require('dotenv').config()

const puppeteer = require('puppeteer')
const winston = require('winston');
const fs = require('fs');

const timezoned = () => {
    var options = {
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
    defaultMeta: { service: 'user-service' },
    transports: [
      new winston.transports.File({ filename: 'combined.log' })
    ]
});
 
async function savepage() {
    if(process.env.DEBUG.indexOf("true") !== -1 ) {
        logger.log('info','Begin');
    }
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setViewport({
        width: 1080,
        height: 1920,
        deviceScaleFactor: 1,
    });

    try {
        await page.goto('https://apps.lib.kth.se/smartsign/timeeditjq', {
            waitUntil: 'networkidle0'
        });
        await page.screenshot({path: process.env.WWWIMAGEDIR + 'timeeditjq.jpg', quality: 85});
    } catch(error) {
        logger.log('error',error);
    }

    await page.goto('https://apps.lib.kth.se/smartsign/grbjq', {
        waitUntil: 'networkidle0'
    });
    await page.screenshot({path: process.env.WWWIMAGEDIR + 'grbjq.jpg', quality: 85});

    await page.goto('https://apps.lib.kth.se/smartsign/aff', {
        waitUntil: 'networkidle0'
    });
    
    await page.screenshot({path: process.env.WWWIMAGEDIR + 'aff.jpg', quality: 85});

    await browser.close();

    if(process.env.DEBUG.indexOf("true") !== -1 ) {
        logger.log('info','End');
    }

    savepage()
}

logger.log('info','Service started');

savepage()