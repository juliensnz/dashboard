var http = require('http'),
    request = require('request'),
    port = 8000;
var fs = require('fs');

var config;

fs.readFile('app/config.json', 'utf8', function (err, data) {
    if (err) {
        console.log('Error on config file read: ' + err);
        return;
    }

    config = JSON.parse(data);
});

http.createServer(function(req, res) {
    var apiType = req.url.substr(1, req.url.substr(1).indexOf('/'));
    req.url = req.url.substr(req.url.substr(1).indexOf('/') + 1);

    switch (apiType) {
        case 'scrutinizer':
            req.url = config.scrutinizer.baseUrl + req.url + '?access_token=' + config.scrutinizer.token;
            console.log(req.url);
            break;
        case 'jenkins':
            req.url = config.jenkins.baseUrl + req.url;
            req.headers.Authorization = 'Basic ' + config.jenkins.token;
            break;
        case 'jira':
            req.url = config.jira.baseUrl + req.url;
            req.headers.Authorization = 'Basic ' + config.jira.token;
            break;
        case 'travis':
            req.url = config.travis.baseUrl + req.url;
            break;
        case 'github':
            req.url = config.github.baseUrl + req.url;
            break;
        default:
            return;
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    console.log(req.url);

    req.pipe(request(req.url).on('error', function(e) {
       console.log('Error: \n' + e.message);
       console.log(e);
       console.log(req.url);
    })).pipe(res);
}).listen(port);

