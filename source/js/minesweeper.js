
var minesFieldValue = 10;
var boardFieldValue = 6;

var gameBoard;
var gameBoardSize;
var minesAmount;
var elementsMarked = 0;
var elementsOpened = 0;
var gameRunning = false;
var turnsDone = 0;
var firstTurn = true;
var username = "Guest";

var stopper;
var timePassed = 0;

var debug = true;

function start() {
    var bombs = parseInt((boardFieldValue * boardFieldValue) * (minesFieldValue / 100));
    var size = boardFieldValue;

    gameBoardSize = size;
    minesAmount = bombs;

    resetBoard();

    buildGameBoard();
    activateInfoBar();
}

function resetBoard() {
    clearInterval(stopper);
    timePassed = 0;
    gameRunning = true;
    elementsMarked = 0;
    elementsOpened = 0;
    turnsDone = 0;
    firstTurn = true;
}

function stop() {
    gameRunning = false;
    document.getElementById("id-gametable").innerHTML = "<tr><th class=\"gametable-lockscreen\"><div class=\"gametable-text-green\">Gave up? HAH!</div></th></tr>";
    activateOptionBar();
}

function stopperTick() {
    timePassed++;
    var minutes = parseInt(timePassed / 60);
    if (minutes > 10) {
        document.getElementById("id-nav-infobar-timefield").innerHTML = "9:59";
        clearInterval(stopper);
        return;
    }
    var seconds = (timePassed % 60);
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    document.getElementById("id-nav-infobar-timefield").innerHTML = minutes + ":" + seconds;
}

function buildGameBoard() {
    var table = document.getElementById("id-gametable");
    table.innerHTML = '';
    table.oncontextmenu = function() { return false; };

    for (var row = 0; row < gameBoardSize; row++) {
        var tr = document.createElement("TR");

        for (var col = 0; col < gameBoardSize; col++) {
            var td = document.createElement("TD");
            td.setAttribute("row", row);
            td.setAttribute("col", col);
            td.id = row + "/" + col;
            td.setAttribute("state", 1);
            td.setAttribute("flagged", 0);
            td.onclick = function() { openElement(this); };
            td.oncontextmenu = function() { markElement(this); saveGame(); return false; };
            tr.append(td);
        }
        table.append(tr);
    }

}


function markElement(ele) {
	if ((ele.getAttribute("state") == 0) == true || gameRunning == false) return;

    markElementNoCheck(ele);
    document.getElementById("id-nav-infobar-minesfield").innerHTML = minesAmount - elementsMarked;
}

function markElementNoCheck(ele) {
    if (ele.getAttribute("flagged") == 0) {
        ele.setAttribute("flagged", 1);
        ele.style.backgroundColor="#555";
        ele.style.backgroundImage = "url('res/img/lock.png')"; 
        ele.style.backgroundSize= "20% 25%";
        elementsMarked++;

    } else {
        ele.setAttribute("flagged", 0);
        ele.style.backgroundColor=null;
        ele.style.backgroundImage =null;
        elementsMarked--;
    }
}

function openElement(ele) {
    if ((ele.getAttribute("state") == 0) == true || gameRunning == false || ele.getAttribute("flagged") == 1) return;

    turnsDone++;

	ele.setAttribute("state", 0);
    var row = parseInt(ele.getAttribute("row"));
    var col = parseInt(ele.getAttribute("col")); 

    if (firstTurn){
    	gameBoard = makeBoard(minesAmount, gameBoardSize, row, col);
    	firstTurn = false;
    } 


    if (gameBoard[col][row] == 1) {
        gameRunning = false;
        activateOptionBar();
        revealBoms("#f00", "#800");
        submitScore("Lost");
        saveGame();
        return;
    }

    elementsOpened++;

    list = neighbours(gameBoardSize, col, row);

    var sumOfBomms = 0;
    for (var i = 0; i < list.length; i++) {
        if (gameBoard[list[i][0]][list[i][1]] == 1) {
            sumOfBomms = sumOfBomms + 1;
        }
    }


    ele.style.backgroundColor="rgb(255, " + (255 - sumOfBomms * 30) + ", " + (255 - sumOfBomms * 30) + ")";
    ele.style.backgroundImage = "url('res/img/num/" + sumOfBomms + ".png')"; 
    ele.style.backgroundSize= "20% 25%"; 


    ele.style.borderColor="#282828";
    ele.setAttribute("state", 0);

    if (sumOfBomms == 0) {
    	openElements(list);
    }

    if (elementsOpened == gameBoardSize * gameBoardSize - minesAmount) {
        gameRunning = false;
        activateOptionBar();
        revealBoms("#0f0", "#080");
        submitScore("Win");
        saveGame();
        return;
    }
    saveGame();
}

function submitScore(gameResult) {
    httpGetAsync('../cgi-bin/writeScore.py', {
        name: username,
        mines: minesAmount,
        size: gameBoardSize + "x" +gameBoardSize,
        turns: turnsDone,
        result: gameResult
    }, function(response) {
        loadHighScores();
    });
}


function openElements(list) {
    for (var i = 0; i < list.length; i++) {
    	var currentElement = document.getElementById(list[i][1] + "/" + list[i][0]);
    	if (currentElement.getAttribute("state") == 0) continue;
        if (currentElement.getAttribute("flagged") == 1) {
            currentElement.setAttribute("flagged", 0);
            elementsMarked--;
            document.getElementById("id-nav-infobar-minesfield").innerHTML = minesAmount - elementsMarked;
        }
    	var naberList = neighbours(gameBoardSize, parseInt(currentElement.getAttribute("col")), parseInt(currentElement.getAttribute("row")));

    	var sumOfBomms = 0;
		for (var j = 0; j < naberList.length; j++) {
    		if (gameBoard[naberList[j][0]][naberList[j][1]] == 1) {
        		sumOfBomms = sumOfBomms + 1;
    		}
		}
    	currentElement.style.backgroundColor="rgb(255, " + (255 - sumOfBomms * 30) + ", " + (255 - sumOfBomms * 30) + ")";
	    currentElement.style.backgroundImage = "url('res/img/num/" + sumOfBomms + ".png')"; 
	    currentElement.style.backgroundSize= "20% 25%"; 

	    currentElement.style.borderColor="#282828";
    	currentElement.setAttribute("state", 0);
    	elementsOpened++;

    	if (sumOfBomms == 0) openElements(naberList);
    }
}

function revealBoms(color, borderColor) {

    for(var y = 0; y < gameBoardSize; y++) {
        for(var x = 0; x < gameBoardSize; x++) {
            if (gameBoard[x][y] == 1) {
                element = document.getElementById(y + "/" + x);
                element.style.backgroundColor=color;
                element.style.borderColor=borderColor;
            }
        }
    }
    return;
}

function isInt(value) {
  return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value))
}





function makeBoard(bombs,size, startRow, startCol) {
    var board = [];

    for (var x = 0; x < size; x++) {
        board[x] = []; 
        for (var y = 0; y < size; y++) board[x][y] = 0;
    }
	
	var bannedSpots = neighbours(size, startCol, startRow)
	bannedSpots.push([startCol, startRow]);

    var i = bombs;
    while (i > 0) {
        x = Math.floor(Math.random() * size);
        y = Math.floor(Math.random() * size);
        if (board[x][y] != 1) {
        	var banned = false;

        	for(var j = 0; j < bannedSpots.length; j++) {
        		if (bannedSpots[j][0] == x && bannedSpots[j][1] == y){
        			banned = true;
        			break;
        		}
        	}

            if (!banned){
            	board[x][y]=1;
				i--;
            } 
        }
    }

    return board;
}

//Return given element neighbours coordinates as [[x1,y1], [x2,y2] ...]
function neighbours(size,x,y) {
  var list=[];
  for (var i=-1; i<=1; i++) {    
    for (var j=-1; j<=1; j++) {
      if (i==0 && j==0) continue;
      if ((x+i)>=0 && (x+i)<size && (y+j)>=0 && (y+j)<size) {
        list.push([x+i,y+j]);  
      }
    }
  }
  return list;
}




function enterName() {
	if (debug == true) console.log("Setting name...");

    username = document.getElementById("id-modal-authorization-usernamefield").value;
    if (username == "" || username == "Guest") return;

    document.getElementById('id-modal-authorization').style.display = "none";
    document.getElementById('id-header-subtitle').innerHTML = "Welcome back, <div class=\"header-subtitle-isauthorized-true\" onclick = \"openAuthorizationModal()\">" + username + "</div>";
    loadGame();
}

function openAuthorizationModal() {
    document.getElementById('id-modal-authorization').style.display = "block";
    document.getElementById('id-modal-authorization-usernamefield').focus();
}

function openMinesModal() {
    document.getElementById('id-modal-mines').style.display = "block";
}

function openBoardModal() {
    document.getElementById('id-modal-board').style.display = "block";
}

function closeModals() {
    document.getElementById('id-modal-authorization').style.display = "none";
    document.getElementById('id-modal-mines').style.display = "none";
    document.getElementById('id-modal-board').style.display = "none";
}

function setMinesFieldValue(percent) {
    document.getElementById("id-modal-mines-description-20").style.display = "none";
    document.getElementById("id-modal-mines-description-30").style.display = "none";
    document.getElementById("id-modal-mines-description-40").style.display = "none";

    document.getElementById("id-modal-mines-button-20").className = "modal-button-custom";
    document.getElementById("id-modal-mines-button-30").className = "modal-button-custom";
    document.getElementById("id-modal-mines-button-40").className = "modal-button-custom";

    document.getElementById("id-modal-mines-description-" + percent).style.display = "block";
    document.getElementById("id-modal-mines-button-" + percent).className = "modal-button-custom-selected";

    document.getElementById("id-field-mines").innerHTML = percent + "%";
    minesFieldValue = parseInt(percent);
}

function setBoardFieldValue(size) {
    document.getElementById("id-modal-board-description-6").style.display = "none";
    document.getElementById("id-modal-board-description-9").style.display = "none";
    document.getElementById("id-modal-board-description-12").style.display = "none";

    document.getElementById("id-modal-board-button-6").className = "modal-button-custom";
    document.getElementById("id-modal-board-button-9").className = "modal-button-custom";
    document.getElementById("id-modal-board-button-12").className = "modal-button-custom";

    document.getElementById("id-modal-board-description-" + size).style.display = "block";
    document.getElementById("id-modal-board-button-" + size).className = "modal-button-custom-selected";

    var valueText;
    if (parseInt(size) > 9) {
        valueText = "x" + size;
    } else {
        valueText = size + "x" + size
    }
    document.getElementById("id-field-board").innerHTML = valueText;
    boardFieldValue = parseInt(size);
}

function activateInfoBar() {
    document.getElementById("id-nav-infobar-minesfield").innerHTML = minesAmount - elementsMarked;
    document.getElementById("id-nav-infobar-timefield").innerHTML = "0:00";
    document.getElementById("id-nav-menubar").style.display = "none";
    document.getElementById("id-nav-infobar").style.display = "block";
    stopper = setInterval(stopperTick, 1000);
}

function activateOptionBar() {
    document.getElementById("id-nav-infobar").style.display = "none";
    document.getElementById("id-nav-menubar").style.display = "block";
    clearInterval(stopper);
}



function resetData() {
	if (debug == true) console.log("Resetting all data...");

    httpGetAsync('../cgi-bin/resetData.py', null, function(response) {
        loadHighScores();
    });
}


function loadHighScores() {
	if (debug == true) console.log("Requesting highscores...");


    httpGetAsync('../cgi-bin/readScore.py', null, function(response) {
        response = JSON.parse(response);

        var board = document.getElementById("id-footer-scoreboard");
        board.innerHTML = "<tr class=\"footer-scoreboard-titles\"><th>Name</th><th>Mines</th><th>Size</th><th>Turns</th><th>Result</th></tr>";
        var searchPLayer = false;
        searchedPlayer = document.getElementById("id-footer-search-input").value.toLowerCase();
        if (searchedPlayer != "") searchPLayer = true;
        

        for (var i = 0; i < response.length; i++){
            var item = response[i];

            if ((searchPLayer == true) && (item.name.toLowerCase() != searchedPlayer)) continue;
            var tr = document.createElement("TR");

            var td = document.createElement("TD");
            var td2 = document.createElement("TD");
            var td3 = document.createElement("TD");
            var td4 = document.createElement("TD");
            var td5 = document.createElement("TD");

            var textName = document.createTextNode(item.name);
            var textMines = document.createTextNode(item.mines);
            var textSize = document.createTextNode(item.size);
            var textTurns = document.createTextNode(item.turns);
            var textResult = document.createTextNode(item.result);

            if (item.result == "Win") {
                td5.style.color = "#4CAF50";
            } else {
                td5.style.color = "#f55";
            }

            td.append(textName);
            td2.append(textMines);
            td3.append(textSize);
            td4.append(textTurns);
            td5.append(textResult);

            tr.append(td);
            tr.append(td2);
            tr.append(td3);
            tr.append(td4);
            tr.append(td5);

            board.append(tr);

        }
        document.getElementById("id-footer-search-input").value = "";
    });
}

function saveGame() {
    if(username == "Guest") return;

    if (debug == true) console.log("Saving game for user: " + username);

    var bommData = "";
    var openData = "";
    var flagData = "";

    for (var x=0; x<gameBoardSize; x++) {
        for (var y=0; y<gameBoardSize; y++) {
            bommData += gameBoard[x][y];
            openData += document.getElementById(y + "/" + x).getAttribute("state");
            flagData += document.getElementById(y + "/" + x).getAttribute("flagged");
        }
    }  

    if (debug == true){
        console.log("Mines: " + bommData);
        console.log("State: " + openData);
        console.log("Flags: " + flagData);
    }

    httpGetAsync('../cgi-bin/saveGame.py', {
        "name": username.toLowerCase(),
        "size": gameBoardSize,
        "mines": minesAmount,
        "turns": turnsDone,
        "running": gameRunning,
        "startTurn": firstTurn,
        "bommData": bommData,
        "openData": openData,
        "flagData": flagData
    }, function(response) {
        console.log(response);
    });

}


function loadGame() {
	if (debug == true) console.log("Loading gamme with username: " + username);

    resetBoard();

    httpGetAsync('../cgi-bin/loadGame.py', {name: username.toLowerCase()}, function(response) {
            console.log("Restoring user data...");
            response = JSON.parse(response);


            if(Object.keys(response).length == 0) {
                document.getElementById("id-gametable").innerHTML = "<tr><th class=\"gametable-lockscreen\"><div class=\"gametable-text-green\">Welcome my new friend \\^_^/</div></th></tr>";
                activateOptionBar();
                return;
            }
            

            gameRunning = false;
            minesAmount = 0;
            elementsOpened = 0;
            gameBoardSize = parseInt(response.size);

            turnsDone = parseInt(response.turns);
            firstTurn = (turnsDone == 0);


            gameBoard = [];

            for (var x = 0; x < gameBoardSize; x++) {
                gameBoard[x] = []; 
            }


            var bommData = response.bommData.split("");
            var openData = response.openData.split("");
            var flagData = response.flagData.split("");

            for (var x=0; x<gameBoardSize; x++) {
                for (var y=0; y<gameBoardSize; y++) {
                    gameBoard[x][y] = parseInt(bommData[(x * gameBoardSize) + y]);
                    if (gameBoard[x][y] == 1) minesAmount++;
                }
            }

            buildGameBoard();

            gameLost = false;
            listOfOpenedElements = [];
            for (var x=0; x<gameBoardSize; x++) {
                for (var y=0; y<gameBoardSize; y++) {
                    if (parseInt(openData[(x * gameBoardSize) + y]) != 0) continue;
                    if (gameBoard[x][y] == 1) {
                        gameLost = true;
                        continue;
                    }
                    listOfOpenedElements.push([x, y]);
                }
            }

            openElements(listOfOpenedElements);

            for (var x=0; x<gameBoardSize; x++) {
                for (var y=0; y<gameBoardSize; y++) {
                    if (parseInt(flagData[(x * gameBoardSize) + y]) != 1) continue;
                    markElementNoCheck(document.getElementById(y + "/" + x));
                }
            }


            if (gameLost == true) {
                activateOptionBar();
                revealBoms("#f00", "#800");
                return;
            }

            if (elementsOpened == gameBoardSize * gameBoardSize - minesAmount) {
                activateOptionBar();
                revealBoms("#0f0", "#080");
                return;

            }
            
            gameRunning = true;
            activateInfoBar();
    });


 
}


function setEnterKeyFunctionality() {
	if (debug == true) console.log("Setting Enter key functionality...");

	document.getElementById('id-modal-authorization-usernamefield').onkeypress = function(e){
	    if (!e) e = window.event;
	    var keyCode = e.keyCode || e.which;
	    if (keyCode == '13'){
	      enterName();
	      return false;
	    }
  	}

	document.getElementById('id-footer-search-input').onkeypress = function(e){
	    if (!e) e = window.event;
	    var keyCode = e.keyCode || e.which;
	    if (keyCode == '13'){
	      loadHighScores();
	      return false;
	    }
  	}

}


function preparePopUpBoxes() {
	var usernameBox = document.getElementById('id-modal-authorization');
    var minesBox = document.getElementById('id-modal-mines');
    var boardBox = document.getElementById('id-modal-board');

	window.onclick = function(event) {
	    if ((event.target == usernameBox) || (event.target == minesBox) || (event.target == boardBox)) {
	        closeModals();
	    }
	}
}

function loadValuesFromCache() {

    //TODO
    document.getElementById("id-modal-mines-button-20").className = "modal-button-custom-selected";
    document.getElementById("id-modal-mines-description-20").style.display = "block";

    document.getElementById("id-modal-board-button-6").className = "modal-button-custom-selected";
    document.getElementById("id-modal-board-description-6").style.display = "block";

    minesFieldValue = 20;
    boardFieldValue = 6;
}


function httpGetAsync(theUrl, data, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }

    if (data != null) {
        xmlHttp.open("POST", theUrl, true); // true for asynchronous
        xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlHttp.send(serialize(data));
    } else {
        xmlHttp.open("GET", theUrl, true); // true for asynchronous 
        xmlHttp.send(null);
    }
}

function serialize(obj) {
    var str = [];
    for(var p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    return str.join("&");
}





