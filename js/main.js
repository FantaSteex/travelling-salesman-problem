var canvas;
var context;
var nodes = [];	// Contains every node in the graph
var NUMBER_OF_NODES = 25;	// Determines how many nodes there will be in the initialized graph
var CANVAS_X;
var CANVAS_Y;
var run = false;	// Determines wether the genetic algorithm is running or not
var randomGenerating = false;	// Determines wether the nodes will be randomly generated or picked from a fixed data set

$(document).ready(function() {
	canvas = $("#canvas")[0];
	context = canvas.getContext("2d");	// Context of the canvas
	CANVAS_X = canvas.width;
	CANVAS_Y = canvas.height;

	initNodes(randomGenerating);
	drawing();


});

function initNodes(rand) {
	if(rand) {
		for(var i = 0 ; i < NUMBER_OF_NODES ; i++) {
			nodes.push(randomNode());
			// TODO : check there isn't already another node with the same values
		}
	} else {
		initFixedNodes();
	}
	
}

function initFixedNodes() {
	nodes.push(new Node (388, 18));
	nodes.push(new Node(212, 247));
	nodes.push(new Node(111, 44));
	nodes.push(new Node(10, 241));
	nodes.push(new Node(376, 261));
	nodes.push(new Node(356, 248));
	nodes.push(new Node(195, 242));
	nodes.push(new Node(140, 370));
	nodes.push(new Node(84, 50));
	nodes.push(new Node(306, 161));
	nodes.push(new Node(4, 18));
	nodes.push(new Node(192, 254));
	nodes.push(new Node(221, 373));
	nodes.push(new Node(334, 92));
	nodes.push(new Node(232, 105));
	nodes.push(new Node(217, 63));
	nodes.push(new Node(375, 87));
	nodes.push(new Node(340, 367));
	nodes.push(new Node(133, 240));
	nodes.push(new Node(43, 113));
	nodes.push(new Node(236, 147));
	nodes.push(new Node(229, 230));
	nodes.push(new Node(189, 60));
	nodes.push(new Node(42, 9));
	nodes.push(new Node(289, 280));
}


function Node(x, y) {
	this.x = x;
	this.y = y;
}

// Return a new node instanciated with random values
function randomNode() {
	return new Node(parseInt(Math.random() * (CANVAS_X-10)), parseInt(Math.random() * (CANVAS_Y-10)));
}

// Returns distance between two nodes
function distance(n1, n2) {
	return Math.sqrt(n1.x - n2.x + n1.y - n2.y);
}

function drawing() {
	clear();	//	Clears in case something is already drawn on the canvas
	if(nodes.length > 0) {
		for(var i = 0 ; i < nodes.length ; i++) {
			drawDot(nodes[i]);
		}
	}
}

function drawDot(node) {
	context.fillStyle = "#000000";
	context.beginPath();
	context.arc(node.x, node.y, 3, 0, Math.PI * 2, true);
	context.closePath();
	context.fill();
}

// Clears everything in the canvas
function clear() {
	context.clearRect(0, 0, CANVAS_X, CANVAS_Y);
}