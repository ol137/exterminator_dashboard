import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from './Home';
import Login from './login';
import Register from './register';
import Dashboard from './dashboard';
import ProtectedRoute from "./ProtectedRoute";
import './App.css';
import { useCookies } from "react-cookie";

function App(){

  const [cookie] = useCookies(['loginType']);

  const loginProps = {
    accountType: cookie.loginType,
    checkType: false
  }
  const dashboardProps = {
    accountType: cookie.loginType,
    checkType: true
  }

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path = '/' element = {<Home/>}/>
        <Route path = '/login' element = {<ProtectedRoute {...loginProps}><Login/></ProtectedRoute>}/>
        <Route path = '/register' element = {<Register/>}/>
        <Route path = '/dashboard/*' element = {<ProtectedRoute {...dashboardProps}><Dashboard/></ProtectedRoute>}/>
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;