import { useEffect, useState } from 'react';
import '../App.css';

const VehiclesPanel = ()=>{
    const [table, setTable] = useState(<></>);
    const [tableLoaded, setTableLoaded] = useState(false);

    const fetchVehicles = () =>{
        return fetch("http://localhost:8080/getVehicles", {
            method: "POST",
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }).then(results=>{
            return results.json();
        }).then(json=>{
            return json.map((vehicles: any, index: number)=>{
                return(
                <tr key = {index}>
                    <td>{vehicles.id}</td>
                    <td>{vehicles.type}</td>
                    <td>{vehicles.capacity === 1 ? "Small" : vehicles.capacity === 2 ? "Medium" : vehicles.capacity === 3 ? "Large" : "XL"}</td>
                    <td>{vehicles.used === 0 ? "Available" : "In Use"}</td>
                </tr>);
            })
        });
    }

    useEffect(() => {
        if(!tableLoaded){
            fetchVehicles().then((vehicles)=>{
                if(vehicles.length > 0){
                    setTable(
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Vehicle Type</th>
                                    <th>Capacity</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehicles}
                            </tbody>
                        </table>);
                }
                else{
                    setTable(<h3>You do not own any vehicles.</h3>);
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
                    <h1>Vehicles</h1>
                    {table}
                </header>
            </>
        );
    }
}

export default VehiclesPanel;