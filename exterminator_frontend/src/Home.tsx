import "./App.css";
import { Link, useNavigate } from "react-router-dom";
import { CookiesProvider, useCookies } from "react-cookie";

// type HomeProps = {
//     loggedIn: boolean;
//     loginType: string;
// }

function Home(){
    const [cookie, setCookie] = useCookies(["loginType", "username"]);
    const navigate = useNavigate();

    const clickLoginButton = ()=>{
        if(cookie.loginType != ""){
            setCookie("loginType", "", {path:"/"});
            setCookie("username", "", {path: "/"});
        }
        else{
            navigate("/login");
        }
    }

    const clickDashboardButton = ()=>{
        navigate("/dashboard");
    }

    return(
        <>
        <header> 
            <div>
                <h1>Welcome to Oliver's Exterminators</h1>
                <button type="button" className="paddedCell" onClick={clickLoginButton}>{(cookie.loginType === "") ? "Log In" : "Log Out"}</button>
                <button type="button" disabled={cookie.loginType === ""} onClick={clickDashboardButton}>Dashboard</button>
            </div>
            <div hidden={cookie.loginType != ""}>
                <p>New user? <Link to="/register">Register</Link></p>
            </div>
        </header>
        </>
    );
}

export default Home;