require('dotenv').config()

const puppeteer = require('puppeteer')
const winston = require('winston');

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

    await page.goto('https://kthb-hv.lib.kth.se/smartsign/timeeditjq', {
        waitUntil: 'networkidle0'
    });
    await page.screenshot({path: 'timeeditjq.png'});

    await page.goto('https://kthb-hv.lib.kth.se/smartsign/grbjq', {
        waitUntil: 'networkidle0'
    });
    await page.screenshot({path: 'grbjq.png'});

    await page.goto('https://kthb-hv.lib.kth.se/smartsign/aff', {
        waitUntil: 'networkidle0'
    });
    
    await page.screenshot({path: 'aff.png'});

    await browser.close();

    if(process.env.DEBUG.indexOf("true") !== -1 ) {
        logger.log('info','End');
    }

    savepage()
}

logger.log('info','Service started');

savepage()