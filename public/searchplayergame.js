function searchPlayerGame() {
    //get gamertag
    var playerGamertag  = document.getElementById('playersGamertag').value
    //construct the URL and redirect to it
    window.location = '/playersGames/search/' + encodeURI(playerGamertag)
}