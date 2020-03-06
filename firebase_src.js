function $(s){return document.querySelector(s);}

function signOut(){
    firebase.auth().signOut();
}

var NOTF = false;
function logIn()
{ 
    firebase.auth().signInWithEmailAndPassword(login.value, password.value)
    .then(x => {
        if (NOTF)
        alert('Logged in');
    })
    .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        alert('Login(admin) incorreto!\n' + errorMessage);
      });

}

const login = $('#login');
const password = $('#pass');