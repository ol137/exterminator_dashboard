import { useEffect, useState } from 'react';
import '../App.css';
import Select, { CSSObjectWithLabel, OptionProps } from 'react-select';

const dropDownStyle = {
    control: (provided: CSSObjectWithLabel) =>({
        ...provided,
        backgroundColor: '#2b2a33'
    }),
    singleValue: (provided: CSSObjectWithLabel) => ({
        ...provided,
        color: 'light-gray'
    }),
    menu: (provided: CSSObjectWithLabel) => ({
        ...provided,
        backgroundColor: '#2b2a33',
    }),
    option: (provided: CSSObjectWithLabel, state: OptionProps) => ({
        ...provided,
        backgroundColor: state.isFocused ? '#41404e' : '#2b2a33',
    })
}

const WorkOrdersPanel = ()=>{
    const [table, setTable] = useState(<></>);
    const [tableLoaded, setTableLoaded] = useState(false);
    
    const [assigningOrder, setAssigningOrder] = useState(false);
    const [orderID, setOrderID] = useState(0);
    const [orderSize, setOrderSize] = useState(0);
    const [orderSizeString, setOrderSizeString] = useState(""); // This is what I get for being inconsistent with number vs string for order size...
    const [orderType, setOrderType] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState(0);
    const [selectedVehicle, setSelectedVehicle] = useState(0);
    const [employeeError, setEmployeeError] = useState("");
    const [vehicleError, setVehicleError] = useState("");

    const resetAllStates = () => { // Kinda like a refresh, to avoid weird bugs
        setTable(<></>);
        setTableLoaded(false);
        setAssigningOrder(false);
        setOrderID(0);
        setOrderSize(0);
        setOrderSizeString("");
        setOrderType("");
        setSelectedEmployee(0);
        setSelectedVehicle(0);
        setEmployeeError("");
        setVehicleError("");
    }

    const clickAssignButton = (id: number, size: string, type: string) => {
        let sizeNum = (size === "XL" ? 4 : size === "Large" ? 3 : size === "Medium" ? 2 : 1);
        fetch("http://localhost:8080/getPestType", {
            method: "POST",
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify({
                pest: type
            })
        }).then((response)=>{
            return response.json();
        }).then((pestType)=>{
            setOrderID(id);
            setOrderSize(sizeNum);
            setOrderSizeString(size);
            setOrderType(pestType.pest);
            setAssigningOrder(true);
            setTableLoaded(false);
        });
    }

    const getOrderInfo = (size: string) => {
        return fetch("http://localhost:8080/getOrderInfo", {
            method: "POST",
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify({
                size: size
            })
        }).then((response)=>{
            return response.json();
        });
    }

    const clickCompleteButton = (id: number, size: string) => {
        getOrderInfo(size).then((order_info)=>{
            return order_info.pay_amount;
        }).then((pay)=>{
            fetch("http://localhost:8080/completeOrder", {
                method: "POST",
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                },
                body: JSON.stringify({
                    order_id: id,
                    pay: pay
                })
            }).then(()=>{
                resetAllStates();
            });
        });
    }

    const fetchOrders = () => {
        return fetch("http://localhost:8080/getAllOrders", {
            method: "POST",
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }).then((response)=>{
            return response.json();
        }).then((json)=>{
            return json.map((workItem: any, index: number)=>{
                setTableLoaded(true);
                return(
                    <tr key = {index}>
                        <td>{workItem.submitted_by}</td>
                        <td>{workItem.pest}</td>
                        <td>{workItem.location}</td>
                        <td>{workItem.size}</td>
                        <td>{workItem.status === 0 ? <div>Pending<br/><button onClick={()=>{clickAssignButton(workItem.id, workItem.size, workItem.pest)}}>Assign</button></div> : (workItem.status === 1) ? <div>In Progress<br/><button onClick={()=>{clickCompleteButton(workItem.id, workItem.size)}}>Complete</button></div> : "Completed"}</td>
                        <td>{workItem.employee == null ? "None" : workItem.employee}</td>
                        <td>{workItem.vehicle == null ? "None" : workItem.vehicle}</td>
                        <td>{workItem.submitted_at}</td>
                    </tr>
                );
            });
        });
    }

    const fetchAvailableEmployees = () =>{
        return fetch("http://localhost:8080/getQualifyingEmployees", {
            method: "POST",
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify({
                pest: orderType,
                size: orderSize
            })
        }).then((response)=>{
            return response.json();
        }).then((json)=>{
            return JSON.parse(json);
        });
    }

    const clickBackButton = () => {
        resetAllStates();
    }

    const fetchAvailableVehicles = () => {
        return fetch("http://localhost:8080/getAvailableVehicles", {
            method: "POST",
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify({
                size: orderSize
            })
        }).then((response)=>{
            return response.json();
        }).then((json)=>{
            return JSON.parse(json);
        });
    }

    const getSupplyStock = (type: string) => {
        return fetch("http://localhost:8080/getSupplyAmount", {
            method: "POST",
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify({
                type: type
            })
        }).then((response)=>{
            return response.json();
        });
    }

    const clickSubmitButton = (employee: number, vehicle: number, supplyAmount: number) => {
        setSelectedEmployee(employee);
        setSelectedVehicle(vehicle);
        setEmployeeError("");
        setVehicleError("");
        let error = false;
        if(employee == 0){
            setEmployeeError("You must select an available employee");
            setAssigningOrder(true);
            error = true;
        }
        if(vehicle == 0){
            setVehicleError("You must select an available vehicle");
            setAssigningOrder(true);
            error = true;
        }
        if(!error){
            //console.log(employee, vehicle);
            fetch("http://localhost:8080/assignOrder", {
                method: "POST",
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                },
                body: JSON.stringify({
                    id: orderID,
                    vehicle: vehicle,
                    employee: employee,
                    type: orderType + " Killer",
                    supply_amount: supplyAmount
                })
            }).then((response)=>{
                return response.json();
            }).then((json)=>{
                if(json.status == "OK"){
                    resetAllStates();
                }
                else{
                    alert("ERROR! Check the logs!");
                }
            });
        }
    }

    useEffect(() => {
        if(assigningOrder){
            getOrderInfo(orderSizeString).then((orderInfo)=>{
                getSupplyStock(orderType + " Killer").then((supplies)=>{
                    if(supplies.stock < orderInfo.supply_amount){
                        setTable(<>
                            <p className="insufficientError">You have insufficient supplies.</p>
                            <p>This job requires {orderInfo.supply_amount} liters of {orderType} Killer (You have {supplies.stock} liters), and will pay ${orderInfo.pay_amount} if completed.</p>
                            <button type="button" onClick={clickBackButton}>Back</button>
                        </>);
                        setTableLoaded(true);
                        setAssigningOrder(false);
                    }
                    else{
                        fetchAvailableEmployees().then((employeeData)=>{
                            //console.log(employeeData);
                            fetchAvailableVehicles().then((vehicleData)=>{
                                let employee = selectedEmployee;
                                let vehicle = selectedVehicle;
                                setTable(<>
                                    <p>This job will use {orderInfo.supply_amount} liters of {orderType} Killer and will pay ${orderInfo.pay_amount} when completed.</p>
                                    <p>Select an employee to take this job:</p>
                                    <Select className="dropDown" styles={dropDownStyle}
                                    options={employeeData.map((employee: any)=>{
                                        return {value: employee.id, label: employee.name};
                                    })}
                                    onChange={(employeeSelection: any)=>{employee = employeeSelection!.value}}/>
                                    <label className="errorLabel">{employeeError}</label>
                                    <p>Select a vehicle for them to drive:</p>
                                    <Select className="dropDown" styles={dropDownStyle}
                                    options={vehicleData.map((vehicle: any)=>{
                                        return {value: vehicle.id, label: vehicle.type};
                                    })}
                                    onChange={(vehicleSelection: any)=>{vehicle = vehicleSelection!.value}}/>
                                    <label className="errorLabel">{vehicleError}</label>
                                    <br/>
                                    <br/>
                                    <button type="button" className="paddedCell" onClick={()=>{clickSubmitButton(employee, vehicle, orderInfo.supply_amount)}}>Assign</button>
                                    <button type="button" onClick={clickBackButton}>Back</button>
                                </>); 
                                setTableLoaded(true);
                                setAssigningOrder(false);
                            });
                        });
                    }
                })
            });
        }
        else{
            if(!tableLoaded){
                fetchOrders().then((orders)=>{
                    //console.log(orders);
                    if(orders.length > 0){
                        setTable(
                            <table>
                                <thead>
                                    <tr>
                                        <th>Client Name</th>
                                        <th>Pest Type</th>
                                        <th>Location</th>
                                        <th>Job Size</th>
                                        <th>Completion Status</th>
                                        <th>Employee ID</th>
                                        <th>Vehicle ID</th>
                                        <th>Submission Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders}
                                </tbody>
                            </table>);
                    }
                    else{
                        setTable(<h3>There are no work orders.</h3>);
                    }
                    setTableLoaded(true);
                })
            }
        }
    })

    if(!tableLoaded){
        return(
            <>
                <header>
                    <h1>Loading...</h1>
                </header>
            </>
        );
    }
    else{
        return(
            <>
                <header>
                    <h1>Work Orders</h1>
                    {table}
                </header>
            </>
        );
    }
}

export default WorkOrdersPanel;