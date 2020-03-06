const db = firebase.database();

NOTF = true;

function getSearch()
{
    return $('#toSearch').value;
}

function getObjByKEY(key, callback)
{
    db.ref('license/' + key).once('value', snap => {
        var value = snap.val();
        callback(value);
    });
}

function getObjWHERE(qkey, equal, callback)
{
    db.ref('license/').once('value', snap => {
        var value = snap.val();
        var keys = Object.keys(value);
        for (let i = 0; i < keys.length; i ++)
        {
            getObjByKEY(keys[i], obj => {
                var comp = obj[qkey];
                if (!comp) return;
                if (comp.toLowerCase() == equal.toLowerCase())
                {
                    $('#toSearch').value = keys[i] + '';
                    callback(obj);
                    return;
                }
            });
        }
    });
}

function stringfyData(data)
{
    var result = '';
    var keys = Object.keys(data);
    keys.forEach(key => {
        var val = data[key];
        var isObj = false;
        if (typeof val == 'object')
        {
            val = stringfyData(val);
            isObj = true;
        }
        if (typeof val == 'number') val = val + '';
        if (typeof val == 'string' && val.length == 13 && (val / 1) == val)
        {
            var date = new Date(val/1);
            val = date.toLocaleDateString() + ' - ' + date.toLocaleTimeString();
        }
        result += key + ': ' + (isObj ? '{\n' : '') + val + (isObj ? '}' : '') +'\n';
    });
    return result;
}

function pkey()
{
    getObjByKEY(getSearch(), (productInfo) => {
        $('#result').innerText = stringfyData( productInfo );
    });
}

function uname()
{
    getObjWHERE('user', getSearch(), productInfo => {
        $('#result').innerText = stringfyData( productInfo );
    });
}

function uemail()
{
    getObjWHERE('email', getSearch(), productInfo => {
        $('#result').innerText = stringfyData( productInfo );
    });
}

function company()
{
    getObjWHERE('company', getSearch(), productInfo => {
        $('#result').innerText = stringfyData( productInfo );
    });
}

function downloadLicense()
{
    firebase.storage().ref('/' + getSearch() + '/LICENSE.xml').
    getDownloadURL().then(url => {
        window.open(url + '', 'blank');
    });
}