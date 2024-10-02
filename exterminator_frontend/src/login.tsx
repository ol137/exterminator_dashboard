import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import { useCookies } from "react-cookie";

// type LoginProps = {
//     setLoggedIn: Dispatch<SetStateAction<boolean>>;
//     setLoginType: Dispatch<SetStateAction<string>>;
// }

const Login = () =>{
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const [cookie, setCookie] = useCookies(["loginType", "username"]);
    const navigate = useNavigate()

    const clickBackButton = () =>{
        navigate("/");
    }

    const clickSubmitButton = () =>{
        let error: boolean = false;

        setUsernameError("");
        setPasswordError("");

        if(username === ""){
            setUsernameError("Username is required");
            error = true;
        }

        if(password === ""){
            setPasswordError("Password is required");
            error = true;
        }

        // If there were no errors
        if(!error){
            // Insert auth endpoint
            fetch("http://localhost:8080/login", {
                method: "POST",
                body: JSON.stringify({
                    username: username,
                    password: password
                }),
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                }
            }).then((response)=>{
                return response.json();
            }).then((json)=>{
                if(json.status === "INVALID USER"){
                    setUsernameError("An account with this username does not exist");
                }
                else if(json.status === "INVALID PASSWORD"){
                    setPasswordError("Incorrect password");
                }
                else{
                    // props.setLoggedIn(true);
                    // props.setLoginType(json.account_type);
                    setCookie("loginType", json.account_type, {path: "/"});
                    setCookie("username", username, {path: "/"});
                    navigate("/dashboard");
                }
            });
        }
        
    }

    return(
        <>
        <header>
            <h1>Login</h1>
            <div className="textField">
                <input className="inputBox" value = {username} placeholder = "Username" onChange={(newVal)=>setUsername(newVal.target.value)} />
                <br/>
                <label className = "errorLabel">{usernameError}</label>
            </div>
            <br/>
            <div className="textField">
                <input className = "inputBox" type="password" value = {password} placeholder = "Password" onChange = {(newVal) =>setPassword(newVal.target.value)} />
                <br/>
                <label className = "errorLabel">{passwordError}</label>
            </div>
            <br/>
            <button type="button" className = "paddedCell" onClick={clickSubmitButton}>Log In</button>
            <button type="button" onClick={clickBackButton}>Back</button>
        </header>
        </>
    );
}

export default Login;