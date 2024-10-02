import { useEffect, useState } from 'react';
import '../App.css';

const SuppliesPanel = ()=>{
    const [table, setTable] = useState(<></>);
    const [tableLoaded, setTableLoaded] = useState(false);
    const [orderError, setOrderError] = useState("");

    type orderType = {
        type: string,
        amount: number,
        cost: number
    } 
    const [orderVals] = useState([] as orderType[]);

    const clickOrderButton = (orders: orderType[]) => {
        setOrderError("");
        fetch("http://localhost:8080/updateSupplies", {
            method: "POST",
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify({
                orders: orders
            })
        }).then((result)=>{
            return result.json();
        }).then((json)=>{
            if(json.status === "OK"){
                setTableLoaded(false); // Refresh the table since this updates cash and supplies
            }
            else{
                setOrderError(json.error);
            }
        });
    }

    const updateOrder = (name: string, amount: number, cost: number) => {
        let found = false;
        for(let i = 0; i < orderVals.length; i++){
            if(orderVals[i].type == name){
                orderVals[i].amount = amount;
                orderVals[i].cost = cost * amount;
                found = true;
            }
        }
        if(!found){
            orderVals.push({type: name, amount: amount, cost: cost * amount});
        }
    }

    const fetchSupplies = () => {
        return fetch("http://localhost:8080/getSupplies",{
            method: "POST",
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }).then((response)=>{
            return response.json();
        }).then((json)=>{
            setTableLoaded(true);
            return json.map((supplies: any, index: number)=>{
                return(
                <tr key = {index}>
                    <td>{supplies.supply_type}</td>
                    <td>{supplies.supply_type === "Cash" ? "$" : null}{supplies.stock_amount}{supplies.supply_type != "Cash" ? " liters" : null}</td>
                    <td>{supplies.restock_price === null ? "N/A" : "$"+supplies.restock_price}</td>
                    <td>{supplies.restock_price === null ? "N/A" : <div><input onChange={(newVal)=>{
                        updateOrder(supplies.supply_type, parseFloat(newVal.target.value), supplies.restock_price);
                        }} className="numberInput" type="number" step="0.1" min="0" placeholder="0"/> liters</div>}</td>
                </tr>);
            })
        });
    }

    useEffect(() => {
        if(!tableLoaded){
            fetchSupplies().then((supplies)=>{
                    setTable(
                    <table>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Amount In Stock</th>
                                <th>Cost Per Liter</th>
                                <th>Amount To Order</th>
                            </tr>
                        </thead>
                        <tbody>
                            {supplies}
                        </tbody>
                    </table>);
                setTableLoaded(true);
            })
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
                    <h1>Supplies</h1>
                    {table}
                    <label className = "errorLabel">{orderError}</label>
                    <br/>
                    <button type="button" onClick={()=>{clickOrderButton(orderVals);}}>Order</button>
                </header>
            </>
        );
    }
}

export default SuppliesPanel;