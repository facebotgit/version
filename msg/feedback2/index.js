function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

var nome = getParameterByName('user');
var versao = getParameterByName('version');

if (nome) {
    var iptNome = document.querySelector('*[name="nome"]');
    iptNome.value = nome;
    iptNome.setAttribute('readonly', 'False');
}

if (versao) {
    var iptVersao = document.querySelector('*[name="versao"]');
    iptVersao.value = versao;
    iptVersao.setAttribute('readonly', 'True');
}