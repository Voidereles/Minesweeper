const messageBox = document.querySelector('#messageBox');
messageBox.style.color = 'white';

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

function Board(boardSize, mineCount) {
    let board = {};
    for (let row = 0; row < boardSize; row++) {
        for (let column = 0; column < boardSize; column++) {
            board[row + "_" + column] = new Cell(row, column);
            //row, column, opened, flagged, mined, neighborMineCount
        }
    }

    randomlyAssignMines(board, mineCount);
    calculateNeighborMineCounts(board, boardSize);
    return board;
}

const initializeCells = (boardSize) => {
    let row = 0;
    let column = 0;
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell) => {
        cell.id = row + "_" + column;
        cell.style.color = 'black';
        cell.textContent = '';
        cell.style.backgroundImage = 'radial-gradient(#fff,#e6e6e6)';

        column++;
        if (column >= boardSize) {
            column = 0;
            row++;
        }

        cell.addEventListener("click", handleClick);
        cell.addEventListener("contextmenu", handleRightClick)
    });
};


// $(".cell").each(function () {

//     //bierzemy każdy element o klasie .cell
//     const id = row + "_" + column;
//     $(this).attr("id", id).css('color', 'black').text("");
//     $('#' + id).css('background-image', 'radial-gradient(#fff,#e6e6e6)');

//     column++;
//     if (column >= boardSize) {
//         column = 0;
//         row++;
//     }

//     $(this).off().click(function (e) {
//         handleClick($(this).attr("id"));

//         let isVictory = true;
//         let cells = Object.keys(board);
//         for (let i = 0; i < cells.length; i++) {
//             if (!board[cells[i]].mined) {
//                 //sprawdzamy, czy każda komórka bez miny została otworzona
//                 if (!board[cells[i]].opened) {
//                     isVictory = false;
//                     break;
//                 }
//             }
//         }

//         if (isVictory) {
//             gameOver = true;
//             $('#messageBox').text("Wygrałeś!").css({ 'color': 'white', 'background-color': 'green' });
//             clearInterval(timeout);
//         }
//     });

//     $(this).contextmenu(function (e) {
//         handleRightClick($(this).attr("id"));
//         return false;
//     });
// })
// }


const handleClick = function (event) {
    const id = event.currentTarget ? event.currentTarget.id : event;
    const cellElement = event.currentTarget || document.getElementById(event);
    if (!gameOver) {
        const cell = board[id];

        if (!cell.flagged && !cell.opened) {
            if (cell.mined) {
                loss();
                cellElement.innerHTML = MINE;
                cellElement.style.color = 'red';
            } else {
                cell.opened = true;
                if (cell.neighborMineCount > 0) {
                    const color = getNumberColor(cell.neighborMineCount);
                    cellElement.innerHTML = cell.neighborMineCount;
                    cellElement.style.color = color;
                    cellElement.style.backgroundImage = 'radial-gradient(ff11ec,#ff0000)';
                } else {
                    cellElement.innerHTML = '';
                    cellElement.style.backgroundImage = 'radial-gradient(#e6e6e6,#aaa)';
                    const neighbors = getNeighbors(id);

                    // for (let i = 0; i < neighbors.length; i++) {
                    //     const neighbor = neighbors[i];
                    //     if (board[neighbor] && !board[neighbor].flagged && !board[neighbor].opened) {
                    //         handleClick(neighbor);
                    //     }
                    // }

                    neighbors.forEach((neighbor) => {
                        const canClickOnNeighbor = board[neighbor] && !board[neighbor].flagged && !board[neighbor].opened;
                        if (canClickOnNeighbor) {
                            handleClick(neighbor);
                        }
                    });
                }
            }
        }
        checkWin();
        cellElement.removeEventListener("click", handleClick);
    }
};

const checkWin = () => {
    // let isVictory = true;
    let cells = Object.keys(board);
    // for (let i = 0; i < cells.length; i++) {
    //     if (!board[cells[i]].mined) {
    //         if (!board[cells[i]].opened) {
    //             isVictory = false;
    //             break;
    //         }
    //     }
    // }
    //To co w komentarzu następne kilka linijek zastępuje

    const isVictory = cells.every((cell) => {
        return board[cell].mined || board[cell].opened;
    });

    if (isVictory) {
        gameOver = true;
        // const messageBox = document.querySelector('#messageBox');
        messageBox.textContent = 'Wygrałeś';
        messageBox.style.backgroundColor = 'green';
        clearInterval(timeout);
    }
};

const handleRightClick = (event) => {
    const id = event.currentTarget.id;
    const element = event.currentTarget;
    if (!gameOver) {
        const cell = board[id];
        if (!cell.opened) {
            if (!cell.flagged && minesRemaining > 0) {
                cell.flagged = true;
                element.innerHTML = FLAG;
                element.style.color = 'red';
                minesRemaining--;
            } else if (cell.flagged) {
                cell.flagged = false;
                element.innerHTML = '';
                element.style.color = 'black';
                minesRemaining++;
            }
            const minesElement = document.querySelector('#mines-remaining');
            minesElement.textContent = minesRemaining;
        }
    }
    return false;
};


// const loss = () => {
//     //wywolywana funkcja gdy gracz przegrywa
//     gameOver = true;
//     $('#messageBox').text('Przegrałeś!').css({ 'color': 'white', 'background-color': 'red' });
//     let cells = Object.keys(board);

//     for (let i = 0; i < cells.length; i++) {
//         if (board[cells[i]].mined && !board[cells[i]].flagged) {
//             $('#' + board[cells[i]].id).html(MINE).css('color', 'black');
//         }
//     }

//     clearInterval(timeout);
// }

const loss = () => {
    //wywolywana funkcja gdy gracz przegrywa
    gameOver = true;
    messageBox.textContent = 'Przegrałeś';
    messageBox.style.backgroundColor = 'red';
    const cells = Object.keys(board);
    cells.forEach((cell) => {
        if (board[cell].mined && !board[cell].flagged) {
            const cellElement = document.getElementById(`${board[cell].id}`);
            cellElement.innerHTML = MINE;
            cellElement.style.color = 'black';
        }
    });
    clearInterval(timeout);
};

const randomlyAssignMines = (board, mineCount) => {
    const mineCoordinates = [];

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
}


const calculateNeighborMineCounts = (board, boardSize) => {
    let cell;
    // let neighborMineCount = 0;
    for (let row = 0; row < boardSize; row++) {
        for (let column = 0; column < boardSize; column++) {
            const id = row + "_" + column;
            cell = board[id];
            //najpierw sprawdzamy, czy komórka jest zaminowana
            // if (!cell.mined) {
            //     const neighbors = getNeighbors(id);
            //     //uzywamy pomocniczej metody getNeighbors, która zwraca id 
            //     //komórki, wyzej jest pętla, więc ta funkcja będzie wywołana wiele razy
            //     neighborMineCount = 0;
            //     for (let i = 0; i < neighbors.length; i++) {
            //         neighborMineCount += isMined(board, neighbors[i]);
            //     }

            //     cell.neighborMineCount = neighborMineCount;
            // }

            if (!cell.mined) {
                const neighbors = getNeighbors(id);
                cell.neighborMineCount = neighbors.reduce((acc, current) => acc + isMined(board, current), 0);
                // do tej zmiennej accc przypisuje się wynik z tej reduce
                // reduce leci po całej tablicy neighbors jak pętla i przypisuje do zmiennej acc wynik acc + isMined(board, current)
                // startową wartością jest 0, więc jeżeli nie ma żadnych sąsiadów, to neighborMineCount bedzie wynosił 0
            }

            // 
        }
    }
}

const getNeighbors = (id) => {
    const row = parseInt(id.substring(0, id.indexOf('_')));
    const column = parseInt(id.substring(id.indexOf('_') + 1, id.length));

    const neighbors = [];
    if (row < boardSize || row > boardSize || column < boardSize || column > boardSize) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const x = row + i;
                const y = column + j;
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

// const isMined = (board, id) => {
//     const cell = board[id];
//     let mined = 0;
//     if (typeof cell !== 'undefined') {
//         mined = cell.mined ? 1 : 0;
//         //jeśli cell.mined to prawda, to 1, w inny przypadku 0
//     }
//     return mined;
// }

const isMined = (board, id) => {
    const cell = board[id];
    return cell ? Number(cell.mined) : 0;
    //funkcja odpowiada na pytanie, czy jest pole zaminowane czy nie, 
    //jeśli jest, to powinno zwrócić 1, jeśli nie, to 0
    //Number sprawi, że zwróci 1 a nie "true". 
};


const getRandomInteger = (min, max) => Math.floor(Math.random() * (max - min)) + min;
//bez klamr to to co jest po strzałce to po prostu co funkcja zwraca (return)


const newGame = (boardSize, mines) => {
    document.getElementById('time').textContent = 0;
    messageBox.textContent = 'Rusz się!';
    messageBox.style.backgroundColor = 'blue';

    minesRemaining = mines;
    document.getElementById('mines-remaining').textContent = minesRemaining;

    gameOver = false;
    initializeCells(boardSize);
    board = Board(boardSize, mines);
    timer = 0;
    clearInterval(timeout);

    timeout = setInterval(() => {
        timer++;
        if (timer >= 999) {
            timer = 999;
        }
        document.getElementById('time').textContent = timer;

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

const root = document.documentElement;
// let boardWidth = root.style.getPropertyValue('--board-width');
// var board = newGame(boardSize, mines);
let board;

// root.style.setProperty('--cell-size', 360 / boardSize + "px");

//clearInterval, żeby na początku nie liczyło sekund.
clearInterval(timeout);


document.getElementById('new-game-button').addEventListener('click', () => {
    boardSize = document.getElementById('boardSizeId').value;
    mines = document.getElementById('mineId').value;
    document.getElementById("board").innerHTML = '';
    if (mines >= boardSize * boardSize) {
        mines = boardSize * boardSize - 1;
    }

    for (let i = 0; i < boardSize * boardSize; i++) {
        const newCell = document.createElement("div");
        newCell.className = "cell";
        document.getElementById("board").appendChild(newCell);
    }


    board = newGame(boardSize, mines);
    root.style.setProperty('--cell-size', 360 / boardSize + "px");
    document.querySelector('.board').classList.add('board--visible');


});