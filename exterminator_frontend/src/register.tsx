import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from 'react-select';
import './App.css';

const Register = () =>{
    const [accountType, setAccountType] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [accountTypeError, setAccountTypeError] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const navigate = useNavigate()

    const clickBackButton = () =>{
        navigate("/");
    }

    const clickSubmitButton = () =>{
        let error: boolean = false;
        setAccountTypeError("");
        setUsernameError("");
        setPasswordError("");

        if(accountType === ""){
            setAccountTypeError("Select an account type");
            error = true;
        }

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
            fetch("http://localhost:8080/checkUser", {
                method: "POST",
                body: JSON.stringify({
                    username: username
                }),
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                }
            }).then((response)=>{
                return response.json();
            }).then((json)=>{
                //console.log(json);
                if(json.error){
                    setUsernameError("ERROR: " + json.error);
                }
                else if(json.status === "TAKEN"){
                    setUsernameError("This username is taken");
                }
                else{
                    // Create the user
                    fetch("http://localhost:8080/createUser", {
                        method: "POST",
                        body: JSON.stringify({
                            username: username,
                            password: password,
                            account_type: accountType
                        }),
                        headers: {
                            "Content-type": "application/json; charset=UTF-8"
                        }
                    }).then((response)=>{
                        return response.json();
                    }).then((json)=>{
                        if(json.status === "OK"){
                            navigate('/');
                        }
                        else{
                            setUsernameError("An error occurred");
                        }
                    });
                }
            });
        }
    }

    return(
        <>
        <header>
            <h1>Register</h1>
            <div className="dropDown">
                <Select 
                styles={{
                    control: (provided) =>({
                        ...provided,
                        backgroundColor: '#2b2a33'
                    }),
                    singleValue: (provided) => ({
                        ...provided,
                        color: 'light-gray'
                    }),
                    menu: (provided) => ({
                        ...provided,
                        backgroundColor: '#2b2a33',
                    }),
                    option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isFocused ? '#41404e' : '#2b2a33',
                    })
                }}
                placeholder = "User type"
                options={[
                    {value: "client", label: "Client"},
                    {value: "employee", label: "Employee"}
                ]}
                onChange={(typeSelection)=>{setAccountType(typeSelection!.value)}}
                />
                <label className = "errorLabel">{accountTypeError}</label>
            </div>
            <br/>
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
            <button type="button" className = "paddedCell" onClick={clickSubmitButton}>Create Account</button>
            <button type="button" onClick={clickBackButton}>Back</button>
        </header>
        </>
    );
}

export default Register;