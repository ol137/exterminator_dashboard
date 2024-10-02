import Navbar from './Navbar';
import SuppliesPanel from './dashboardpanels/SuppliesPanel';
import VehiclesPanel from './dashboardpanels/VehiclesPanel';
import EmployeesPanel from './dashboardpanels/EmployeesPanel';
import WorkOrdersPanel from './dashboardpanels/WorkOrdersPanel';
import PlaceOrderPanel from './dashboardpanels/PlaceOrderPanel';
import ViewOrdersPanel from './dashboardpanels/ViewOrdersPanel';
import { Route, Routes } from 'react-router-dom';
import './App.css';

type DashboardProps = {
    // Need to add properties here to check login status and if you're client/employee
}

const Dashboard = (props: DashboardProps)=>{
    return(
        <>
        <nav>
            <div className="navBar">
                <Navbar/>
            </div>
        </nav>
        <Routes>
            <Route path = '/supplies' element = {<SuppliesPanel/>}/>
            <Route path = '/vehicles' element = {<VehiclesPanel/>}/>
            <Route path = '/employees' element = {<EmployeesPanel/>}/>
            <Route path = '/workOrders' element = {<WorkOrdersPanel/>}/>
            <Route path = '/placeOrder' element = {<PlaceOrderPanel/>}/>
            <Route path = '/viewOrders' element = {<ViewOrdersPanel/>}/>
        </Routes>
        </>
    );
}

export default Dashboard;