/*

<?xml version="1.0" encoding="UTF-8"?>
<license>
    <company name="TopMotors"></company>
    <user name="nome-de-usuario" email="user-email"></user>
    <product code="PRODUCT CODE"></product>
</license>

*/

async function sha256(message) {
    // encode as UTF-8
    const msgBuffer = new TextEncoder('utf-8').encode(message);                    

    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // convert bytes to hex string                  
    const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
    return hashHex;
}

function $(s){return document.querySelector(s);}

const login = $('#login');
const password = $('#pass');

const company = $('#company');
const userName = $('#usrname');
const userEmail = $('#usremail');

const productKey = $('#productKey');

var admin_user = null;

function download(filename, data) {
    var blob = new Blob([data], {type: 'text/csv'});
    if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else{
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;        
        document.body.appendChild(elem);
        elem.click();        
        document.body.removeChild(elem);
    }
    return blob;
}

function genXml(key)
{
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <license>
        <company name="${company.value}"></company>
        <user name="${userName.value}" email="${userEmail.value}"></user>
        <product code="${key}"></product>
    </license>`;

    var file = download('LICENSE.xml', xml);
    const ref = firebase.storage().ref('/' + key + '/LICENSE.xml');
    return ref.put(file);
}

function signOut(){
    return firebase.auth().signOut();
}

function GenerateLicense(){

    firebase.auth().signInWithEmailAndPassword(login.value, password.value)
    .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        alert('Login(admin) incorreto!\n' + errorMessage);
      });

      firebase.auth().onAuthStateChanged(async function(user) {
        if (user) {
            var key = await sha256(company.value + '\n' + userName.value + '\n' + userEmail.value);
            console.log(key);
            firebase.database().ref('license/' + key).set({
                company: company.value,
                user: userName.value,
                email: userEmail.value
              }).then(() => {
                productKey.value = key;
                genXml(key).then(() => {
                  signOut().then(() => {
                      $('.btn').setAttribute('disabled', 'true');
                  });
                });
              });
        } else {
            console.log('Signed out');
        }
      });
}
