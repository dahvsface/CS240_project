module.exports = function() {

    var express = require('express');
    var router = express.Router();

    function getPlayers(res, mysql, context, complete) {
        mysql.pool.query("SELECT Players.playerID as playerID, email, firstName, lastName, gamerTag FROM Players", function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.send();
            }
            context.players = results;
            complete();
        })
    }

    router.get('/', function (req, res, next) {
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getPlayers(res, mysql, context, complete);

        function complete() {
            callbackCount++;
            if (callbackCount >= 2) {
                res.render('players', context);
            }
        }
    });

    router.post('/', function(req, res){
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO Players (email, firstName, lastName, gamerTag) VALUES (?,?,?,?)";
        var inserts = [req.body.email, req.body.firstName, req.body.lastName, req.body.gamerTag];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/players');
            }
        });
    });

    return router;
}();

