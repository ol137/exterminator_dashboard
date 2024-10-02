import { useCookies } from 'react-cookie';
import './App.css';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () =>{
    const [cookie, setCookie] = useCookies(["loginType", "username"]);
    const navigate = useNavigate();

    const clickHomeButton = ()=>{
        navigate('/');
    }

    const clickDashboardButton = (panelName: string)=>{
        navigate('/dashboard/'+panelName);
    }

    const clickLogOutButton = ()=>{
        setCookie("loginType", "", {path:"/"});
        setCookie("username", "", {path: "/"});
    }

    if(cookie.loginType === "employee"){
        return(
            <>
                <button type="button" className="navButton leftAlign" onClick={clickHomeButton}>Home</button>
                <div className="navMenu">
                    <button type="button" className="navButton" onClick={()=>{clickDashboardButton("supplies");}}>Supplies</button>
                    <button type="button" className="navButton" onClick={()=>{clickDashboardButton("vehicles");}}>Vehicles</button>
                    <button type="button" className="navButton" onClick={()=>{clickDashboardButton("employees");}}>Employees</button>
                    <button type="button" className="navButton" onClick={()=>{clickDashboardButton("workOrders");}}>Work Orders</button>
                </div>
                <div className="rightAlign">
                    <span>Logged in as {cookie.username} ({cookie.loginType})</span>
                    <button type="button" className="navButton" onClick={clickLogOutButton}>Log Out</button>
                </div>
            </>
        );
    }
    else if(cookie.loginType === "client"){
        return(
            <>
                <button type="button" className="navButton leftAlign" onClick={clickHomeButton}>Home</button>
                <div className="navMenu">
                    <button type="button" className="navButton" onClick={()=>{clickDashboardButton("placeOrder");}}>New Work Order</button>
                    <button type="button" className="navButton" onClick={()=>{clickDashboardButton("viewOrders");}}>Work Order Status</button>
                </div>
                <div className="rightAlign">
                    <span className="navText">Logged in as {cookie.username} ({cookie.loginType})</span>
                    <button type="button" className="navButton" onClick={clickLogOutButton}>Log Out</button>
                </div>
            </>
        );
    }
    else{
        return(
            <>
                <h1>uh oh something bad happened</h1>
            </>
        );
    }
}

export default Navbar;