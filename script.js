class Cell {
    constructor(row, column) {
        this.id = row + "_" + column;
        this.row = row;
        this.column = column;
        this.opened = false;
        this.flagged = false;
        this.mined = false;
        this.neighborMineCount = 0;
    }
}

const Board = (boardSize, mineCount) => {
    let board = {};
    for (let row = 0; row < boardSize; row++) {
        for (let column = 0; column < boardSize; column++) {

            let id = `${row}_${column}`;
            board[id] = new Cell(id, row, column);
        }
    }

    board = randomlyAssignMines(board, mineCount);
    board = calculateNeighborMineCounts(board, boardSize);
    return board;
}




let initializeCells = function (boardSize) {
    let row = 0;
    let column = 0;
    $(".cell").each(function () {

        //bierzemy każdy element o klasie .cell
        // $(this).attr("id", row + "_" + column).css('color', 'black').text("");
        // $('#' + row + "_" + column).css('background-image', 'radial-gradient(#fff,#e6e6e6)');

        let id = `${row}_${column}`;
        $(this).attr("id", id).css('color', 'black').text("");
        $(`#${id}`).css('background-image', 'radial-gradient(#fff,#e6e6e6)');


        column++;
        if (column >= boardSize) {
            column = 0;
            row++;
        }

        $(this).off().click(function (e) {
            handleClick($(this).attr("id"));

            let isVictory = true;
            let cells = Object.keys(board);
            for (let i = 0; i < cells.length; i++) {
                if (!board[cells[i]].mined) {
                    //sprawdzamy, czy każda komórka bez miny została otworzona
                    if (!board[cells[i]].opened) {
                        isVictory = false;
                        break;
                    }
                }
            }

            if (isVictory) {
                gameOver = true;
                $('#messageBox').text("Wygrałeś!").css({ 'color': 'white', 'background-color': 'green' });
                clearInterval(timeout);
            }
        });

        $(this).contextmenu(function (e) {
            handleRightClick($(this).attr("id"));
            return false;
        });
    })
}


let handleClick = function (id) {
    if (!gameOver) { //jesli nie ma konca gry

        let cell = board[id];
        let $cell = $('#' + id);
        if (!cell.opened) { //jesli nie jest juz otwarta komorka
            if (!cell.flagged) { //jesli nie jest oflagowana. Ignorujemy klikniecie, jesli komorka jest już otwarta lub oflagowana
                if (cell.mined) {
                    loss();
                    $cell.html(MINE).css('color', 'red');
                }
                else {
                    cell.opened = true;
                    if (cell.neighborMineCount > 0) {
                        let color = getNumberColor(cell.neighborMineCount);
                        $cell.html(cell.neighborMineCount).css({ 'color': color, 'background-image': 'radial-gradient(ff11ec,#ff0000)' });
                    }
                    else {
                        $cell.html("").css('background-image', 'radial-gradient(#e6e6e6,#aaa)');
                        let neighbors = getNeighbors(id);
                        for (let i = 0; i < neighbors.length; i++) {
                            let neighbor = neighbors[i];
                            if (typeof board[neighbor] !== 'undefined' && !board[neighbor].flagged && !board[neighbor].opened) {
                                //jesli element tablicy nie jest undefined, nie jest oflagowany i nie jest otwarty, 
                                //rekurencja sluzy do odkrywania pól w saperze
                                handleClick(neighbor); //wywolani e samej siebie ponownie
                            }
                        }
                    }
                }
            }
        }

    }
}


let handleRightClick = function (id) {
    if (!gameOver) {
        let cell = board[id];
        let $cell = $('#' + id);
        if (!cell.opened) {
            if (!cell.flagged && minesRemaining > 0) {
                cell.flagged = true;
                $cell.html(FLAG).css('color', 'red');
                minesRemaining--;
            }
            else if (cell.flagged) {
                cell.flagged = false;
                $cell.html("").css('color', 'black');
                minesRemaining++;
            }

            $('#mines-remaining').text(minesRemaining);
        }
    }
}

let loss = function () {
    //wywolywana funkcja gdy gracz przegrywa
    gameOver = true;
    $('#messageBox').text('Przegrałeś!').css({ 'color': 'white', 'background-color': 'red' });
    let cells = Object.keys(board);

    for (let i = 0; i < cells.length; i++) {
        if (board[cells[i]].mined && !board[cells[i]].flagged) {
            $('#' + board[cells[i]].id).html(MINE).css('color', 'black');
        }
    }

    clearInterval(timeout);
}

let randomlyAssignMines = function (board, mineCount) {
    let mineCoordinates = [];
    for (let i = 0; i < mineCount; i++) {
        let randomRowCoordinate = getRandomInteger(0, boardSize);
        let randomColumnCoordinate = getRandomInteger(0, boardSize);
        let cell = randomRowCoordinate + "_" + randomColumnCoordinate;
        while (mineCoordinates.includes(cell)) {
            randomRowCoordinate = getRandomInteger(0, boardSize);
            randomColumnCoordinate = getRandomInteger(0, boardSize);
            cell = randomRowCoordinate + "_" + randomColumnCoordinate;
        }
        mineCoordinates.push(cell);
        board[cell].mined = true;
    }
    return board;
}


let calculateNeighborMineCounts = function (board, boardSize) {
    let cell;
    let neighborMineCount = 0;
    for (let row = 0; row < boardSize; row++) {
        for (let column = 0; column < boardSize; column++) {
            let id = row + "_" + column;
            cell = board[id];
            //najpierw sprawdzamy, czy komórka jest zaminowana
            if (!cell.mined) {
                let neighbors = getNeighbors(id);
                //uzywamy pomocniczej metody getNeighbors, która zwraca id 
                //komórki, wyzej jest pętla, więc ta funkcja będzie wywołana wiele razy
                neighborMineCount = 0;
                for (let i = 0; i < neighbors.length; i++) {
                    neighborMineCount += isMined(board, neighbors[i]);
                }

                cell.neighborMineCount = neighborMineCount;
            }
        }
    }
    return board;
}

let getNeighbors = function (id) {
    let row = parseInt(id.substring(0, id.indexOf('_')));
    let column = parseInt(id.substring(id.indexOf('_') + 1, id.length));

    let neighbors = [];
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if ((row < boardSize || row > boardSize || column < boardSize || column > boardSize)) {

                x = row + i;
                y = column + j;
                neighbors.push(x + "_" + y);
            }
        }
    }



    return neighbors;

}

//w zaleznosci od tego, jaki numer, bedzie rozny kolor

/* Funkcja strzałkowa z klamrami musi mieć return 
const getNumberColor = number => {
    return ob[number] || 'black';
};
*/


//pokazywanie sąsiednich pól
const ob = ['black', 'blue', 'green', 'red', 'orange'];
const getNumberColor = number => ob[number] || 'black';

// let isMined = function (board, id) {
//     let cell = board[id];
//     let mined = 0;
//     if (typeof cell !== 'undefined') {
//         mined = cell.mined ? 1 : 0;
//         //jeśli cell.mined to prawda, to 1, w inny przypadku 0
//     }
//     return mined;
// }

// const isMined = (board, id) => {
//     const cell = board[id];
//     let mined = 0;
//     if (typeof cell !== 'undefined') {
//         mined = cell.mined ? 1 : 0;
//         //jeśli cell.mined to prawda, to 1, w inny przypadku 0
//     }
//     return cell.mined;
// }

let isMined = (board, id) => {
    let cell = board[id];
    return cell && cell.mined;
}

let getRandomInteger = function (min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
    //zwraca losową liczbę która jest liczbą całkowitą, służyć będzie do min
}




var newGame = function (boardSize, mines) {
    $('#time').text('0');
    $('#messageBox').text('Rusz się!').css({ 'color': 'rgb(255,255,255)', 'background-color': 'rgb(102,178,255)' });

    minesRemaining = mines;
    $('#mines-remaining').text(minesRemaining);
    gameOver = false;
    initializeCells(boardSize);
    board = Board(boardSize, mines);
    timer = 0;
    clearInterval(timeout);

    timeout = setInterval(function () {
        timer++;
        if (timer >= 999) {
            timer = 999;
        }
        $('#time').text(timer);

    }, 1000);

    return board;
}




const FLAG = "&#9873;";
const MINE = "&#9881;";
let boardSize = document.getElementById('boardSizeId').value;
let mines = document.getElementById('mineId').value;
let timer = 0;
let timeout;
let minesRemaining;

//każda komórka ma swoje id, więc można łatwo do niej nmieć dostep

let root = document.documentElement;
// let boardWidth = root.style.getPropertyValue('--board-width');
var board = newGame(boardSize, mines);

// root.style.setProperty('--cell-size', 360 / boardSize + "px");

$('#new-game-button').click(function () {
    boardSize = document.getElementById('boardSizeId').value;
    mines = document.getElementById('mineId').value;
    document.getElementById("board").innerHTML = '';
    for (let i = 0; i < boardSize * boardSize; i++) {
        let newCell = document.createElement("div");
        newCell.className = "cell";

        document.getElementById("board").appendChild(newCell);
    }


    board = newGame(boardSize, mines);
    root.style.setProperty('--cell-size', 360 / boardSize + "px");
    $('.board').addClass('board--visible');
})