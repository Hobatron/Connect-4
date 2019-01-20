var posX = [9, 99, 189, 279, 369, 459, 549];
var posY = [22, 83, 143, 204, 265, 326];
var checkersInRow = [0, 0, 0, 0, 0, 0, 0];
var chckerColor = {
    yellowTeam: "yellow",
    redTeam: "#ee1111"
};
var currentTeam = "observer";
var playerCount = 0;
var turn = "yellowTeam";
var tracker = {
    6: [0, 0, 0, 0, 0, 0],
    5: [0, 0, 0, 0, 0, 0],
    4: [0, 0, 0, 0, 0, 0],
    3: [0, 0, 0, 0, 0, 0],
    2: [0, 0, 0, 0, 0, 0],
    1: [0, 0, 0, 0, 0, 0],
    0: [0, 0, 0, 0, 0, 0]
};
var verifyWinCon = {
    0: [1, 1],
    1: [-1, -1],
    2: [-1, 1],
    3: [1, -1],
    4: [1, 0],
    5: [-1, 0],
    6: [0, 1],
    7: [0, -1]
}

$(document).ready(function () {
    $('img').on('dragstart', function (event) { event.preventDefault(); });

    var config = {
        apiKey: "AIzaSyBuHfJgX5ung3b62HeEjSzVcq--sErGWCc",
        authDomain: "multiplayer-via-firebase.firebaseapp.com",
        databaseURL: "https://multiplayer-via-firebase.firebaseio.com",
        projectId: "multiplayer-via-firebase",
        storageBucket: "multiplayer-via-firebase.appspot.com",
        messagingSenderId: "575053993367"
    };
    firebase.initializeApp(config);
    var database = firebase.database();

    //placing checkers
    $('img').click(function () {
        if (turn != currentTeam) {
            var col = parseInt(this.id - 1);
            if (checkersInRow[col] != 6) {
                var newMove = {
                    col: col,
                    team: currentTeam
                };
                database.ref("connect4/lastMove").update(newMove);
                database.ref("connect4/lastMove").onDisconnect().remove();
            };
        }
    });
    database.ref("connect4/lastMove").on("value", function (data) {
        col = data.val().col;
        team = data.val().team;
        yval = posY[checkersInRow[col]];
        xval = posX[col];
        checkersInRow[col]++

        checkerDiv = $("<div class='checker'>");
        checkerDiv.css("bottom", yval);
        checkerDiv.css("left", xval);
        checkerDiv.css("background-color", chckerColor[team]);
        $("#slots").append(checkerDiv);
        turn = team;
        logAndSearch(col, checkersInRow[col] - 1, team);
    });


    //Tracking players joining/leaving
    database.ref("connect4/players").on("child_added", function (team) {
        if (team.val().hasOwnProperty("redTeam")) {
            $("#joinRed").css("display", "none");
        } else if (team.val().hasOwnProperty("yellowTeam")) {
            $("#joinYellow").css("display", "none");
        }
        playerCount++;
        $("#needXPlayers").text(playerCount);
        if (playerCount == 2) {
            $(".waiting").css("display", "none");
            $("#slots").css("display", "block");
            if (currentTeam == "redTeam") {
                smartObs = "your";
            } else {
                smartObs = "red player's";
            };
            msg = {
                observer: "Both players have joined, it's " + smartObs + " turn!"
            };
            loadMessage(msg);
        }
    });
    database.ref("connect4/players").on("child_removed", function () {
        $("#userLeft").modal();
        database.ref("connect4/players/" + currentTeam).remove();
    })

    $(".joinBtn").click(function () {
        if (currentTeam == "observer") {
            currentTeam = $(this).attr("data");
            newJoin = {
                [currentTeam]: "joined",
            };
            database.ref("connect4/players/" + currentTeam).update(newJoin);
            database.ref("connect4/players/" + currentTeam).onDisconnect().remove();
            $(".btnHolder").css("display", "none");
            $("#messages").css("height", "168px");
        };
    });

    // Chat
    var dbChat = database.ref("connect4/chat");
    $("#chat").keypress(function (key) {
        if (key.which == 13) { sendMSG(); }
    });
    $("#send").click(function () {
        event.preventDefault();
        sendMSG();
    });

    var sendMSG = function () {
        chatVal = $("#chat").val();
        if (chatVal != "") {
            newMessage = {
                [currentTeam]: chatVal
            }
            dbChat.push(newMessage);
            $("#chat").val("");
        };
    };
    dbChat.limitToLast(1).on("child_added", function (newMsg) {
        loadMessage(newMsg.val());
    });
    var loadMessage = function (msg) {
        msgBox = $("#messages");
        $.each(msg, function (i, v) {
            textDiv = $("<div class='msg-" + i + "'>");
            textDiv.text(v);
            msgBox.append(textDiv);
        });
        var height = msgBox[0].scrollHeight;
        msgBox.scrollTop(height);
    };
    database.ref("connect4/chat").onDisconnect().remove();
    $("#clrChat").click(function () {
        $("#messages").empty();
    });
    $(".reset").click(function () { location.reload() });

    //Checker tracker
    var logAndSearch = function (x, y, team) {
        tracker[x][y] = team;

        for (var i = 0; i < Object.keys(verifyWinCon).length; i++) {
            correct = 0;
            for (var j = 1; j < 4; j++) {
                viewX = verifyWinCon[i][0] * j;
                viewY = verifyWinCon[i][1] * j;
                if (x + viewX >= 0 && y + viewY >= 0 &&
                    x + viewX <= 6 && y + viewY <= 5) {
                    if (team == tracker[x + viewX][y + viewY]) {
                        correct++;
                        if (correct == 3) {
                            $("#winner").text(team + " won!")
                            $("#winner-body").text("Press close to play again!")
                            $("#userWon").modal();
                        };
                    } else {
                        j = 4;
                    };
                };
            };
        };

    };

});