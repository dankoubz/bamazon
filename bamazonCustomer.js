var mysql = require("mysql");
var inquirer = require('inquirer');
var chalk = require("chalk"); // adds colours to console text
var fs = require("fs"); // requries for liri

var userData;
var checkValue;
var newStock;

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "danny1234",
    database: "bamazon",
});


connection.connect(function(err) {
    if (err) throw err;
    display(chalk.red("\n+----------------------------------------------------------------+\n"));
    display(chalk.blue("WELCOME Cursomer to BAM-AZON!"));
    display(chalk.red("\n+----------------------------------------------------------------+\n"));

    runSerachProduct();
});

function runSerachProduct() {
    inquirer.prompt({
        name: "action",
        message: "What is the product ID?",
    }).then(function(answer) {
        var query = connection.query("SELECT * FROM bamazon.products WHERE id =" + answer.action,
            function(err, results) {
                if (err) throw err;
                for (i = 0; i < results.length; i++) {
                    display(chalk.blue("Product: " + results[i].product_name + " || " + "Department: " + results[i].department_name + " || " + "Price: " + +results[i].price + " || " + "Stock: " + +results[i].stock_quantity));
                }
                // connection.end();
                userData = parseInt(answer.action);
                // console.log(userData);
                checkQuantity();
            });
    })
}

function checkQuantity() {
    inquirer.prompt({
        name: "check",
        message: "How many units would like to buy",
    }).then(function(answer) {
        var query = connection.query("SELECT * FROM bamazon.products WHERE id =" + userData,
            function(err, results) {
                if (err) throw err;
                for (i = 0; i < results.length; i++) {
                    checkValue = parseInt(answer.check);
                    if (results[i].stock_quantity < checkValue) {
                        display(chalk.red("Insufficient quantity!"));
                        connection.end();
                    } else {
                        display(chalk.green("Current Stock Level: " + results[i].stock_quantity));
                        display(chalk.green("Successful!"));
                        newStock = results[i].stock_quantity - checkValue;
                        updateData();
                    }
                }

            });
    })
}

// This means updating the SQL database to reflect the remaining quantity.
function updateData() {
    var query = connection.query("UPDATE bamazon.products SET stock_quantity =" + newStock + " WHERE id = " + userData,
        // var query = connection.query("UPDATE bamazon.products SET" + checkValue + "WHERE" + userData,
        function(err, results) {
            if (err) throw err;
            display(chalk.blue("Updating system with new stock"));
            showNewStock();
        }
    )
}

function showNewStock() {
    var query = connection.query("SELECT * FROM bamazon.products WHERE id =" + userData,
        function(err, results) {
            if (err) throw err;
            for (i = 0; i < results.length; i++) {
                var totalPrice = results[i].price * checkValue;
                display(chalk.blue("Product: " + results[i].product_name + " || " + "Department: " + results[i].department_name + " || " + "Price: " + results[i].price + " || " + "Stock: " + +results[i].stock_quantity));
                display(chalk.blue("Yout Total: $" + totalPrice));
                connection.end();
            }
        }
    )
}


function display(dataToLog) {
    console.log(dataToLog);
    fs.appendFile('log.txt', dataToLog + '\n', function(err) {
        if (err) return display('Error logging data to file: ' + err);
    });
}