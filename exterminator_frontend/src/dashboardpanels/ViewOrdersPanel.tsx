import { useCookies } from 'react-cookie';
import '../App.css';
import { useEffect, useState } from 'react';

const ViewOrdersPanel = ()=>{
    const [table, setTable] = useState(<></>);
    const [tableLoaded, setTableLoaded] = useState(false);
    const [cookie] = useCookies(["username"]);

    const fetchOrders = () => {
        return fetch("http://localhost:8080/getUserOrders",{
            method: "POST",
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify({
                username: cookie.username
            })
        }).then((response)=>{
            return response.json();
        }).then((json)=>{
            setTableLoaded(true);
            return json.map((workItems: any, index: number)=>{
                return(
                <tr key = {index}>
                    <td>{workItems.pest}</td>
                    <td>{workItems.location}</td>
                    <td>{workItems.size}</td>
                    <td>{workItems.status === 0 ? "Pending" : (workItems.completed === 1) ? "In Progress" : "Completed"}</td>
                    <td>{workItems.submitted_at}</td>
                </tr>);
            })
        });
    }

    useEffect(() => {
        if(!tableLoaded){
            fetchOrders().then((orders)=>{
                if(orders.length > 0){
                    setTable(
                        <table>
                            <thead>
                                <tr>
                                    <th>Pest Type</th>
                                    <th>Location</th>
                                    <th>Job Size</th>
                                    <th>Completion Status</th>
                                    <th>Submission Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders}
                            </tbody>
                        </table>);
                }
                else{
                    setTable(<h3>You have not submitted any orders.</h3>);
                }
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
                    <h1>My Work Orders</h1>
                    {table}
                </header>
            </>
        );
    }
}

export default ViewOrdersPanel;