class PathNode {
    constructor(prev, next){
        this.prev = prev;
        this.next = next;
    }

    setNodeNext(newNext){
        this.next = newNext
    }

    setNodePrev(newPrev){
        this.prev = newPrev
    }

    invertNode(){
        let temp = this.next;
        this.next = this.prev;
        this.prev = temp;
    }
}

function arrayEquals(a, b) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
}

function draw(pathData, numData){

    let boardOffset = (500 - (boardSize * tileSize)) / 2;

    function drawGrid(){
        for (let i=0; i<rows; i++){
            for (let j=0; j<cols; j++){
                ctx.strokeRect(...toCanvasCoords(i, j, boardOffset, boardOffset), tileSize, tileSize)
            }
        }
    }

    function drawPath(){
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.beginPath();
    
        let nextCoords = pathData.headCoords;
    
        while (nextCoords !== null){
            ctx.lineTo(...toCanvasCoords(...nextCoords, boardOffset + (tileSize / 2), boardOffset + (tileSize / 2)));
            nextCoords = pathData.grid[nextCoords[0]][nextCoords[1]].next;
        }
    
        ctx.stroke();
        
        if (renderEndpoints) {
            ctx.beginPath();
            ctx.fillStyle = "red";
            ctx.arc(...toCanvasCoords(...pathData.headCoords, 0, 0), 5, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.beginPath();
            ctx.fillStyle = "black";
            ctx.arc(...toCanvasCoords(...pathData.tailCoords, 0, 0), 5, 0, 2 * Math.PI);
            ctx.fill();

        }
    }

    function drawNums(){
        let numIndex = 0
        let nextCoords = pathData.headCoords;
    
        while (nextCoords !== null){
            ctx.fillText(numData[numIndex].toString(), ...toCanvasCoords(...nextCoords, boardOffset + (tileSize / 2), boardOffset + (tileSize / 2) - 5), 40)
            numIndex += 1;

            nextCoords = pathData.grid[nextCoords[0]][nextCoords[1]].next;
        }
    }

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "lightskyblue";
    ctx.fillRect(...toCanvasCoords(...pathData.headCoords, boardOffset, boardOffset), tileSize, tileSize)

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    drawGrid();

    if (showPath){
        drawPath()
    }

    ctx.font = `${tileSize / 4}px sans-serif`
    ctx.fillStyle = "black";
    drawNums()
}

/*
this function is intended to take a coordinate pair of list indices, like a point in the grid
and scale it appropriately for drawing that point onto the canvas
*/
function toCanvasCoords(x, y, xOffset, yOffset){
    //return [40 + yOffset + (40 * y), 40 + xOffset + (40 * x)]
    return [yOffset + (tileSize * y), xOffset + (tileSize * x)]
}

//todo: make this change size of canvas element corresponding to game board size
function resizeCanvas(){

}

function clearCanvas(){
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

//generates initial hamiltonian path, the "Plough" shape, from which the actual game path is made via backbite
function initGridPath(rows, cols){
    let grid = [];
    let node = null;

    let headCoords = [0,0];
    let tailCoords = null;
    let previousCoords = null;

    for (let i = 0; i < rows; i++){
        let row = [0, 0, 0, 0, 0];

        for (let j = 0; j < cols; j++){

            if (i == 0 && j == 0){
                node = new PathNode(null, [i, j+1]);

                
                row[j] = node;
                previousCoords = [i, j];
            }

            else {
                //going right
                if (i % 2 == 0){

                    if (j == cols - 1){
                        if (i == rows - 1){
                            node = new PathNode(previousCoords, null);
                            tailCoords = [i, j];
                        }

                        else {
                            node = new PathNode(previousCoords, [i+1,j]);
                        }
                    }

                    else {
                        node = new PathNode(previousCoords, [i,j+1]);
                    }

                    row[j] = node;
                    previousCoords = [i, j];
                }

                //going left
                else {

                    if (j == cols - 1){
                        if (i == rows - 1){
                            node = new PathNode(previousCoords, null);
                            tailCoords = [i, cols - (j+1)];
                        }

                        else {
                            node = new PathNode(previousCoords, [i+1, cols - (j + 1)]);
                        }
                    }

                    else {
                        node = new PathNode(previousCoords, [i, cols - (j + 2)]);
                    }

                    row[cols - (j+1)] = node;
                    previousCoords = [i, cols - (j+1)];
                }
            }
        }

        grid.push(row);
    }

    console.log("Initial computation done!")
    console.log(grid);

    return {
        "grid": grid,
        "headCoords": headCoords,
        "tailCoords": tailCoords
    }
}

/*
This function is extremely important to the game!
An implementation of the "backbite" algorithm to generate a Hamiltonian path on the board...
i.e a path that visits every time without crossing itself... extended here to also take diagonal paths!
*/
function backbite(pathData){

    function getNode(coords){
        return pathData.grid[coords[0]][coords[1]]
    }

    function identifyValidNeighbours(endpoint){

        let validNeighbours = [];

        //look left, right, up and down (create loop to check combinations of axes
        [-1, 0, 1].forEach((x) => {
            [-1, 0, 1].forEach((y) => {
                
                if (!(x == 0 && y == 0)){
                    if (0 <= endpoint[0] + x && endpoint[0] + x < rows){
                        if (0 <= endpoint[1] + y && endpoint[1] + y < cols){
    
                            let neighbourCoords = [endpoint[0] + x, endpoint[1] + y];
                            let endpointNode = getNode(endpoint);
    
                            if (!(arrayEquals(neighbourCoords, endpointNode.prev) || arrayEquals(neighbourCoords, endpointNode.next))){

                                validNeighbours.push(neighbourCoords);
                            }
                        }
                    }
                }
            })
        })

        return validNeighbours;
    }

    function identifyValidDisconnection(endpoint, neighbour){
        //head + tail adjacency cases
        if (endpointFlag && arrayEquals(neighbour, pathData.tailCoords)){
            getNode(neighbour).setNodeNext(endpoint);
            getNode(endpoint).setNodePrev(neighbour);

            pathData.headCoords = getNode(endpoint).next;
            pathData.tailCoords = endpoint;

            getNode(getNode(endpoint).next).setNodePrev(null);
            getNode(endpoint).setNodeNext(null);
        }

        else if (!endpointFlag && arrayEquals(neighbour, pathData.headCoords)){
            getNode(neighbour).setNodePrev(endpoint);
            getNode(endpoint).setNodeNext(neighbour);

            pathData.headCoords = getNode(neighbour).next;
            pathData.tailCoords = neighbour;

            getNode(getNode(neighbour).next).setNodePrev(null);
            getNode(neighbour).setNodeNext(null);

        }

        //recurse through neighbour's prev and next to find cycle and subpath
        else {
            let neighbourNext = getNode(neighbour).next;

            while (neighbourNext != null && !(arrayEquals(neighbourNext, endpoint))){
                neighbourNext = getNode(neighbourNext).next;
            }

            //following neighbour's "next" edge took you to selected endpoint (forming loop)
            if (arrayEquals(neighbourNext, endpoint)){
                let prevRegressionNode = endpoint;

                while (!(arrayEquals(prevRegressionNode, getNode(neighbour).next))){
                    getNode(prevRegressionNode).invertNode()
                    prevRegressionNode = getNode(prevRegressionNode).next;
                }
                
                getNode(prevRegressionNode).invertNode()

                pathData.tailCoords = prevRegressionNode;
                getNode(prevRegressionNode).setNodeNext(null);

                getNode(neighbour).setNodeNext(endpoint);
                getNode(endpoint).setNodePrev(neighbour);

            }

            //following it took you to the other endpoint (forming subpath)
            else {
                let nextRegressionNode = endpoint;

                while (!(arrayEquals(nextRegressionNode, getNode(neighbour).prev))){
                    getNode(nextRegressionNode).invertNode()
                    nextRegressionNode = getNode(nextRegressionNode).prev;
                }

                getNode(nextRegressionNode).invertNode()

                pathData.headCoords = nextRegressionNode;
                getNode(nextRegressionNode).setNodePrev(null);

                getNode(neighbour).setNodePrev(endpoint);
                getNode(endpoint).setNodeNext(neighbour);
                
            }

        }
    }

    let endpointFlag = Math.round(Math.random());
    let selectedEndpoint = endpointFlag == 1 ? pathData.headCoords : pathData.tailCoords;
    let neighbours = identifyValidNeighbours(selectedEndpoint);
    let selectedNeighbour = neighbours[Math.floor(Math.random() * neighbours.length)];

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    ctx.beginPath();
    ctx.fillStyle = "yellow";
    ctx.arc(...toCanvasCoords(...selectedEndpoint, 0, 0), 5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = "green";
    ctx.arc(...toCanvasCoords(...selectedNeighbour, 0, 0), 5, 0, 2 * Math.PI);
    ctx.stroke();

    identifyValidDisconnection(selectedEndpoint, selectedNeighbour);
    return pathData
}

//generates the sequence of numbers that will be used to populate the game board
function generateNumbers(rows, cols){
    let iterations = ((rows * cols) - 1)/ 2;
    console.log(iterations);

    let seed = Math.ceil(Math.random() * 25);
    console.log(seed);
    let numBuffer = [seed];

    for (let i = 0; i < iterations; i++){
        let term = Math.ceil(Math.random() * 25);
        let resultBuffer = []
        
        if (seed + term < 100){
            resultBuffer.push(seed + term);
        }

        if (seed * term < 100){
            resultBuffer.push(seed * term);
        }

        if (seed - term > 0){
            resultBuffer.push(seed - term);
        }

        if (seed % term == 0){
            resultBuffer.push(seed / term);
        }

        let result = resultBuffer[Math.floor(Math.random() * resultBuffer.length)]
        numBuffer.push(term, result);
        seed = result;
    }

    return numBuffer;
}

function generatePuzzle(){

    boardSize = sizeSelect.value;
    rows = boardSize;
    cols = boardSize;
    tileSize = sizeMapping[boardSize];

    path = initGridPath(rows, cols);

    for (let i=0; i < 100; i++){
        path = backbite(path);
    }
    
    clearCanvas();
    numPath = generateNumbers(rows, cols);
    draw(path, numPath);

}

function newPuzzleHandler(){
    showPath = false;
    generatePuzzle();
}

function pathToggleHandler(){
    showPath? showPath = false : showPath =  true;

    clearCanvas();
    draw(path, numPath);
}

const biteButton = document.getElementById("newPuzzleButton");
biteButton.addEventListener("click", newPuzzleHandler);

const pathButton = document.getElementById("togglePath");
pathButton.addEventListener("click", pathToggleHandler);

const sizeSelect = document.getElementById("sizeSelect");
let boardSize = sizeSelect.value;

let rows = boardSize;
let cols = boardSize;
let path = initGridPath(rows, cols);

let showPath = false;
let renderEndpoints = false;

let sizeMapping = {
    5: 70,
    7: 60,
    9: 50,
}
let tileSize = sizeMapping[boardSize];

generatePuzzle();