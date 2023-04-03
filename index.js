const express = require("express");
const app = express();

const bodyParser = require("body-parser"); 
const moment = require("moment"); 

const sqlite = require('sqlite3');

const db = new sqlite.Database('data/pocasi.db');

const path = require("path");

const port = 8080;

const validWeather = new Set(['jasno', 'skoro jasno', 'polojasno', 'skoro zataženo', 'zataženo']);

app.use(express.static('public'));

app.set("view engine", "pug"); 

app.set("views", path.join(__dirname, "views"));

const urlencodedParser = bodyParser.urlencoded({extended: false});
app.post('/data', urlencodedParser, (req, res) => {
    if (!validWeather.has(req.body.pocasi)) {
        return res.status(400).json({
            message: "Neplatné počasí"
        });
    }
    
    if(!moment(req.body.datum, "YYYY-MM-DD", true).isValid()) {
        return res.status(400).json({
            message: "Neplatné datum"
        });
    }
    
    if(isNaN(req.body.teplota)) {
        return res.status(400).json({
            message: "Neplatná teplota"
        });
    }
    db.run("INSERT INTO teploty (datum, pocasi, teplota) VALUES (?, ?, ?)", req.body.datum, req.body.pocasi, req.body.teplota, function(err) {
        if (err) {
            console.error(err);
            return res.status(500).json({
              message: "Nastala chyba během ukládání souboru"
            });
          }
    });

    res.redirect(302, '/');
});

app.get('/data', (req, res) => {
    db.all("SELECT datum,pocasi,teplota FROM teploty ORDER BY datum ASC", function(err, rows) {
        console.log(rows);
        res.render('data', {pocasi: rows});
    });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});