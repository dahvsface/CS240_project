module.exports = function() {

    var express = require('express');
    var router = express.Router();

    function getGamerTags(res, mysql, context, complete){
        mysql.pool.query("SELECT playerID, gamerTag FROM Players", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.gamerTags  = results;
            complete();
        });
    }

    function getTitles(res, mysql, context, complete){
        mysql.pool.query("SELECT gameID, title FROM Games", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.titles  = results;
            complete();
        });
    }
    
    function getFromGamertag(req, res, mysql, context, complete) {
        var query = "SELECT P.gamertag AS playerID, G.title AS gameID FROM Players P, PlayersGames PG, Games G WHERE " +
        "P.playerID = PG.playerID and PG.gameID = G.gameID WHERE P.gamerTag LIKE " + mysql.pool.escape(req.params.s + '%');
        console.log(query)

        mysql.pool.query(query, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.players = results;
            complete();
        });
    }

    function getplayersGames(res, mysql, context, complete) {
        mysql.pool.query("SELECT P.gamertag AS playerID, G.title AS gameID FROM Players P, PlayersGames PG, Games G WHERE " +
            "P.playerID = PG.playerID and PG.gameID = G.gameID", function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.send();
            }
            context.playersAndGames = results;
            complete();
        })
    }
    
    router.get('/', function (req, res, next) {
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getGamerTags(res, mysql, context, complete);
        getTitles(res, mysql, context, complete);
        getplayersGames(res, mysql, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 3) {
                res.render('playersGames', context);
            }
        }
    });

    router.post('/', function(req, res){
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO PlayersGames (playerID, gameID) VALUES (?,?)";
        var inserts = [req.body.gamerTag, req.body.titles];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/playersGames');
            }
        });
    });

    //search player by gamertag
    router.get('/search/:s', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteplayergame.js","searchplayergame.js"];
        var mysql = req.app.get('mysql');
        getFromGamertag(req, res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('playersGames', context);
            }
        }
    });

    router.delete('/:playerID', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM PlayersGames WHERE playerID = ? AND gameID = ?";
        var inserts = [req.params.playerID, req.params.gameID];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }else{
                res.status(202).end();
            }
        })
    })    
    
    return router;

}();


