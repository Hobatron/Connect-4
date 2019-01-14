$('img').on('dragstart', function (event) { event.preventDefault(); });
var posX = [9, 99, 189, 279, 369, 459, 549];
var posY = [22, 83, 143, 204, 265, 327];
var checkersInRow = [0, 0, 0, 0, 0, 0, 0];
var chckerColor = ["yellow", "#ee1111"];

$(document).ready(function () {
    $('img').click(function () {
        col = parseInt(this.id - 1)
        if (checkersInRow[col] != 6) {

            newChecker = $("<div class='checker'>");
            yval = posY[checkersInRow[col]];
            checkersInRow[col]++
            newChecker.css("bottom", yval);
            xval = posX[col];
            newChecker.css("left", xval);
            newChecker.css("background-color", chckerColor[0]);
            $("#slots").append(newChecker);

            temp = chckerColor[0];
            chckerColor[0] = chckerColor[1];
            chckerColor[1] = temp;
        };
    });

});