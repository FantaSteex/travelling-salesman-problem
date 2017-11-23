var PROBA_CROSSING = 0.8725;	// Probability of crossing parents for generating children
var PROBA_MUTATE = 0.01;	// Probability of mutating the newly generated chromosome
var POPULATION_SIZE = 20;
var sumOfAllFitness = 0;	// Updated by evaluateEveryFitness()
var wheel = [];

//	Randomly generates a population of POPULATION_SIZE chromosomes
function generatePopulation() {
	// Generate POPULATION_SIZE chromosomes
	for(var i = 0 ; i < POPULATION_SIZE ; i++) {
		var chromosome = [];
		for(var j = 0 ; j < nodes.length ; j++) {	//	Generate a chromosome containing one time every node's id
			chromosome.push(nodes[j].id);
		}
		shuffle(chromosome);
		population.push(chromosome);
	}
	setBestPath();
}

//	Generates a new population using the wheel method
function wheelGeneration() {
	
	var fitnessList = evaluateEveryFitness();
	var fitnessPercentages = {};	// fitnessPercentages[1180.8] = 0.1857, fitnessPercentages[5609] = 0.03...
	for(var i = 0 ; i < Object.keys(fitnessList).length ; i++) {
		fitnessPercentages[fitnessList[i]] = fitnessList[i] / sumOfAllFitness;
	}

	var tempArray = fitnessPercentages;	// Copy of fitnessPercentages



	// DESC sorted fitnessPercentages.values
	var fitnessPercentagesSorted = Object.keys(fitnessPercentages).sort();	// DESC : sort(function(a, b){return b-a})
	var realPercentages = [];

	var startingPercentage = 0;
	for(var i = 0 ; i < fitnessPercentagesSorted.length ; i++) {
		fitnessPercentagesSorted[i];
	}

	for(var i = 0 ; i < Object.keys(fitnessPercentages).length ; i++) {
		
	}
	// Wheel selection
	var parentsSelectionCompleted = false, parent1 = null, parent2 = null;
	while(!parentsSelectionCompleted) {
		console.log("while");
		for(var i = 0 ; i < population.length ; i++) {
			console.log(i);
			if(fitnessPercentages[getFitness(population[i])] > Math.random()) {	// Select the chromosome
				if(parent1 == null) 
					parent1 = population[i];
				else if(parent2 == null) {
					parent2 = population[i];
					parentsSelectionCompleted = true;
				}
				else {	// Both are set
					parentsSelectionCompleted = true;
					break;
				}	
			}
		}
		newPopulation.push(crossing(parent1, parent2));
		newPopulation.push(crossing(parent2, parent1));

	}

	for(var i = 0 ; i < newPopulation.length ; i++) {
		mutate(newPopulation[i]);
	}

	population = newPopulation.splice(0);
	setBestPath();

}


function setBestPath() {
	var fitnessList = evaluateEveryFitness();
	var sortedFitness = Object.keys(fitnessList).sort(function(a, b) {	// Sort DESC
    	return fitnessList[b] - fitnessList[a];
	});
	console.log(fitnessList, sortedFitness);
	if(bestPath != 0) {	// Not the first loop of the algorithm
		if(oldBestPathsLength.indexOf(getFitness(bestPath)) == -1) {
			oldBestPathsLength.push(getFitness(bestPath));
			//oldBestPathsLength.sort();
		}
	} 
	bestPath = population[sortedFitness[sortedFitness.length-1]];
}


//	Generates a new population using the rank method
function rankGeneration() {
	var fitnessList = evaluateEveryFitness();
	var sortedFitness = Object.keys(fitnessList).sort(function(a, b) {	// Sort DESC
    	return fitnessList[b] - fitnessList[a];
	});

	var sortedFitnessList = {};
	var rank = 1;
	for(var i = 0 ; i < sortedFitness.length ; i++) {
		if(sortedFitnessList[fitnessList[sortedFitness[i]]] == null)
			sortedFitnessList[fitnessList[sortedFitness[i]]] = rank++;
	}

	newPopulation = [];
	while(newPopulation.length < population.length) {

		var parentsSelectionCompleted = false, parent1 = null, parent2 = null;
	
		for(var i = 0 ; i < population.length ; i++) {
			if(sortedFitnessList[getFitness(population[i])] >= randomInt(1, rank-1)) {	// Select the chromosome
				if(parent1 == null) 
					parent1 = population[i];
				else if(parent2 == null) {
					parent2 = population[i];
					parentsSelectionCompleted = true;
				}
				else {	// Both are set
					parentsSelectionCompleted = true;
					break;
				}	

			}
		}

		newPopulation.push(crossing(parent1, parent2));
		newPopulation.push(crossing(parent2, parent1));

	}

	for(var i = 0 ; i < newPopulation.length ; i++) {
		mutate(newPopulation[i]);
	}

	population = newPopulation.splice(0);
	setBestPath();

}

function crossing(chromosome1, chromosome2) {
	//console.log("--------CROSSING");
	//console.log(chromosome1, chromosome2);
	var currentChromosome = chromosome1.slice(0), otherChromosome = chromosome2.slice(0);
	var currentNode;
	var solution = [], availableNodes = chromosome1.slice(0);
	var stayingValue, crossingValue;

	solution.push(currentChromosome[0]);
	if(availableNodes.length > 0)
		availableNodes.splice(availableNodes.indexOf(currentChromosome[0]), 1);


	for(var i = 0 ; i < chromosome1.length - 1 ; i++) {
		currentNode = currentChromosome[i];

		
		if(currentChromosome[currentChromosome.length-1] != currentNode)
			stayingValue = currentChromosome[i+1];
		else
			stayingValue = currentChromosome[0];

		if(otherChromosome[otherChromosome.length-1] != currentNode)	// currentNode not the last value in otherChromosome
			crossingValue = otherChromosome[otherChromosome.indexOf(currentNode) + 1];
		else
			crossingValue = otherChromosome[0];

		
		//console.log(currentNode, stayingValue, crossingValue);
		if(Math.random() < PROBA_CROSSING) {	// Crossing

			currentNode = crossingValue;
			currentChromosome = (currentChromosome == chromosome1 ? chromosome2:chromosome1);
		} else {	// No crossing
			currentNode = stayingValue;
		}

		//console.log(currentNode, availableNodes);

		if(solution.includes(currentNode)) {
			var n = (availableNodes.length == 1 ? availableNodes[0]:availableNodes[randomInt(0, availableNodes.length - 1)])
			solution.push(n);
			if(availableNodes.length > 0)
				availableNodes.splice(availableNodes.indexOf(n), 1);
		}
		else {
			solution.push(currentNode);
			if(availableNodes.length > 0)
				availableNodes.splice(availableNodes.indexOf(currentNode), 1);
		}
		//console.log(solution);
	}

	return solution;
}	

function mutate(chromosome) {
	if(Math.random() <= PROBA_MUTATE) {
		/*console.log("MUTATE");
		console.log(chromosome);*/
		var availableNodes = chromosome.slice(0);

		var rand = randomInt(0, chromosome.length - 1);	// Index of value we have to mutate
		var toMutate = chromosome[rand];	// Value we have to mutate

		availableNodes.splice(availableNodes.indexOf(toMutate), 1);	// Can't mutate to its own value
		//console.log(availableNodes);
		var newValue = availableNodes[randomInt(0, availableNodes.length - 1)];	// New value of mutating octal
		//console.log(chromosome[rand], newValue, chromosome.indexOf(newValue), toMutate);
		chromosome[chromosome.indexOf(newValue)] = toMutate;
		chromosome[rand] = newValue;
		//console.log(chromosome);
	}
}


//	Returns the fitness of the chromosome
function getFitness(chromosome) {
	var pathDistance = 0;
	for(var i = 0 ; i < chromosome.length - 1 ; i++) {
		pathDistance += distance(nodes[chromosome[i] - 1], nodes[chromosome[i+1] - 1]);
	}
	pathDistance += distance(nodes[chromosome[0] - 1], nodes[chromosome[chromosome.length - 1] - 1]);
	return pathDistance;
}

//	Evaluates the fitness of every chromosome in the population
function evaluateEveryFitness() {
	sumOfAllFitness = 0;
	var fitnessList = {}, fitness = 0;
	for(var i = 0 ; i < population.length ; i++) {
		fitness = getFitness(population[i]);
		fitnessList[i] = fitness;
		sumOfAllFitness += fitness;
	}
	return fitnessList;
}

// Found on https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}

function randomInt(lower, upper) {
	return Math.floor(Math.random() * upper) + 1;
}