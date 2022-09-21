/* PROJECT NAME: JSB Synth API */
//const port = process.env.PORT || 3000;
const port = 3000;
const cors = require('cors');
const path = require('path');
const http = require('http');
const mysql = require("mysql");
const dbManager = require("./db_manager");
const express = require('express');
const app = express();
app.use(express.static('public'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
//const sql1 = 'SELECT * FROM jason_test';
//const sql2 = 'SHOW TABLES';
const db = new dbManager();
db.setDatabase('cdkinney_dev_database', 'cdkinney_development', '1945061970$$');
app.get('/jsb_api/', (req, res) => {
    res.send('J.S.B Harpsichord API');
});
// Get DEMO songs from the database
app.get('/jsb_api/demos', (req, res) => {
    const sql1 = 'SELECT * FROM jsb_demo_songs';
    db.queryDB(sql1).then((results) => {
        console.log(results);
        res.json(results);
    })
});
// Get USER created songs
app.get('/jsb_api/users', (req, res) => {
    const sql1 = 'SELECT * FROM jsbV2_user_songs';
    db.queryDB(sql1).then((results) => {
        console.log(results);
        res.json(results);
    })
});
// DELETE song files
app.get('/jsb_api/dasf-', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin.html'))
});
// Handle Save/Upload songs requests
app.post('/jsb_api/save', (req, res) => {
    const sql = 'SELECT * FROM jsbV2_user_songs WHERE id = ?';
    const args = [req.body.id];
    db.queryDB(sql, args).then((results) => {
        let parsed = JSON.parse(results);
        let parsedLen = parsed.length;
        console.log("Length: " + parsedLen);
        if (!parsedLen < 1) {
            update(req, res, parsed[0].id)
            console.log('UPDATE!!');
            return;
        }
        upload(req, res);
        console.log("UPLOAD!!");
    });
});
app.delete('/jsb_api/delete', (req, res) => {
    let sql = "DELETE FROM jsbV2_user_songs WHERE id IN ?"
    let args = req.body;
    db.queryDB(sql, args).then((results) => {
        res.json(results);
        console.log(results);
    })
})

function upload(req, res) {
    let sql = "INSERT INTO jsbV2_user_songs (song_data) VALUES ?";
    let args = [JSON.stringify(req.body)];
    db.queryDB(sql, args).then((results) => {
        let resultsObj = {};
        resultsObj.message = `Song  was UPLOADED! Song ID: ${JSON.parse(results).insertId}`;
		resultsObj.id = JSON.parse(results).insertId;
        res.json(resultsObj);
    });
}

function update(req, res, songID) {
    console.log("songID: " + songID);
    let sql = "UPDATE jsbV2_user_songs SET song_data = " + mysql.escape(JSON.stringify(req.body)) + " WHERE id = ?";
    let args = [songID];
    db.queryDB(sql, args).then((results) => {
        let resultsObj = {};
        resultsObj.message = `Song ${songID} was UPDATED!`;
        res.json(resultsObj);
        console.log(`Song ${songID} has been UPDATED!!`);
    });
}
app.listen(port, () => {
    console.log(`Express server on: ${port}`);
})