
//Budget Controller
let budgetController = (function() {

    let Expense = function(id, description, value){
        this.id = id
        this.description = description
        this.value = value
        this.percentage = -1
    }  

    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100)
        } else {
            this.percentage = -1
        }   
    }

    Expense.prototype.getPercentage = function() {
        return this.percentage
    }

    let Income = function(id, description, value){
        this.id = id
        this.description = description
        this.value = value
    }  
    let calculateTotal = function(type){
        let sum = 0 
        let arr = data.allItems[type]

        arr.forEach(x => {
            sum +=x.value
        })
        data.totals[type] = sum
    }

    let data = {
         allItems: {
             exp: [],
             inc: [],
         },
         totals: {
            exp: 0,
            inc: 0,
         },
         budget: 0,
         percentage: -1,
    }

     return {
         addItem: function(type, des, val) {
            let newItem, Id, correctArray
            
            //Create new id )
            if(data.allItems[type].length > 0) {

                Id = data.allItems[type][data.allItems[type].length-1].id + 1
            
            } else {
                Id = 0
            }

            //Create new item bassed on 'inc' or 'exp' type 
            if(type === 'exp'){
                newItem = new Expense(Id, des, val)
            } else if (type === 'inc') {
                newItem = new Income(Id, des, val)
            }

            // //Push it into our data structure
            data.allItems[type].push(newItem)
            //return the new element
            return newItem
        },

        deleteItem: function(type, id) {
            let index, ids
            ids = data.allItems[type].map(function(x) {
                return x.id
            })

            index = ids.indexOf(id)
            
            if(index !== -1) {
                data.allItems[type].splice(index, 1)
            }
            
        },

        calculateBudget: function () {
        
            //calculate total income and expenses
            calculateTotal('exp')
            calculateTotal('inc')

            //calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp
            
            //calculate the percentage of income that we spent
            data.percentage = Math.round((data.totals.exp/data.totals.inc)*100)
        
        },

        calculatePercentages: function() {

            data.allItems.exp.forEach(x => {
                x.calcPercentage(data.totals.inc)
            })

        },

        getPercentage: function() {
            let allPercentages = data.allItems.exp.map(x => {
                return x.getPercentage()
            })
            return allPercentages
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            }
        },     

        testing: function() {
            console.log(data)
        }
    }

})()


//UI Controller
let UIController = (function() {

    let DOMStrings = {
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
        expensesPercentageLabel: '.item__percentage',

    }

    return {
        getinput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value ,    //can be 2 of either   
                description: document.querySelector(DOMStrings.inputDescription).value ,        
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value) ,  
            }                 
        },

        addListItem: function(obj, type) {
            let html, newHtml, element
            //Create HTML string with placeholder text
            if(type === 'exp'){
                element = DOMStrings.expensesContainer
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value% </div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if( type === 'inc'){
                element = DOMStrings.incomeContainer
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description"> %description% </div><div class="right clearfix"><div class="item__value"> %value% </div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
        }
            //Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id)
            newHtml = newHtml.replace('%description%', obj.description)
            newHtml = newHtml.replace('%value%', obj.value)
            //Insert the HTMl into the dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)
        },

        deleteListItem: function(selectorID) {
            let el = document.getElementById(selectorID)
            el.parentNode.removeChild(el)
        },

        clearFields: function() {
            let fields
            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue)

            let fieldsArr = Array.prototype.slice.call(fields)
            fieldsArr.forEach(x => {
                x.value = ""
            })

            fieldsArr[0].focus()
        },

        displayBudget: function(obj) {

            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc
            document.querySelector(DOMStrings.expensesLabel).textContent = obj.totalExp
            document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage

            if(obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%'
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---'
            }

        },

        displayPercentages: function(percentages) {

            let fields = document.querySelectorAll(DOMStrings.expensesPercentageLabel)

            let nodeListforEach = function(list, callback) {
                for (let i = 0; i < list.length; i++) {
                    callback(list[i], i)
                }
            }

            nodeListforEach(fields, function(current, index) {
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%'
                } else {
                    current.textContent ='---'
                }

            })
        },

        formatNumber: function(num, type) {
            /*
            + or - before number 
            exactly 2 decimal points 
            comma separating the thousands            
            */

            num = Math.abs(num)
            num = num.toFixed(2)

            numSplit = num.split('.')


        },

        getDOMStrings: function() {
            return DOMStrings
        },
    }

})()


//Global App Controller
let controller = (function(budgetCtrl, UICtrl) {
    let setupEventListeners =  function() {
        let DOM = UICtrl.getDOMStrings()

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem)

        document.addEventListener('keypress', function(event) {
            //Some old browser uses which
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem()
            }
        })

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)
    }


    let updateBudget = function () {
        //1. Calculate the budget
        budgetCtrl.calculateBudget()

        //2. Return the budget
        let budget = budgetCtrl.getBudget()

        //3. Display the budget on the UI
        UICtrl.displayBudget(budget)
    }

    let updatePercentages = function() {
        //1. Calculate percentages
        budgetCtrl.calculatePercentages()

        //2. Read percentages from the budget controller
        let percentages = budgetCtrl.getPercentage()

        //3. update the ui with the new percentage
        UICtrl.displayPercentages(percentages)
    }    

    let ctrlAddItem = function() {

        let input, newItem
        
        //1. Get the filed input data
        input = UICtrl.getinput()
        if(input.description !== "" && !isNaN(input.value) &&  input.value > 0) {

            //2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value) 

            //3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type)

            //4. Clear the fields
            UICtrl.clearFields()

            //5. Calculate the budget
            updateBudget()

            //6. calulate and update percentage
            updatePercentages()
        }     

    }

    let ctrlDeleteItem = function(event) {
        let itemID, splitID, type, ID
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id

        if(itemID) {

            //inc-1
            splitID = itemID.split('-') 
            type = splitID[0]
            ID = parseInt( splitID[1] )
        
            //1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID)

            //2. delete the item from the ui
            UICtrl.deleteListItem(itemID)

            //3. update and show the new budget
            updateBudget()

            //4. calulate and update percentage
            updatePercentages()
        }
    }

    return {
        init: function() {
            console.log('Application has started.')
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0,
            })
            setupEventListeners()
        }
    }

})(budgetController, UIController)


controller.init()