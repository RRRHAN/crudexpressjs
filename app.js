const express = require('express');
const app = express();
const port = 3000;
const cons = require('consolidate');
const mysql = require('mysql');
const qstring = require("querystring");
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'crudexpressjs'
});

let NodeSession = require('node-session');
session = new NodeSession({
    secret: 'Q3UBzdH9GEfiRCTKbi5MTPyChpzXLsTD'
});

app.engine('html', cons.swig);

app.set('view engine', 'html');

app.set('views', __dirname + '/views');

app.use('/public', express.static('public'));

app.get('/', function (req, res) {
    connection.query("select * from player", function (err, rows, field) {
        if (err) {
            console.log(err);
        }

        session.startSession(req, res, function () {
            let flashdata = req.session.get('flashdata');
            let datasend = {
                data: rows
            };
            if (flashdata) {
                datasend.flashdata = flashdata;
                req.session.forget('flashdata');
            }
            res.render('index', datasend);
        });
    });
});

app.get('/edit/:id', function (req, res) {
    connection.query("select * from player where ?", {
        id: req.params.id
    }, function (err, rows, field) {
        if (err) {
            console.log(err)
        }
        res.render('edit', {
            data: rows[0]
        })
    });
});

app.post('/edit/:id', function (req, res) {
    let data_post = "";
    req.on('data', function (chuncks) {
        data_post += chuncks;
    });
    req.on('end', function () {
        data_post = qstring.parse(data_post);
        data_post.position = data_post.position.toUpperCase();
        connection.query("update player set ? where ?", [data_post, {
            id: req.params.id
        }], function (err, field) {
            if (err) {
                console.log("error")
                console.log(err)
            }
            session.startSession(req, res, function () {
                req.session.put('flashdata', 'Data update succesfully');
                res.writeHead(302, {
                    "Location": "/"
                });
                res.end();
            });
        });
    });
});

app.get('/tambah', function (req, res) {
    res.render('tambah');
});

app.post('/tambah', function (req, res) {
    let data_post = "";
    req.on('data', function (chuncks) {
        data_post += chuncks;
    });
    req.on('end', function () {
        data_post = qstring.parse(data_post);
        let data = data_post;
        let position = data.position.toUpperCase();
        data.position = position;
        data.photo = data.name + data.club;
        connection.query("insert into player set ? ", data, function (err, field) {
            if (err) {
                console.log(err);
            }
            session.startSession(req, res, function () {
                req.session.put('flashdata', 'Data added succesfully');
                res.writeHead(302, {
                    "Location": "/"
                });
                res.end();
            });
        });
    });
})

app.get('/delete/:id', function (req, res) {
    connection.query("delete from player where ?", {
        id: req.params.id
    }, function (err, field) {

        session.startSession(req, res, function () {
            req.session.put('flashdata', 'Data delete succesfully');
            res.redirect('/')
        });
    });
});

app.get('/detail/:id', function (req, res) {
    connection.query("select * from player where ?", {
        id: req.params.id
    }, function (err, rows, field) {
        if (err) {
            console.error(err);
        }
        res.render('detail', {
            data: rows[0]
        });
    });
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));