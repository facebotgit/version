const fs = require('fs');
const fspath = require('path');
const User = require('./user');
const rimraf = require('rimraf');

/*
    ads
      -> myAd
        -> ad.json
        -> 1.group
        -> 2.group
*/

function __getDirName(name) {
    var _allowed='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var fileName = '/';
    for (var i = 0; i < (name).length; i ++) {
        var ch = (name)[i];
        if (!_allowed.includes(ch))
            fileName += '-';
        else
            fileName += ch;
    }
    return fileName;
}

class FaceBOTAd {
    constructor(user, adName, adDescription, adPrice, adLocation, currPicGroup, pics) {
        while (adPrice.includes('.'))
            adPrice = adPrice.replace('.', '');
        this.user = user;
        this.name = adName;
        this.description = adDescription;
        this.price = adPrice;
        this.location = adLocation;
        this.pictureGroup = currPicGroup;
        this.pics = pics;
    }

    static fromFile(user, file) {
        var json = JSON.parse(fs.readFileSync(file));
        var ad = new FaceBOTAd(user, json.name, json.description,
            json.price, json.location, json.pictureGroup, json.pics);
        return ad;
    }

    static fromName(user, name) {
        return this.fromFile(user, fspath.join(user.dir(),'ads',__getDirName(name),'/ad.json'));
    }

    saveToFile(fileName) {
        var string = JSON.stringify({
            name: this.name,
            description: this.description,
            price: this.price,
            location: this.location,
            pictureGroup: this.pictureGroup,
            pics: this.pics
        });

        console.log('Creating ad');
        var path = fspath.join(fileName, '..');
        console.log(path)
        if (!fs.existsSync(path))
            fs.mkdirSync(path);

        fs.writeFileSync(fileName, string);

    }

    getDirName() {
        return __getDirName(this.name);
    }

    defaultSaveDirectory() {
        return fspath.join(this.user.dir(), 'ads', this.getDirName());
    }

    save() {
        this.saveToFile(fspath.join(this.defaultSaveDirectory(), '/ad.json'));
    }

    delete() {
        rimraf.sync(fspath.join(__dirname, this.defaultSaveDirectory()));
    }
}



module.exports = FaceBOTAd;