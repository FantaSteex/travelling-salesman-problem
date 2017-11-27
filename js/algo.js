var PROBA_CROSSING = 0.95;	// Probability of crossing parents for generating children
var PROBA_MUTATE = 0.1;	// Probability of mutating the newly generated chromosome
var POPULATION_SIZE = 100;
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
function wheelGeneration(elitism) {
	
	var fitnessList = evaluateEveryFitness();

	var sortedFitness = Object.keys(fitnessList).sort(function(a, b) {	// Sort DESC
    	return fitnessList[b] - fitnessList[a];
	});

	var percentages = [];
	for(var i = 0, j = sortedFitness.length-1 ; i < sortedFitness.length ; i++, j--) {
		if(i == j)
			percentages[parseInt(sortedFitness[i])] = fitnessList[parseInt(sortedFitness[i])] / sumOfAllFitness;
		else
			percentages[parseInt(sortedFitness[i])] = fitnessList[parseInt(sortedFitness[j])] / sumOfAllFitness;
	}

	var accumulatedPercentages = [];
	var accu = 0;
	for(var i = 0 ; i < sortedFitness.length ; i++) {
		accu += percentages[sortedFitness[parseInt(i)]];
		accumulatedPercentages[sortedFitness[parseInt(i)]] = accu;
	}

	newPopulation = [];

	var numberElitismPicked = 0;
	if(elitism) {
		copyPopulation = population.slice(0);
		for(var i = sortedFitness.length - 1 ; numberElitismPicked < numberElitism ; i-- && numberElitismPicked++) {
			var id = parseInt(sortedFitness[i]);
			newPopulation.push(population[id].slice(0));
		}
	}

	// Wheel selection
	var parent1 = null, parent2 = null;
	while(newPopulation.length < population.length) {
	
		for(var i = 0 ; i < population.length ; i++) {
			if(accumulatedPercentages[i] >= Math.random()) {	// Select the chromosome
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
		if(newPopulation.length < population.length)
			newPopulation.push(crossing(parent2, parent1));

	}

	//var increment = (elitism ? numberElitismPicked-1:0);	// We don't mutate chromosomes that were selected by elitism
	for(var i = 0 ; i < newPopulation.length ; i++) {
		mutate(newPopulation[i]);
	}

	population = newPopulation.splice(0);
	setBestPath();
}


function rankGeneration(elitism) {
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

	var numberElitismPicked = 0;
	if(elitism) {
		copyPopulation = population.slice(0);
		for(var i = sortedFitness.length - 1 ; numberElitismPicked < numberElitism ; i-- && numberElitismPicked++) {
			var id = parseInt(sortedFitness[i]);
			newPopulation.push(population[id].slice(0));
		}
	}
	//console.log(newPopulation[0], newPopulation[1], population[parseInt(sortedFitness[19])], population[parseInt(sortedFitness[18])]);
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
		if(newPopulation.length < population.length)
			newPopulation.push(crossing(parent2, parent1));

	}
	//console.log(newPopulation, population);
	for(var i = 0 ; i < newPopulation.length ; i++) {
		cleverMutate(newPopulation[i]);
	}
	population = newPopulation.splice(0);
	setBestPath();

}

//	Generates a new population using the rank method
function rankPowGeneration() {
	var fitnessList = evaluateEveryFitness();
	var sortedFitness = Object.keys(fitnessList).sort(function(a, b) {	// Sort DESC
    	return fitnessList[b] - fitnessList[a];
	});
	
	var sortedFitnessList = {};
	var rank = 1;
	for(var i = 0 ; i < sortedFitness.length ; i++) {
		if(sortedFitnessList[fitnessList[sortedFitness[i]]] == null)
			sortedFitnessList[fitnessList[sortedFitness[i]]] = Math.pow(rank++, 2);
	}
	rank = Math.pow(rank-1, 2);
	console.log(sortedFitnessList);
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

function setBestPath() {
	var fitnessList = evaluateEveryFitness();
	//console.log(Object.keys(fitnessList).sort());
	var sortedFitness = Object.keys(fitnessList).sort(function(a, b) {	// Sort DESC
    	return fitnessList[b] - fitnessList[a];
	});
	//console.log(fitnessList, sortedFitness);
	if(bestPath != 0) {	// Not the first loop of the algorithm
		if(oldBestPathsLength.indexOf(getFitness(bestPath)) == -1) {
			oldBestPathsLength.push(getFitness(bestPath));
			//oldBestPathsLength.sort();
		}
	} 
	bestPath = population[sortedFitness[sortedFitness.length-1]];
}




function crossing(chromosome1, chromosome2) {
	/*console.log("CROSSING");
	console.log("c1, c2", chromosome1, chromosome2);*/
	if(Math.random() <= PROBA_CROSSING) {
		var currentChromosome = chromosome1.slice(0); // Can be exchanged with otherChromosome at every crossing point
		var otherChromosome = chromosome2.slice(0);
		var currentNode;
		var solution = [], availableNodes = chromosome1.slice(0);
		var stayingValue, crossingValue;

		solution.push(currentChromosome[0]);	// Adding the starting node to the solution
		if(availableNodes.length > 0)
			availableNodes.splice(availableNodes.indexOf(currentChromosome[0]), 1);	// Remove starting point from available nodes

		currentNode = currentChromosome[0];

		// Loop on each gene of the chromosome
		for(var i = 0 ; i < chromosome1.length - 1 ; i++) {
			// currentNode = currentChromosome[i];	// Current gene
			

			// If currentNode isn't the last gene of currentChromosome's array
			if(currentChromosome[currentChromosome.length-1] != currentNode)
				stayingValue = currentChromosome[currentChromosome.indexOf(currentNode) + 1];	// Value will be the gene on the next index
			else
				stayingValue = currentChromosome[0];	// Value will be the starting node of the path : the first index of the chromosome

			// Same as above, but for the other chromosome
			if(otherChromosome[otherChromosome.length-1] != currentNode)
				crossingValue = otherChromosome[otherChromosome.indexOf(currentNode) + 1];
			else
				crossingValue = otherChromosome[0];

			//console.log(currentNode, currentChromosome, otherChromosome, stayingValue, crossingValue);
			//console.log(currentNode, stayingValue, crossingValue);


			if(!solution.includes(crossingValue) && !solution.includes(stayingValue)) {
				//console.log("Both");
				if(Math.random() < PROBA_CROSSING) { // Crossing
					currentNode = crossingValue;
					if(currentChromosome.equals(chromosome1)) {
						//console.log("Equals", currentChromosome, chromosome1, chromosome2);
						currentChromosome = chromosome2.slice(0);
						otherChromosome = chromosome1.slice(0);
						//console.log("Equals", currentChromosome, chromosome1, chromosome2);
					} else {
						//console.log("Not equals", currentChromosome, chromosome1, chromosome2);
						currentChromosome = chromosome1.slice(0);
						otherChromosome = chromosome2.slice(0);
						//console.log("Not equals", currentChromosome, chromosome1, chromosome2);
					}
				} else {
					currentNode = stayingValue;
				}
			} else if(!solution.includes(crossingValue)) {
				//console.log("crossing");
				currentNode = crossingValue;
				if(currentChromosome.equals(chromosome1)) {
					//console.log("Equals", currentChromosome, chromosome1, chromosome2);
					currentChromosome = chromosome2.slice(0);
					otherChromosome = chromosome1.slice(0);
					//console.log("Equals", currentChromosome, chromosome1, chromosome2);
				} else {
					//console.log("Not equals", currentChromosome, chromosome1, chromosome2);
					currentChromosome = chromosome1.slice(0);
					otherChromosome = chromosome2.slice(0);
					//console.log("Not equals", currentChromosome, chromosome1, chromosome2);
				}
			} else if(!solution.includes(stayingValue)) {
				//console.log("Stay");
				currentNode = stayingValue;
			} else {
				//console.log("Rand");
				currentNode = (availableNodes.length == 1 ? availableNodes[0]:availableNodes[randomInt(0, availableNodes.length - 1)]);	// Randomly choosing a node in the available ones
			}

			solution.push(currentNode);
			if(availableNodes.length > 0)
				availableNodes.splice(availableNodes.indexOf(currentNode), 1);
			
		}
		//console.log("Solution : ", solution);
		return solution;

	} else {
		//console.log("Solution (no cross) : ", chromosome1);
		return chromosome1;
	}
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

function cleverMutate(chromosome) {
	if(Math.random() <= PROBA_MUTATE) {
		//console.log("MUTATE");
		//console.log(chromosome);
		var beginNode = 0, endNode = 1, currentDistance = distance(nodes[0], nodes[1]), previousDistance = distance(nodes[0], nodes[1]), worstDistance = sumOfAllFitness, worstNode = 0, bestDistance = 0;

		for(var i = 0; i < chromosome.length - 1 ; i++) {
			//console.log(i, chromosome[i], chromosome[i+1], nodes[chromosome[i] - 1], nodes[chromosome[i+1] - 1]);
			currentDistance = distance(nodes[chromosome[i] - 1], nodes[chromosome[i+1] - 1]);
			if(currentDistance <= worstDistance) {
				beginNode = chromosome[i];
				endNode = chromosome[i+1];
				worstDistance = currentDistance;
				//console.log("New worst : ", beginNode, endNode);
			}
		}

		//console.log(chromosome, chromosome.length, chromosome[chromosome.length - 1] - 1, chromosome[chromosome.length]);
		//currentDistance = distance(nodes[chromosome[chromosome.length - 1] - 1], nodes[chromosome[chromosome.length] - 1]);
		if(currentDistance <= worstDistance) {
			beginNode = chromosome[chromosome.length - 1];
			endNode = chromosome[0];
			worstDistance = currentDistance;
			//console.log("New worst : ", beginNode, endNode);
		}


		var toMutate;	// Id of the node we will mutate
		//4 7
		if(chromosome[0] == beginNode) {
			//console.log("yes");
			otherNode = chromosome[chromosome.length - 1];
		} else {
			otherNode = chromosome[chromosome.indexOf(beginNode) - 1];
		}
		
		//console.log(beginNode, otherNode, endNode, nodes[beginNode - 1], nodes[otherNode - 1], nodes[endNode - 1]);
		if(distance(nodes[beginNode - 1], nodes[otherNode - 1]) > distance(nodes[beginNode - 1], nodes[endNode - 1]))
			toMutate = chromosome[chromosome.indexOf(beginNode) - 1];
		else
			toMutate = endNode;

		//console.log(toMutate);
		var availableNodes = chromosome.slice(0);

		availableNodes.splice(availableNodes.indexOf(toMutate), 1);	// Can't mutate to its own value

		var newValue = availableNodes[randomInt(0, availableNodes.length - 1)];	// New value of mutating octal
		//console.log(chromosome[rand], newValue, chromosome.indexOf(newValue), toMutate);
		chromosome[chromosome.indexOf(newValue)] = toMutate;
		chromosome[chromosome.indexOf(toMutate)] = newValue;
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