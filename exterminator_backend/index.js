"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
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
server.options('*', cors());
server.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
}));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(express.static(path.join(__dirname, 'static')));
server.listen(8080, function () {
    console.log("Backend running on port 8080");
});
server.post("/checkUser", function (request, response) {
    const username = request.body.username;
    if (username) {
        db.query("SELECT * FROM users WHERE username = ?", [username], function (error, results) {
            if (error) {
                throw error;
            }
            else if (results.length > 0) {
                response.json({ status: "TAKEN" });
            }
            else {
                response.json({ status: "AVAILABLE" });
            }
            response.end();
        });
    }
    else {
        response.status(500).json({ error: "Username is required" });
        response.end();
    }
});
server.post("/createUser", function (request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const username = request.body.username;
        const password = request.body.password;
        const accountType = request.body.account_type;
        if (username && password && accountType) {
            const hashedPass = yield argon.hash(password, "aggie");
            db.query("INSERT INTO users (username, password, account_type) VALUES (?, ?, ?)", [username, hashedPass, accountType], function (error) {
                if (error) {
                    throw error;
                }
                else {
                    response.json({ status: "OK" });
                }
                response.end();
            });
        }
        else {
            response.status(500).json({ error: "Username and password are both required" });
            response.end();
        }
    });
});
server.post("/login", function (request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const username = request.body.username;
        const password = request.body.password;
        if (username && password) {
            db.query("SELECT * FROM users WHERE username = ?", [username], function (error, results) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (error) {
                        throw error;
                    }
                    else if (results.length > 0) {
                        const user = JSON.parse(JSON.stringify(results[0]));
                        if (!(yield argon.verify(user.password, password, "aggie"))) {
                            response.json({ status: "INVALID PASSWORD" });
                        }
                        else {
                            response.json({ status: "OK", account_type: user.account_type });
                        }
                    }
                    else {
                        response.json({ status: "INVALID USER" });
                    }
                    response.end();
                });
            });
        }
        else {
            response.status(500).json({ error: "Username and password are both required" });
            response.end();
        }
    });
});
server.post("/submitOrder", function (request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const submittedBy = request.body.submitted_by;
        const pest = request.body.pest;
        const location = request.body.location;
        const size = request.body.size;
        if (pest && location && size) {
            db.query("INSERT INTO workorders (submitted_by, pest, location, size, status) VALUES (?, ?, ?, ?, ?)", [submittedBy, pest, location, size, 0], function (error) {
                if (error) {
                    throw error;
                }
                else {
                    response.json({ status: "OK" });
                    response.end();
                }
            });
        }
        else {
            response.status(500).json({ error: "submitted_by, pest, location, and size are all required" });
            response.end();
        }
    });
});
server.post("/getAllOrders", function (request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        db.query("SELECT * FROM workorders", function (error, results) {
            return __awaiter(this, void 0, void 0, function* () {
                if (error) {
                    throw error;
                }
                else {
                    const workOrders = JSON.parse(JSON.stringify(results));
                    //console.log(workOrders);
                    response.json(workOrders);
                    response.end();
                }
            });
        });
    });
});
server.post("/getUserOrders", function (request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = request.body.username;
        if (user) {
            db.query("SELECT * FROM workorders WHERE submitted_by = ?", [user], function (error, results) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (error) {
                        throw error;
                    }
                    else {
                        const workOrders = JSON.parse(JSON.stringify(results));
                        //console.log(workOrders);
                        response.json(workOrders);
                        response.end();
                    }
                });
            });
        }
        else {
            response.status(500).json({ error: "Username is required" });
            response.end();
        }
        ;
    });
});
server.post("/getSupplies", function (request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        db.query("SELECT * FROM supplies", function (error, results) {
            return __awaiter(this, void 0, void 0, function* () {
                if (error) {
                    throw error;
                }
                else {
                    const supplies = JSON.parse(JSON.stringify(results));
                    //console.log(supplies);
                    response.json(supplies);
                    response.end();
                }
            });
        });
    });
});
server.post("/updateSupplies", function (request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const orders = request.body.orders;
        // Check stock_amount of cash in supplies
        // Loop through orders and calculate total cost
        // Check if you have enough cash to buy everything
        // If you do, loop thru orders and update the amounts in supplies
        // Subtract the calculated cost from cash
        db.query("SELECT stock_amount FROM supplies WHERE supply_type = ?", ["Cash"], function (error, results) {
            return __awaiter(this, void 0, void 0, function* () {
                if (error) {
                    throw error;
                }
                else {
                    let json = JSON.parse(JSON.stringify(results));
                    let cash = json[0].stock_amount;
                    if (orders) {
                        //console.log(orders);
                        let cost = 0;
                        for (let i = 0; i < orders.length; i++) {
                            cost += orders[i].cost;
                        }
                        //console.log("cost is " + cost + " and cash is " + cash);
                        if (cost > cash) {
                            response.json({ error: "You do not have enough cash to make this purchase" });
                            response.end();
                        }
                        else {
                            console.log("purchasing");
                            for (let i = 0; i < orders.length; i++) {
                                db.query("UPDATE supplies SET stock_amount = stock_amount + ? WHERE supply_type = ?", [orders[i].amount, orders[i].type], function (error, results) {
                                    return __awaiter(this, void 0, void 0, function* () {
                                        if (error) {
                                            throw error;
                                        }
                                    });
                                });
                            }
                            db.query("UPDATE supplies SET stock_amount = stock_amount - ? WHERE supply_type = ?", [cost, "Cash"], function (error) {
                                return __awaiter(this, void 0, void 0, function* () {
                                    if (error) {
                                        throw error;
                                    }
                                    else {
                                        response.json({ status: "OK" });
                                        response.end();
                                    }
                                });
                            });
                        }
                    }
                    else {
                        response.status(500).json({ error: "Orders list is required" });
                        response.end();
                    }
                }
            });
        });
    });
});
server.post("/getOrderInfo", function (request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const size = request.body.size;
        if (size) {
            db.query("SELECT * FROM orderinfo WHERE size = ?", [size], function (error, results) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (error) {
                        throw error;
                    }
                    else {
                        const orderInfo = JSON.parse(JSON.stringify(results));
                        //console.log(orderInfo);
                        response.json(orderInfo[0]);
                        response.end();
                    }
                });
            });
        }
        else {
            response.status(500).json({ error: "Order size is required" });
            response.end();
        }
    });
});
server.post("/getVehicles", function (request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        db.query("SELECT * FROM vehicles", function (error, results) {
            return __awaiter(this, void 0, void 0, function* () {
                if (error) {
                    throw error;
                }
                else {
                    const vehicles = JSON.parse(JSON.stringify(results));
                    response.json(vehicles);
                    response.end();
                }
            });
        });
    });
});
server.post("/getEmployees", function (request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        db.query("SELECT * FROM employees", function (error, results) {
            return __awaiter(this, void 0, void 0, function* () {
                if (error) {
                    throw error;
                }
                else {
                    const employees = JSON.parse(JSON.stringify(results));
                    response.json(employees);
                    response.end();
                }
            });
        });
    });
});
server.post("/getPestType", function (request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const pest = request.body.pest;
        if (pest) {
            db.query("SELECT * FROM pesttypes WHERE pest = ?", [pest], function (error, results) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (error) {
                        throw error;
                    }
                    else {
                        const pestType = JSON.parse(JSON.stringify(results));
                        response.json({ pest: pestType[0].type });
                        response.end();
                    }
                });
            });
        }
        else {
            response.status(500).json({ error: "Pest is required" });
            response.end();
        }
    });
});
server.post("/completeOrder", function (request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const orderID = request.body.order_id;
        const pay = request.body.pay;
        // Update cash in supplies to increase it by pay
        // Select workorder with id orderID and get vehicle and employee IDs
        // Set used = 0 for those ids
        // Set vehicle and employee to NULL in the order
        // Set status = 2 for the order
        if (orderID) {
            db.query("UPDATE supplies SET stock_amount = stock_amount + ? WHERE supply_type = ?", [pay, "Cash"], function (error, results) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (error) {
                        throw error;
                    }
                    else {
                        db.query("SELECT * FROM workorders WHERE id = ?", [orderID], function (error, results) {
                            return __awaiter(this, void 0, void 0, function* () {
                                if (error) {
                                    throw error;
                                }
                                else {
                                    const vehicleID = results[0].vehicle;
                                    const employeeID = results[0].employee;
                                    db.query("UPDATE vehicles SET used = 0 WHERE id = ?", [vehicleID], function (error, results) {
                                        return __awaiter(this, void 0, void 0, function* () {
                                            if (error) {
                                                throw error;
                                            }
                                            else {
                                                db.query("UPDATE employees SET used = 0 WHERE id = ?", [employeeID], function (error, results) {
                                                    return __awaiter(this, void 0, void 0, function* () {
                                                        if (error) {
                                                            throw error;
                                                        }
                                                        else {
                                                            db.query("UPDATE workorders SET status = 2, vehicle = NULL, employee = NULL WHERE id = ?", [orderID], function (error, results) {
                                                                return __awaiter(this, void 0, void 0, function* () {
                                                                    if (error) {
                                                                        throw error;
                                                                    }
                                                                    else {
                                                                        response.json({ status: "OK" });
                                                                        response.end();
                                                                    }
                                                                });
                                                            });
                                                        }
                                                    });
                                                });
                                            }
                                        });
                                    });
                                }
                            });
                        });
                    }
                });
            });
        }
        else {
            response.status(500).json({ error: "Order ID is required" });
            response.end();
        }
    });
});
server.post("/getQualifyingEmployees", function (request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const pestType = request.body.pest;
        const jobSize = request.body.size;
        // Pest expertise is types separated by space
        // Select all employees who can drive the required car
        // Loop through list and select the ones who have the pest in their expertise list 
        if (pestType && jobSize) {
            db.query("SELECT * FROM employees WHERE used = 0 AND vehicle_expertise >= ?", [jobSize], function (error, results) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (error) {
                        throw error;
                    }
                    else {
                        const employees = JSON.parse(JSON.stringify(results));
                        let eligibleEmployees = [];
                        for (let i = 0; i < employees.length; i++) {
                            let types = employees[i].pest_expertise.split(" ");
                            for (let j = 0; j < types.length; j++) {
                                if (types[j] == pestType) {
                                    eligibleEmployees.push(employees[i]);
                                }
                            }
                        }
                        response.json(JSON.stringify(eligibleEmployees));
                        response.end();
                    }
                });
            });
        }
        else {
            response.status(500).json({ error: "Pest type and job size are both required" });
            response.end();
        }
    });
});
server.post("/getAvailableVehicles", function (request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const jobSize = request.body.size;
        if (jobSize) {
            db.query("SELECT * FROM vehicles WHERE used = 0 AND capacity >= ?", [jobSize], function (error, results) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (error) {
                        throw error;
                    }
                    else {
                        response.json(JSON.stringify(results));
                        response.end();
                    }
                });
            });
        }
        else {
            response.status(500).json({ error: "Job size is required" });
            response.end();
        }
    });
});
server.post("/getSupplyAmount", function (request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const supplyType = request.body.type;
        if (supplyType) {
            db.query("SELECT stock_amount FROM supplies WHERE supply_type = ?", [supplyType], function (error, results) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (error) {
                        throw error;
                    }
                    else {
                        if (results.length == 0) {
                            response.status(500).json({ error: "Supply type not found" });
                            response.end();
                        }
                        else {
                            response.json({ stock: results[0].stock_amount });
                            response.end();
                        }
                    }
                });
            });
        }
        else {
            response.status(500).json({ error: "Supply type is required" });
            response.end();
        }
    });
});
server.post("/assignOrder", function (request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const orderID = request.body.id;
        const vehicleID = request.body.vehicle;
        const employeeID = request.body.employee;
        const supplyType = request.body.type;
        const supplyAmount = request.body.supply_amount;
        // Update supplies to reduce supplyType by supplyAmount
        // Update vehicles and employees to set used to 1 where id = vehicleID and employeeID
        // Update orders to set vehicle, employee = vehicleID, employeeID and status = 1 where id = orderID
        if (orderID && vehicleID && employeeID && supplyType && supplyAmount) {
            db.query("UPDATE supplies SET stock_amount = stock_amount - ? WHERE supply_type = ?", [supplyAmount, supplyType], function (error, results) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (error) {
                        throw error;
                    }
                    else {
                        db.query("UPDATE vehicles SET used = 1 WHERE id = ?", [vehicleID], function (error, results) {
                            return __awaiter(this, void 0, void 0, function* () {
                                if (error) {
                                    throw error;
                                }
                                else {
                                    db.query("UPDATE employees SET used = 1 WHERE id = ?", [employeeID], function (error, results) {
                                        return __awaiter(this, void 0, void 0, function* () {
                                            if (error) {
                                                throw error;
                                            }
                                            else {
                                                db.query("UPDATE workorders SET vehicle = ?, employee = ?, status = 1 WHERE id = ?", [vehicleID, employeeID, orderID], function (error, results) {
                                                    return __awaiter(this, void 0, void 0, function* () {
                                                        if (error) {
                                                            throw error;
                                                        }
                                                        else {
                                                            response.json({ status: "OK" });
                                                            response.end();
                                                        }
                                                    });
                                                });
                                            }
                                        });
                                    });
                                }
                            });
                        });
                    }
                });
            });
        }
        else {
            response.status(500).json({ error: "Required parameters: Order ID, Vehicle ID, Employee ID, Supply Type, Supply Amount" });
            response.end();
        }
    });
});
server.post("/getEmployeeName", function (request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const employeeID = request.body.id;
        if (employeeID) {
            db.query("SELECT name FROM employees WHERE id = ?", [employeeID], function (error, results) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (error) {
                        throw error;
                    }
                    else {
                        response.json({ name: results[0].name });
                        response.end();
                    }
                });
            });
        }
        else {
            response.status(500).json({ error: "Employee ID is required" });
            response.end();
        }
    });
});
server.post("/getVehicleType", function (request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const vehicleID = request.body.id;
        if (vehicleID) {
            db.query("SELECT type FROM vehicles WHERE id = ?", [vehicleID], function (error, results) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (error) {
                        throw error;
                    }
                    else {
                        response.json({ type: results[0].type });
                        response.end();
                    }
                });
            });
        }
        else {
            response.status(500).json({ error: "Vehicle ID is required" });
            response.end();
        }
    });
});
