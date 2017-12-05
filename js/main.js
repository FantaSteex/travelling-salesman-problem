var canvas;
var context;
var nodes = [];	// Contains every node in the graph
var NUMBER_OF_NODES = 10;	// Determines how many nodes there will be in the initialized graph
var CANVAS_X;
var CANVAS_Y;
var run = false;	// Determines wether the genetic algorithm is running or not
var randomGenerating = false;	// Determines wether the nodes will be randomly generated or picked from a fixed data set
var population = [];	// Population of NUMBER_OF_NODES chromosomes
var oldBestPathsLength = [];
var copyPopulation = [];
var newPopulation = [];
var bestPath = 0;	// Current best chromosome
var bestPathEver = 0;	// Best chromosome found since the beginning
var speed = 1;
var generation = 1;
var USE_ELITISM = true;
var numberElitism = 5;	// Number of chromosomes we will keep by elitism
var SELECTION_METHOD = "rank";	//"rank" or "wheel"

$(document).ready(function() {
	canvas = $("#canvas")[0];
	context = canvas.getContext("2d");	// Context of the canvas
	CANVAS_X = canvas.width;
	CANVAS_Y = canvas.height;

	$("#mutation").val(PROBA_MUTATE);
	$("#crossing").val(PROBA_CROSSING);
	$("#population").val(POPULATION_SIZE);
	$("#elitism").val("" + USE_ELITISM);
	$("#selection").val(SELECTION_METHOD);

	if(randomGenerating)
		$("#true").prop("checked", true);
	else
		$("#false").prop("checked", true);
	$("#numberNodes").val(""+  NUMBER_OF_NODES);
	$("#fixed").val(NUMBER_OF_NODES);

	$("#start").click(function() {
		if(run) {
			run = false;
			$("#start").text("Start");
		} else {
			run = true;
			$("#start").text("Stop");
		}
	});

	$("#restart").click(function() {
		run = false;
		$("#start").text("Start");
		updateParameters();
		nodes = [];
		population = [];
		oldBestPathsLength = [];
		clear();
		bestPath = 0;
		bestPathEver = 0;
		generation = 1;
		newPopulation = [];
		copyPopulation = [];
		initNodes(randomGenerating);
		generatePopulation();
	});

	$("input[type=radio]").change(function() {
		console.log("pouet");
		if(this.value == "true") {
			$("#fixed").hide();
			$("#randomLabel").show();
		} else {
			$("#randomLabel").hide();
			$("#fixed").show();
		}
	});

	$("#clear").click(function() {
		clear();
	});

	$("#drawNodes").click(function() {
		if(nodes.length > 0) {
			for(var i = 0 ; i < nodes.length ; i++) {
				drawDot(nodes[i]);
			}
		}
	});

	$("#drawPath").click(function() {
		drawPath(bestPath);
	});

	initNodes(randomGenerating);
	generatePopulation();

	setInterval(function() {
		if(run) {
			drawing();

			if(SELECTION_METHOD == "rank")
				rankGeneration(USE_ELITISM);
			else
				wheelCumulatedGeneration(USE_ELITISM);

			$("#bestPath").text(parseInt(getFitness(bestPath)));
			$("#generation").text(generation++);
			
			if(bestPathEver == 0)
				bestPathEver = bestPath;
			else if(getFitness(bestPath) < getFitness(bestPathEver)) {
				bestPathEver = bestPath;
				$("#bestPathEver").text("[" + bestPathEver + "]");
				$("#bestPathEverFitness").text(parseInt(getFitness(bestPathEver)));
				$("#bestPathEverGeneration").text(generation - 1);
			}
		}
		
	}, speed);

	

});

// Updates parameters set with inputs on the page
function updateParameters() {
	PROBA_CROSSING = $("#crossing").val();
	PROBA_MUTATE = $("#mutation").val();
	POPULATION_SIZE = $("#population").val();
	USE_ELITISM = $("#elitism").val();
	SELECTION_METHOD = $("#selection").val();
	randomGenerating = ($("#true").is(":checked") ? true:false);
	console.log(randomGenerating);
	if(randomGenerating)
		NUMBER_OF_NODES = $("#numberNodes").val();
	else
		NUMBER_OF_NODES = $("#fixed").val();

}

//	Inits nodes randomly or not according to rand
function initNodes(rand) {
	if(rand) {
		for(var i = 0 ; i < NUMBER_OF_NODES ; i++) {
			nodes.push(randomNode(i));
		}
	} else {
		initFixedNodes(NUMBER_OF_NODES);
	}
	
}

//	Inits the nodes with fixed values so that we can compare results with different parameters in the GA
function initFixedNodes(number) {
	if(number == 5) {
		nodes.push(new Node (388, 18,0));
		nodes.push(new Node(212, 247,1));
		nodes.push(new Node(111, 44,2));
		nodes.push(new Node(10, 241,3));
		nodes.push(new Node(376, 261,4));
	} else if(number == 10) {
		nodes.push(new Node(306, 161,0));
		nodes.push(new Node (388, 18,1));
		nodes.push(new Node(212, 247,2));
		nodes.push(new Node(111, 44,3));
		nodes.push(new Node(10, 241,4));
		nodes.push(new Node(376, 261,5));
		nodes.push(new Node(356, 248,6));
		nodes.push(new Node(195, 242,7));
		nodes.push(new Node(140, 370,8));
		nodes.push(new Node(84, 50,9));
	} else {
		nodes.push(new Node(289, 280,0));
		nodes.push(new Node (388, 18,1));
		nodes.push(new Node(212, 247,2));
		nodes.push(new Node(111, 44,3));
		nodes.push(new Node(10, 241,4));
		nodes.push(new Node(376, 261,5));
		nodes.push(new Node(356, 248,6));
		nodes.push(new Node(195, 242,7));
		nodes.push(new Node(140, 370,8));
		nodes.push(new Node(84, 50,9));
		nodes.push(new Node(306, 161,10));
		nodes.push(new Node(250, 200,11));
		nodes.push(new Node(192, 254,12));
		nodes.push(new Node(221, 373,13));
		nodes.push(new Node(334, 92,14));
		nodes.push(new Node(232, 105,15));
		nodes.push(new Node(217, 63,16));
		nodes.push(new Node(375, 87,17));
		nodes.push(new Node(340, 367,18));
		nodes.push(new Node(133, 240,19));
		nodes.push(new Node(43, 113,20));
		nodes.push(new Node(236, 147,21));
		nodes.push(new Node(229, 230,22));
		nodes.push(new Node(189, 60,23));
		nodes.push(new Node(42, 9,24));
	}
}

function Node(x, y, id) {
	this.x = x;
	this.y = y;
	this.id = id;
}

// Return a new node instanciated with random values
function randomNode(id) {
	return new Node(parseInt(Math.random() * (CANVAS_X-10)), parseInt(Math.random() * (CANVAS_Y-10)), id);
}

// Returns distance between two nodes
function distance(n1, n2) {
	return Math.sqrt((n1.x - n2.x)*(n1.x - n2.x) + (n1.y - n2.y)*(n1.y - n2.y));
}

//	Draws nodes and then the path if the program is running
function drawing() {
	clear();	//	Clears in case something is already drawn on the canvas
	if(nodes.length > 0) {
		for(var i = 0 ; i < nodes.length ; i++) {
			drawDot(nodes[i]);
		}
		drawPath(bestPath);	// Drawing first chromosome's path
	}
}

//	Draw the dot representing the node
function drawDot(node) {
	context.fillStyle = "#000000";
	context.beginPath();
	context.arc(node.x, node.y, 3, 0, Math.PI * 2, true);
	context.closePath();
	context.fill();
}

//	Draws the path of the salesman represented by the chromosome
function drawPath(chromosome) {
	context.strokeStyle = '#00ff00';
	context.lineWidth = 1;
	context.beginPath();
	// context.moveTo(nodes[chromosome[0] - 1].x, nodes[chromosome[0] - 1].y);
	context.moveTo(nodes[chromosome[0]].x, nodes[chromosome[0]].y);

	for(var i = 1 ; i < chromosome.length ; i++)
		context.lineTo(nodes[chromosome[i]].x, nodes[chromosome[i]].y);

	context.lineTo(nodes[chromosome[0]].x, nodes[chromosome[0]].y);

	context.stroke();
	context.closePath();
}

// Clears everything in the canvas
function clear() {
	context.clearRect(0, 0, CANVAS_X, CANVAS_Y);
}

// Source : https://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});