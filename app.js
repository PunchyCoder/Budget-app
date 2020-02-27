
// BUDGET CONTROLLER
var budgetController = (function() {
	

	//Some code
	var Expense = function(id, description, value) {
		this.id = id,
		this.description = description;
		this.value = value;
	}

	var Income = function(id, description, value) {
		this.id = id,
		this.description = description;
		this.value = value;
	} 

	var calculateTotal = function(type) {
		var sum = 0;
		data.allItems[type].forEach(function(cur) {
			sum += cur.value; 
		});

		data.totals[type] = sum;
	};

	var data = {
		allItems: {
			exp: [],
			inc: []
		},

		totals: {
			exp: 0,
			inc: 0
		}
	}

	return {
		addItem: function(type, des, val) {
			var newItem, ID;

			// Create new ID
			if(data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length -1].id + 1;
			} else {
				ID = 0;
			}
			

			// Create new item based on 'inc' and 'exp'
			if (type === 'inc'){
				newItem = new Income(ID, des, val);
			}else if (type === 'exp'){
				newItem = new Expense(ID, des, val);
			}

			// Push newItem to the data structure
			data.allItems[type].push(newItem);

			// Return the new element
			return newItem;
		},

		deleteItem: function(type, id) {

			var ids = data.allItems[type].map(function(cur, index) {
					return cur.id;
			})

			index = ids.indexOf(id);

			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}			

		},

		calculateBudget: function() {

			// calculate total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');

			// calculate the budget: income - expenses
			data.budget = data.totals.inc - data.totals.exp;

			// calculate the percentage of income that we spent
			if(data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else { data.percentage = -1; }
			
		},

		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			}
		},

		testMethod: function() {
			console.log(data)
		}
	};

})();




// UI CONTROLLER
var UIController = (function() {

	// Some Code

	var DOMstrings =  {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',

	}

	return {

		getInput: function() {

			return {
				type: document.querySelector(DOMstrings.inputType).value, // ------Will be eithor 'inc' or 'exp'
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
			}
			
		},

		addListItem: function(obj, type) {

			var html, newHtml, element;

			// Create HTML string with placeholder text
			if(type === 'inc') {
				element = DOMstrings.incomeContainer;

				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

			} else if (type === 'exp') {
				element = DOMstrings.expensesContainer;

				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percent%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			

			// Replace the placeholder text with some actual data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', obj.value);

			// Insert the HTML into the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

		},

		clearFields: function() {
			var fields, fieldsArr;

			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

			fieldsArr = Array.prototype.slice.call(fields);

			fieldsArr.forEach((current, index, array) => {
				current.value = "";
			})

			fieldsArr[0].focus();

		},

		displayBudget: function(obj) {
				document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
				document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
				document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;

				if( obj.percentage > 0) {
					document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
				}else {
					document.querySelector(DOMstrings.percentageLabel).textContent = '---';
				}

		},

		getDOMstrings: function() {
			return DOMstrings;
		}

	}


})();




// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

	var setupEventListeners = function() {

		var DOM = UICtrl.getDOMstrings();

		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
		document.addEventListener('keypress', function(e) {
			if(e.which === 13 || e.keyCode == 13) {
				ctrlAddItem();
			}
		})

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)

	}


	var updateBudget = function() {

		// Calculate the budget
		budgetCtrl.calculateBudget();

		// Return the budget
		var budget = budgetCtrl.getBudget();


		// Display the budget on the UI
		console.log(budget);
		UICtrl.displayBudget(budget);

	}

	
	var ctrlAddItem = function() {
		var input, newItem;


		// Get the field input data
		input = UICtrl.getInput();

		if (input.value !== "" && !isNaN(input.value) && input.value > 0) {

			// Add the item to the budget controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.value)


			// Add the item to the UI
			UICtrl.addListItem(newItem, input.type);

			// Clear the fields
			UICtrl.clearFields();

			// Calculate the budget
			updateBudget();

			// Display the budget on the UI

			console.log("it works..")

		};

	}

	var ctrlDeleteItem = function(e) {
		var itemID, splitID, type, ID;

		itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;

		if (itemID) {

			//inc-1
			splitID = itemID.split('-');
			item = splitID[0];
			ID = parseInt(splitID[1]);


			// Delete the item from the data structure
			budgetCtrl.deleteItem(item, ID);

			// Delete the item from the UI


			// Update and show the new budget



		}


	} 

	return {
		init: function() {
			console.log('Application has started.')
			setupEventListeners();
			updateBudget();
		}
	}


})(budgetController, UIController);


controller.init();