const USER_DIR = './users/';
const fs = require('fs');
const path = require('path');

if (!fs.existsSync(USER_DIR))
    fs.mkdirSync(USER_DIR);

class User {
    constructor(name, key) {
        this.name = name;
        this.key = key;
        this.checkDir();
    }

    checkDir() {
        if (!fs.existsSync(this.dir())) {
            fs.mkdirSync(this.dir());
        }
        if (!fs.existsSync(path.join(this.dir(), './ads')))
            fs.mkdirSync(path.join(this.dir(), './ads'));
        return true;
    }
    
    dir() {
        return `${USER_DIR + this.key}_${this.name}`;
    }
}

module.exports = User;