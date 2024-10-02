import Select, { CSSObjectWithLabel, OptionProps } from 'react-select';
import '../App.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

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

const PlaceOrderPanel = ()=>{
    const [pest, setPest] = useState("");
    const [pestError, setPestError] = useState("");
    const [location, setLocation] = useState("");
    const [locationError, setLocationError] = useState("");
    const [size, setSize] = useState("");
    const [sizeError, setSizeError] = useState("");

    const [cookie] = useCookies(["username"]);
    const navigate = useNavigate();

    const clickSubmitButton = ()=>{
        let error: boolean = false;
        setPestError("");
        setLocationError("");
        setSizeError("");

        if(pest === ""){
            setPestError("Please select a pest type");
            error = true;
        }
        if(location === ""){
            setLocationError("Please indicate your location");
            error = true;
        }
        if(size === ""){
            setSizeError("Please indicate the treatment area");
            error = true;
        }
        if(!error){
            // Insert API call here
            fetch("http://localhost:8080/submitOrder", {
                method: "POST",
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                },
                body: JSON.stringify({
                    submitted_by: cookie.username,
                    pest: pest,
                    location: location,
                    size: size
                })
            }).then((response)=>{
                return response.json();
            }).then((json)=>{
                if(json.status === "OK"){
                    navigate("/dashboard/viewOrders");
                }
                else{
                    setSizeError(json.error);
                }
            });
        }
    };

    return(
        <>
            <header>
                <h1>Place Work Order</h1>
                <p>Please enter the address to be serviced:</p>
                <div className="textField">
                    <input className="inputBox" value = {location} placeholder = "Location" onChange={(newVal)=>setLocation(newVal.target.value)} />
                    <br/>
                    <label className = "errorLabel">{locationError}</label>
                </div>
                <p>What type of pest are you having trouble with?</p>
                <Select className="dropDown" styles={dropDownStyle}
                options={[
                    {value: "Ant", label: "Ants"},
                    {value: "Bed Bug", label: "Bed Bugs"},
                    {value: "Mouse", label: "Mice"},
                    {value: "Rat", label: "Rats"},
                    {value: "Roach", label: "Roaches"},
                    {value: "Spider", label: "Spiders"},
                    {value: "Termite", label: "Termites"}
                ]}
                onChange={(typeSelection: any)=>{setPest(typeSelection!.value)}}/>
                <label className = "errorLabel">{pestError}</label>
                <p>How large is the area you need treated?</p>
                <Select className="dropDown" styles={dropDownStyle}
                options={[
                    {value: "Small", label: "A room"},
                    {value: "Medium", label: "Multiple rooms"},
                    {value: "Large", label: "A whole floor"},
                    {value: "XL", label: "A whole multi-floor building"}
                ]}
                onChange={(sizeSelection: any)=>{setSize(sizeSelection!.value)}}/>
                <label className="errorLabel">{sizeError}</label>
                <br/>
                <button type="button" className = "paddedCell" onClick={clickSubmitButton}>Submit</button>
            </header>
        </>
    );
}

export default PlaceOrderPanel;