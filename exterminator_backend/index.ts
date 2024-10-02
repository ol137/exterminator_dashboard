import { Request, Response } from 'express';

const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const argon = require('argon2');

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "db"
});

const server = express();
server.use(cors());
server.options('*',cors());

server.use(session({
	secret: "secret",
	resave: true,
	saveUninitialized: true
}));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(express.static(path.join(__dirname, 'static')));

server.listen(8080, function(){
    console.log("Backend running on port 8080");
})

server.post("/checkUser", function(request: Request, response: Response){
    const username = request.body.username;

    if(username){
        db.query("SELECT * FROM users WHERE username = ?", [username], function(error: Error, results: any){
            if(error){
                throw error;
            }
            else if (results.length > 0){
                response.json({status: "TAKEN"});
            }
            else{
                response.json({status: "AVAILABLE"});
            }
            response.end();
        });
    }
    else{
        response.status(500).json({error: "Username is required"});
        response.end();
    }
});

server.post("/createUser", async function(request: Request, response: Response){
    const username = request.body.username;
    const password = request.body.password;
    const accountType = request.body.account_type;

    if(username && password && accountType){
        const hashedPass = await argon.hash(password, "aggie");
        db.query("INSERT INTO users (username, password, account_type) VALUES (?, ?, ?)", [username, hashedPass, accountType], function(error: Error){
            if(error){
                throw error;
            }
            else{
                response.json({status: "OK"});
            }
            response.end();
        });
    }
    else{
        response.status(500).json({error: "Username and password are both required"});
        response.end();
    }
});

server.post("/login", async function(request: Request, response: Response){
    const username = request.body.username;
    const password = request.body.password;
    
    if(username && password){
        db.query("SELECT * FROM users WHERE username = ?", [username], async function(error: Error, results: any){
            if(error){
                throw error;
            }
            else if(results.length > 0){
                const user = JSON.parse(JSON.stringify(results[0]));
                if(!(await argon.verify(user.password, password, "aggie"))){
                    response.json({status: "INVALID PASSWORD"});
                }
                else{
                    response.json({status: "OK", account_type: user.account_type});
                }
            }
            else{
                response.json({status: "INVALID USER"});
            }
            response.end();
        });
    }
    else{
        response.status(500).json({error: "Username and password are both required"});
        response.end();
    }
});

server.post("/submitOrder", async function(request: Request, response: Response){
    const submittedBy = request.body.submitted_by;
    const pest = request.body.pest;
    const location = request.body.location;
    const size = request.body.size;

    if(pest && location && size){
        db.query("INSERT INTO workorders (submitted_by, pest, location, size, status) VALUES (?, ?, ?, ?, ?)", [submittedBy, pest, location, size, 0], function(error: Error){
            if(error){
                throw error;
            }
            else{
                response.json({status: "OK"});
                response.end();
            }
        });
    }
    else{
        response.status(500).json({error: "submitted_by, pest, location, and size are all required"});
        response.end();
    }
});

server.post("/getAllOrders", async function(request: Request, response: Response){
    db.query("SELECT * FROM workorders", async function(error: Error, results: any){
        if(error){
            throw error;
        }
        else{
            const workOrders = JSON.parse(JSON.stringify(results));
            //console.log(workOrders);
            response.json(workOrders);
            response.end();
        }
    });
});

server.post("/getUserOrders", async function(request: Request, response: Response){
    const user = request.body.username;

    if(user){
        db.query("SELECT * FROM workorders WHERE submitted_by = ?", [user], async function(error: Error, results: any){
            if(error){
                throw error;
            }
            else{
                const workOrders = JSON.parse(JSON.stringify(results));
                //console.log(workOrders);
                response.json(workOrders);
                response.end();
            }
        });
    }
    else{
        response.status(500).json({error: "Username is required"});
        response.end()
    };

});

server.post("/getSupplies", async function(request: Request, response: Response){
    db.query("SELECT * FROM supplies", async function(error: Error, results: any){
        if(error){
            throw error;
        }
        else{
            const supplies = JSON.parse(JSON.stringify(results));
            //console.log(supplies);
            response.json(supplies);
            response.end();
        }
    });
});

server.post("/updateSupplies", async function(request: Request, response: Response){
    const orders = request.body.orders;

    // Check stock_amount of cash in supplies
    // Loop through orders and calculate total cost
    // Check if you have enough cash to buy everything
    // If you do, loop thru orders and update the amounts in supplies
    // Subtract the calculated cost from cash

    db.query("SELECT stock_amount FROM supplies WHERE supply_type = ?", ["Cash"], async function(error: Error, results: any){
        if(error){
            throw error;
        }
        else{
            let json = JSON.parse(JSON.stringify(results));
            let cash = json[0].stock_amount;

            if(orders){
                //console.log(orders);
                let cost: number = 0;
                for(let i = 0; i < orders.length; i++){
                    cost += orders[i].cost;
                }
                //console.log("cost is " + cost + " and cash is " + cash);
                if(cost > cash){
                    response.json({error: "You do not have enough cash to make this purchase"});
                    response.end();
                }
                else{
                    //console.log("purchasing");
                    for(let i = 0; i < orders.length; i++){
                        db.query("UPDATE supplies SET stock_amount = stock_amount + ? WHERE supply_type = ?", [orders[i].amount, orders[i].type], async function(error: Error, results: any){
                            if(error){
                                throw error;
                            }
                        });
                    }
                    db.query("UPDATE supplies SET stock_amount = stock_amount - ? WHERE supply_type = ?", [cost, "Cash"], async function(error: Error){
                        if(error){
                            throw error;
                        }
                        else{
                            response.json({status: "OK"});
                            response.end();
                        }
                    });
                }
            }
            else{
                response.status(500).json({error: "Orders list is required"});
                response.end()
            }
        }
    })
});

server.post("/getOrderInfo", async function(request: Request, response: Response){
    const size = request.body.size;

    if(size){
        db.query("SELECT * FROM orderinfo WHERE size = ?", [size], async function(error: Error, results: any){
            if(error){
                throw error;
            }
            else{
                const orderInfo = JSON.parse(JSON.stringify(results));
                //console.log(orderInfo);
                response.json(orderInfo[0]);
                response.end();
            }
        });
    }
    else{
        response.status(500).json({error: "Order size is required"});
        response.end();
    }
});

server.post("/getVehicles", async function(request: Request, response: Response){
    db.query("SELECT * FROM vehicles", async function(error: Error, results: any){
        if(error){
            throw error;
        }
        else{
            const vehicles = JSON.parse(JSON.stringify(results));
            response.json(vehicles);
            response.end();
        }
    });
});

server.post("/getEmployees", async function(request: Request, response: Response){
    db.query("SELECT * FROM employees", async function(error: Error, results: any){
        if(error){
            throw error;
        }
        else{
            const employees = JSON.parse(JSON.stringify(results));
            response.json(employees);
            response.end();
        }
    });
});

server.post("/getPestType", async function(request: Request, response: Response){
    const pest = request.body.pest;

    if(pest){
        db.query("SELECT * FROM pesttypes WHERE pest = ?", [pest], async function(error: Error, results: any){
            if(error){
                throw error;
            }
            else{
                const pestType = JSON.parse(JSON.stringify(results));
                response.json({pest: pestType[0].type});
                response.end();
            }
        });
    }
    else{
        response.status(500).json({error: "Pest is required"});
        response.end();
    }
});

server.post("/completeOrder", async function(request: Request, response: Response){
    const orderID = request.body.order_id;
    const pay = request.body.pay;

    // Update cash in supplies to increase it by pay
    // Select workorder with id orderID and get vehicle and employee IDs
    // Set used = 0 for those ids
    // Set vehicle and employee to NULL in the order
    // Set status = 2 for the order

    if(orderID){
        db.query("UPDATE supplies SET stock_amount = stock_amount + ? WHERE supply_type = ?", [pay, "Cash"], async function(error: Error, results: any){
            if(error){
                throw error;
            }
            else{
                db.query("SELECT * FROM workorders WHERE id = ?", [orderID], async function(error: Error, results: any){
                    if(error){
                        throw error;
                    }
                    else{
                        const vehicleID = results[0].vehicle;
                        const employeeID = results[0].employee;
                        db.query("UPDATE vehicles SET used = 0 WHERE id = ?", [vehicleID], async function(error: Error, results: any){
                            if(error){
                                throw error;
                            }
                            else{
                                db.query("UPDATE employees SET used = 0 WHERE id = ?", [employeeID], async function(error: Error, results: any){
                                    if(error){
                                        throw error;
                                    }
                                    else{
                                        db.query("UPDATE workorders SET status = 2, vehicle = NULL, employee = NULL WHERE id = ?", [orderID], async function(error: Error, results: any){
                                            if(error){
                                                throw error;
                                            }
                                            else{
                                                response.json({status: "OK"});
                                                response.end();
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
    else{
        response.status(500).json({error: "Order ID is required"});
        response.end();
    }
});

server.post("/getQualifyingEmployees", async function (request: Request, response: Response){
    const pestType = request.body.pest;
    const jobSize = request.body.size;

    // Pest expertise is types separated by space
    // Select all employees who can drive the required car
    // Loop through list and select the ones who have the pest in their expertise list 

    if(pestType && jobSize){
        db.query("SELECT * FROM employees WHERE used = 0 AND vehicle_expertise >= ?", [jobSize], async function(error: Error, results: any){
            if(error){
                throw error;
            }
            else{
                const employees = JSON.parse(JSON.stringify(results));
                let eligibleEmployees = [];
                for(let i = 0; i < employees.length; i++){
                    let types = employees[i].pest_expertise.split(" ");
                    for(let j = 0; j < types.length; j++){
                        if(types[j] == pestType){
                            eligibleEmployees.push(employees[i]);
                        }
                    }
                }
                response.json(JSON.stringify(eligibleEmployees));
                response.end();
            }
        });
    }
    else{
        response.status(500).json({error: "Pest type and job size are both required"});
        response.end();
    }
});

server.post("/getAvailableVehicles", async function(request: Request, response: Response){
    const jobSize = request.body.size;

    if(jobSize){
        db.query("SELECT * FROM vehicles WHERE used = 0 AND capacity >= ?", [jobSize], async function(error: Error, results: any){
            if(error){
                throw error;
            }
            else{
                response.json(JSON.stringify(results));
                response.end();
            }
        });
    }
    else{
        response.status(500).json({error: "Job size is required"});
        response.end();
    }
});

server.post("/getSupplyAmount", async function(request: Request, response: Response){
    const supplyType = request.body.type;

    if(supplyType){
        db.query("SELECT stock_amount FROM supplies WHERE supply_type = ?", [supplyType], async function(error: Error, results: any){
            if(error){
                throw error;
            }
            else{
                if(results.length == 0){
                    response.status(500).json({error: "Supply type not found"});
                    response.end();
                }
                else{
                    response.json({stock: results[0].stock_amount});
                    response.end();
                }
            }
        });
    }
    else{
        response.status(500).json({error: "Supply type is required"});
        response.end();
    }
});

server.post("/assignOrder", async function(request: Request, response: Response){
    const orderID = request.body.id;
    const vehicleID = request.body.vehicle;
    const employeeID = request.body.employee;
    const supplyType = request.body.type;
    const supplyAmount = request.body.supply_amount;

    // Update supplies to reduce supplyType by supplyAmount
    // Update vehicles and employees to set used to 1 where id = vehicleID and employeeID
    // Update orders to set vehicle, employee = vehicleID, employeeID and status = 1 where id = orderID
    if(orderID && vehicleID && employeeID && supplyType && supplyAmount){
        db.query("UPDATE supplies SET stock_amount = stock_amount - ? WHERE supply_type = ?", [supplyAmount, supplyType], async function(error: Error, results: any){
            if(error){
                throw error;
            }
            else{
                db.query("UPDATE vehicles SET used = 1 WHERE id = ?", [vehicleID], async function(error: Error, results: any){
                    if(error){
                        throw error;
                    }
                    else{
                        db.query("UPDATE employees SET used = 1 WHERE id = ?", [employeeID], async function(error: Error, results: any){
                            if(error){
                                throw error;
                            }
                            else{
                                db.query("UPDATE workorders SET vehicle = ?, employee = ?, status = 1 WHERE id = ?", [vehicleID, employeeID, orderID], async function(error: Error, results: any){
                                    if(error){
                                        throw error;
                                    }
                                    else{
                                        response.json({status: "OK"});
                                        response.end();
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
    else{
        response.status(500).json({error: "Required parameters: Order ID, Vehicle ID, Employee ID, Supply Type, Supply Amount"});
        response.end();
    }
});
