var p2_Position = 0b00000111110000000000 //Always the other player
var p1_Position = 0b00000000001111100000 //Always the AI

//If The AI makes the wrong move here the human will win
//test move makeMoveAgainstAI("b4","b1")
// var p2_Position = 0b00000011100000010001
// var p1_Position = 0b00000100000110101000

//The AI jumped on one of player 2's pieces
//test the move makeMoveAgainstAI("d3","d1")
// var p2_Position = 0b00010011000000000011
// var p1_Position = 0b00000000100111001000

//The next move makeMoveAgainstAI("d3","d4")
//caused the AI to make invalid moves
// var p1_Position = 0b00000100001000111000
// var p2_Position = 0b10000011000000000011

var timeLimit = 5000; // 5 seconds
var BITMASK = 0xFFFFF;
var p1Flag = true
var p2Flag = true
var tempP1Flag = true;
var tempP2Flag = true;

display.displayBoard(p1_Position,p2_Position);

var AI = {
	'bestMoveStart':-1,
	'bestMoveEnd':-1,
	'bestScore':-Infinity,
	'moveList':[],

	pvs:function(alpha, beta, depth, p1_board, p2_board, pNum){
		if(depth == 0)
			return evaluation.stateValue(p1_board, p2_board, pNum);

		pNum ^= 3; // Change the player number
		var bSearchPv = true;
		var score;

		//Get and loop through all the players pieces.
		var allPieces = pNum == 1 ? p1_board : p2_board;
		for(var piece = bitManip.getLSB(allPieces); allPieces; piece = bitManip.getLSB(allPieces)){
			var allSpaces = p1_board^p2_board^BITMASK;
			var moves = boardAspect.availabeMoves(piece, allSpaces);

			//Get and loop through all the moves a piece can make.
			for(var nextMove = bitManip.getLSB(moves); moves; nextMove = bitManip.getLSB(moves)){

				//b1 and b2 are the temp values for each move made on a board(b)
				var b1 = (pNum == 1 ? p1_board^piece^nextMove : p1_board); 
				var b2 = (pNum == 2 ? p2_board^piece^nextMove : p2_board); 
				if(bSearchPv){
					score = -AI.pvs(-beta, -alpha, depth-1, b1, b2, pNum);
				}
				else{
					score = -AI.pvs(-alpha-1, -alpha, depth-1, b1, b2, pNum);
					if(score > alpha)
						score = -AI.pvs(-beta, -alpha, depth-1, b1, b2, pNum);
				}

				if(score >= beta){
					return beta;
				}
				if(score > alpha){
					alpha = score;
					bSearchPv = false;
					if(score > AI.bestScore && pNum == 1){
						AI.bestScore = score;
						AI.moveList[depth>>1] = {piece, nextMove};
					}
				}
				moves ^= nextMove; //nextMove has been checked, remove it from moves
			}
			allPieces ^= piece; //piece has been checked, remove it from allPieces
		}
		return alpha;
	},
}

var updateBoardp2 = function(start, end){
	p2_Position ^= start^end;
	saveData.saveMove(convert.bitToStandard(start),convert.bitToStandard(end), 2);
}

var updateBoardp1 = function(start, end){
	p1_Position ^= start^end;
	saveData.saveMove(convert.bitToStandard(start),convert.bitToStandard(end), 1);
	AI.bestScore = -Infinity;
	display.displayBoard(p1_Position,p2_Position);
	printData.showBitBoards(p1_Position,p2_Position);
}

var makeMoveAgainstAI = function(start, end){
	var moveStart = convert.inputToBit(start);
	var moveEnd = convert.inputToBit(end);
	var depth = 2;

 	if( evaluation.validateMove(moveStart, moveEnd, p1_Position^p2_Position^BITMASK) ){
 		updateBoardp2(moveStart, moveEnd); // Human move
 		AI.pvs(-Infinity, Infinity, depth, p1_Position, p2_Position, 2);
 		debugger;
 		var s = convert.bitToInt(AI.moveList[(AI.moveList).length-1].piece)
 		var e = convert.bitToInt(AI.moveList[(AI.moveList).length-1].nextMove)
 		updateBoardp1(AI.moveList[(AI.moveList).length-1].piece, AI.moveList[(AI.moveList).length-1].nextMove);
 		return { start: s, end: e };
 	}
 	else{
 		console.log("invalid Move");
 		return -1;
 	}
}