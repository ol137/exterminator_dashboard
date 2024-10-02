import { useEffect, useState } from 'react';
import '../App.css';

const EmployeesPanel = ()=>{
    const [table, setTable] = useState(<></>);
    const [tableLoaded, setTableLoaded] = useState(false);

    const fetchEmployees = () =>{
        return fetch("http://localhost:8080/getEmployees", {
            method: "POST",
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }).then(results=>{
            return results.json();
        }).then(json=>{
            return json.map((employee: any, index: number)=>{
                return(
                <tr key = {index}>
                    <td>{employee.id}</td>
                    <td>{employee.name}</td>
                    <td>{employee.vehicle_expertise === 1 ? "Sedans" : employee.vehicle_expertise === 2 ? "Sedans & Vans" : employee.vehicle_expertise === 3 ? "Sedans, Vans, & Trucks" : "Any Vehicle"}</td>
                    <td>{employee.pest_expertise.replace(/ /g, " Killer, ") + " Killer"}</td>
                    <td>{employee.used === 0 ? "Available" : "Busy"}</td>
                </tr>);
            })
        });
    }

    useEffect(() => {
        if(!tableLoaded){
            fetchEmployees().then((employees)=>{
                if(employees.length > 0){
                    setTable(
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Can Drive</th>
                                    <th>Can Use</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees}
                            </tbody>
                        </table>);
                }
                else{
                    setTable(<h3>You have not hired any employees.</h3>);
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
                    <h1>Employees</h1>
                    {table}
                </header>
            </>
        );
    }
}

export default EmployeesPanel;