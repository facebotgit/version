const selenium = require('selenium-webdriver');
const firefox = require('selenium-webdriver/chrome');
const elements = require('./page-elements.js');
const fspath = require('path');
const fs = require('fs');

const { By, Key } = selenium;

const clipboardy = require('clipboardy');


const FB_LOGIN_URL = 'https://m.facebook.com';

//#region WebTools
/**
 * @param {import('selenium-webdriver').ThenableWebDriver} __browser
 */
var __browser;

const document = {
    /**
     * Finds an element by Css selector
     * @param {String} selector 
     * @returns {import('selenium-webdriver').WebElementPromise}
     */
    querySelector: function (selector) {
        return __browser.findElement(By.css(selector));
    },

    /**
     * Finds an element by Css selector
     * @param {String} selector 
     * @returns {import('selenium-webdriver').WebElementPromise}
     */
    querySelectorAll: function (selector) {
        return __browser.findElements(By.css(selector));
    }
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function awaitUrlChange(page, url) {
    return new Promise((resolve) => {
        while (!page.url == url);
        resolve();
    });
}

async function pageLoad() {
    return __browser.wait(function () {
        return __browser.executeScript('return document.readyState').then(function (readyState) {
            return readyState === 'complete';
        });
    });
}

function webType(element, text, directType) {
    webClick(element);
    if (directType == undefined)
        directType = false;

    if (directType === true) {
        let el = document.querySelector(element);
        return el.sendKeys(text);
    }

    let clip = clipboardy.readSync();
    clipboardy.writeSync(text);
    return new Promise((resolve) => {
        document.querySelector(element).sendKeys(Key.CONTROL, 'v')
            .then(() => {
                clipboardy.writeSync(clip);
                resolve();
            });
    });

}

function webClick(element, js) {
    if (js) {
        let code = 'document.querySelector(\'' + element + '\').click();';
        console.log('code', code);
        return __browser.executeScript(code);
    }
    return document.querySelector(element).click();
}

//#endregion WebTools

class Facebook {
    constructor(email, password, bornDate) {
        this.email = email;
        this.password = password;
        this.bornDate = bornDate;
    }

    /**
     * 
     * Login to Facebook with email and password
     * 
     * @param {import('selenium-webdriver').ThenableWebDriver} browser
     * The selenium browser to load and log into Facebook
     */
    async login(browser, console) {
        __browser = browser;

        await browser.get(FB_LOGIN_URL);

        await sleep(1000);

        try {
            var element = document.querySelector(elements.FB_ENTRAR);
            if ((await element).getText() == 'Entrar')
                (await element).click();
        }
        catch { }

        await sleep(2000);

        await webType(elements.FB_LOGIN_EMAIL, this.email);

        await sleep(2000);

        await webType(elements.FB_LOGIN_PASSWORD, this.password);

        await sleep(2000);

        await webClick(elements.FB_LOGIN_SUBMIT);

        await sleep(4000);

        var gotCheckpoint = (await browser.getCurrentUrl()).includes('/checkpoint');

        console.log('gotckeckpoint?', gotCheckpoint, this.bornDate);

        if (this.bornDate == null) while (gotCheckpoint) await sleep(500);
        else if (gotCheckpoint) {
            console.log('\n  >>> Got checkpoint\n');
            await sleep(3000);
            await webClick(elements.FB_CHECKPOINT_CONTINUE);
            await sleep(4000);
            await webClick(elements.FB_CHECKPOINT_BORN_DATE, true);
            await sleep(4000);
            await webClick(elements.FB_CHECKPOINT_CONTINUE);
            await sleep(4000);
            var split = this.bornDate.split('/');
            console.log(split);
            await webClick(elements.FB_CHECKPOINT_DAY.replace('{X}', split[0]), true);
            await sleep(4000);

            let _bornMonth = split[1];
            if (_bornMonth[0] == '0')
                _bornMonth = _bornMonth.substring(1);

            await webClick(elements.FB_CHECKPOINT_MONTH.replace('{X}', _bornMonth), true);

            await sleep(3000);
            await webClick(elements.FB_CHECKPOINT_YEAR.replace('{X}', split[2]), true);
            await sleep(3000);
            await webClick(elements.FB_CHECKPOINT_CONTINUE);
            await sleep(5000);
            await webClick(elements.FB_CHECKPOINT_CONTINUE);
            await sleep(1000);
        }

        while (await browser.getTitle() != 'Facebook')
            await sleep(1000);
    }

    /**
     * 
     * @param {import('selenium-webdriver').ThenableWebDriver} browser 
     * @param {Console} console 
     */
    async getGroups(browser, konsole) {
        __browser = browser;
        const groupsUrl = 'https://mbasic.facebook.com/groups/?seemore';
        await browser.get(groupsUrl);
        await sleep(5000);
        var groupsElements = await document.querySelectorAll(elements.FB_ALL_GROUPS);
        //console.log(groupsElements);
        var groups = [];
        for (var i = 0; i < groupsElements.length; i++) {
            var group = groupsElements[i];
            groups.push(await group.getAttribute('href'));
        }

        return groups;
    }

    /**
     * 
     * @param {import('selenium-webdriver').ThenableWebDriver} browser 
     * @param {import('./ad.js')} ad 
     * @param {Number} totalGroups 
     * @param {Number} groupsStartOffset 
     * @param {String} groupUrl 
     */
    async publishAd(browser, ad, totalGroups, groupsStartOffset, groupUrl, console) {
        __browser = browser;

        console.log('Started');

        var groupsToPublish = [];

        var tmp = groupUrl.split('\n');
        tmp.forEach(gp => {
            var gUrl = gp.replace('mbasic.facebook.com', 'm.facebook.com');
            groupsToPublish.push(gUrl);
        });

        function shuffle(array) {
            var currentIndex = array.length, temporaryValue, randomIndex;

            // While there remain elements to shuffle...
            while (0 !== currentIndex) {

                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                // And swap it with the current element.
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }

            return array;
        }


        // Loads mobile Facebook

        var N_GPS = 0;

        groupsToPublish = shuffle(groupsToPublish);
        for (var COUNT = 0; COUNT < totalGroups; COUNT++) {
            var startUrlGroup = groupsToPublish[COUNT];
            try {
                await sleep(500);
                await browser.get(startUrlGroup);
                await sleep(1000);

                await pageLoad();

                await sleep(3000);
                await webClick(elements.FB_SELL_ITEM);
                await sleep(3000);

                var dataToFill = {
                    AD_TITLE: ad.name,
                    AD_PRICE: ad.price,
                    AD_DESCRIPTION: ad.description,
                    AD_LOCATION: ad.location
                }

                var keys = Object.keys(dataToFill);
                for (var i = 0; i < keys.length; i++) {
                    var elementKey = keys[i];
                    var elementSelector = elements['FB_' + elementKey];
                    await webType(elementSelector, (dataToFill[elementKey] + ''), elementKey == 'AD_PRICE');
                    await sleep(2000);
                }

                await sleep(2000);

                var pic_grp = ad.pics[ad.pictureGroup];

                for (var i = 0; i < pic_grp.length; i++) {
                    var picture = pic_grp[i];
                    var path;
                    if (!fs.existsSync(picture))
                        path = fspath.join(__dirname, ad.defaultSaveDirectory(), picture);
                    else
                        path = picture;

                    console.log(path);

                    await sleep(1000);
                    await webType(elements.FB_AD_IMG_UPLOAD,
                        path, true);
                    await sleep(1000);
                }

                ad.pictureGroup++;
                if (ad.pictureGroup >= ad.pics.length)
                    ad.pictureGroup = 0;
                ad.save();

                await sleep(1000);

                // Wait picture(s) upload

                var element = document.querySelector(elements.FB_AD_PUBLISH);
                var disabled = await element.getAttribute('disabled');
                while (disabled) {
                    await sleep(1000);
                    disabled = await element.getAttribute('disabled');
                }

                await webClick(elements.FB_AD_PUBLISH);
                await sleep(3000);
                try {
                    await webClick(elements.FB_AD_PUBLISH_AS_SELL);
                }
                catch { }

                await sleep(5000);
                N_GPS++;
            }
            catch {
                
            }

        }

        // await webClick(elements.FB_AD_MORE_GROUPS, true);
        // await sleep(7000);


        // for (let i = 0; i < totalGroups; i ++) {
        //     try {
        //         await browser.executeScript(
        //         `document.querySelectorAll('${elements.FB_AD_GROUP_CHECK}')[${groupsStartOffset + i}].click();`);
        //     }
        //     catch {
        //         try {
        //             await browser.executeScript(
        //                 `document.querySelectorAll('${elements.FB_AD_GROUP_CHECK}')[${i}].click();`);
        //         }
        //         catch {
        //             console.error(`Não foi possível marcar o grupo ${i}`);
        //         }
        //     }
        //     await sleep(500);
        // }

        // await webClick(elements.FB_AD_MORE_GROUPS_PUBLISH, true);
        // await sleep(2000);

        console.log('Anúncio finalizado');
        return N_GPS;
    }
}

module.exports = Facebook;