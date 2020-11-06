const fspath = require('path');
const fs = require('fs');
if (!fs.existsSync(fspath.join(__dirname, './node_modules'))) {
    const {execSync} = require('child_process');
    execSync('npm install');
}

const selenium = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const express = require('express');
const app = express();
const Url = require('url');

const User = require('./user.js');
const FaceBOTAd = require('./ad.js');
const Facebook = require('./facebook.js');

const port = 3000;

const fileupload = require('express-fileupload');
app.use(fileupload());


app.use(express.static(fspath.join(__dirname, './static')));

var allUsers = [];

const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.post('/saveAd', function (req, res) {
    var url = Url.parse(req.url, true);
    var query = url.query;

    var imgGroups = 0;
    if (req.files)
        for (imgGroups = 0; ; imgGroups++) {
            if (!req.files['imgs' + imgGroups]) break;
        }

    var fbtAd = new FaceBOTAd(new User(req.body.userName, req.body.key),
        req.body.name, req.body.description, req.body.price,
        req.body.location, 0, []);

    var dir = fbtAd.defaultSaveDirectory();
    if (!fs.existsSync(fspath.join(__dirname, dir)))
        fs.mkdirSync(fspath.join(__dirname, dir));

    if (req.files)
        for (var grp = 0; grp < imgGroups; grp++) {
            fbtAd.pics[grp] = [];
            var filesLength = Object.keys(req.files['imgs' + grp]).length;
            if (typeof req.files['imgs' + grp] == 'object' && req.files['imgs' + grp].data)
                filesLength = 1;
            for (var i = 0; i < filesLength; i++) {
                var file = req.files['imgs' + grp][i];
                if (!file)
                    file = req.files['imgs' + grp];
                console.log(grp, i, file);
                try {
                    var fname = (grp + '_') + (i + 1) + '.jpeg';
                    fbtAd.pics[grp].push(fname);
                    fs.writeFileSync(fspath.join(__dirname, dir, './' + fname), file.data);
                }
                catch (e) {
                    console.error('Error happened while saving AD.', e);
                }
            }
        }

    fbtAd.save();

    console.log('AD Saved', fbtAd);

    return res.end('OK');

});

function textfy(args) {
    var txt = '';
    for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        if (typeof arg != 'object')
            arg = JSON.stringify(arg);
        if (typeof arg != 'string')
            arg += '';
        while (arg.includes('\n')) arg = arg.replace('\n', '\n');
        txt += (arg + ' ');
    }
    return txt + '\n';
}

function createConsole(res) {
    return {
        res: res,
        log: function () {
            this.res.write('[INFO] ');
            this.res.write(textfy(arguments));
        },
        error: function () {
            this.res.write('[ERROR] ');
            this.res.write(textfy(arguments));
        }
    }
}

app.post('/deleteAd', async (req, res) => {
    try {
        var query = req.body;
        var user = new User(query.userName, query.key);

        var ad = FaceBOTAd.fromName(user, query.adName);
        ad.delete();

        res.end('OK');
    }
    catch (e) {
        res.end(JSON.stringify(e));
    }

});

app.post('/groups', async (req, res) => {
    var konsole = createConsole(res);
    var brw;
    try {

        var query = req.body;


        var browser;

        //#region browser start
        for (var i = 0; i < 5; i++) {
            try {
                var options = new chrome.Options();
                options.setChromeBinaryPath('./chrome-win/chrome.exe');
                const builder = new selenium.Builder();
                builder.setChromeOptions(options);
                browser = builder.forBrowser('chrome').build();
                brw = browser;
                break;
            }
            catch {
                throw('Erro com navegador');
            }
        }
        //#endregion browser end

        var fb = new Facebook(query.fbEmail, query.fbPass, query.fbBornDate);
        await fb.login(browser, konsole);

        var gps = await fb.getGroups(browser, konsole);

        res.write('GROUPS:\n');
        gps.forEach(gp => {
            console.log(gp);
            res.write(gp+'\n');
        });
        res.write('END\n');

    }
    catch (e) {
        res.end(JSON.stringify(e));
    }
    await brw.close();
    res.end();
});

app.get('/test', (req, res) => {
    res.end('FaceBOT');
});

app.post('/publish', async (req, res) => {
    var konsole = createConsole(res);
    var brw;
    var atLeastOne = false;
    try {

        var url = Url.parse(req.url, true);
        var query = req.body;

        var browser;

        //#region browser start
        for (var i = 0; i < 5; i++) {
            try {
                var options = new chrome.Options();
                options.setChromeBinaryPath('./chrome-win/chrome.exe');
                const builder = new selenium.Builder();
                builder.setChromeOptions(options);
                browser = builder.forBrowser('chrome').build();
                brw = browser;
                break;
            }
            catch { }
        }
        //#endregion browser end

        console.log(query);


        var fb = new Facebook(query.fbEmail, query.fbPass, query.fbBornDate);
        await fb.login(browser, console);

        var user = new User(query.userName, query.userKey);
        var ads = query.adNames.split('?');

        for (var i = 0; i < ads.length; i++) {
            var ad = FaceBOTAd.fromName(user, ads[i]);

            var err = false;

            var toPublish = Number(query.numGroups)+1;
            var nGps = await fb.publishAd(browser, ad, toPublish, 0, query.fbGroup, console);
            if (!err) {
                atLeastOne = true;
                res.write(`[${ad.name}] publicado em ${nGps} grupos!\n`);
            }
        }

        res.write('OK');

    }
    catch (e) {
        console.error('Um erro ocorreu: ' + JSON.stringify(e));
        console.log(e);
    }

    if (!atLeastOne)
        res.write('Nenhum anúncio publicado. Tente novamente!');
    // keys.forEach(adname => {
    //     res.write(`[${adname}] publicado em ${adResult[adname]} grupos!\n`);
    // });

    res.end();
    await brw.close();

})

app.listen(port, () => {
    console.log(`Servidor escutando http://localhost:${port}`);
});