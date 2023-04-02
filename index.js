const express = require("express");
const app = express();

const bodyParser = require("body-parser"); 
const moment = require("moment"); 
const csv = require('csvtojson');

const fs = require("fs"); 
const path = require("path");

const port = 8080;

const validWeather = new Set(['jasno', 'skoro jasno', 'polojasno', 'skoro zataženo', 'zataženo']);

app.use(express.static('public'));

app.set("view engine", "pug"); 

app.set("views", path.join(__dirname, "views"));

const urlencodedParser = bodyParser.urlencoded({extended: false});
app.post('/data', urlencodedParser, (req, res) => {
    let info = `"${req.body.pocasi}","${req.body.datum}","${req.body.teplota}`;
    if (!validWeather.has(req.body.pocasi)) {
        return res.status(400).json({
            success: false,
            message: "Neplatné počasí"
        });
    }
    if(!moment(req.body.datum, "YYYY-MM-DD", true).isValid()) {
        return res.status(400).json({
            success: false,
            message: "Neplatné datum"
        });
    }
    if(isNaN(req.body.teplota)) {
        return res.status(400).json({
            success: false,
            message: "Neplatná teplota"
        });
    }
    fs.appendFile(path.join(__dirname, 'data/pocasi.csv'), str, function(err) {
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            message: "Nastala chyba během ukládání souboru"
          });
        }
    });
    res.redirect(302, '/');
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});