import { Navigate, Outlet } from "react-router-dom";

type RouteProps = {
  accountType: string,
  checkType: Boolean,
  children: any
}

// checkType is whether we want the user to be logged in or not to be let through
const ProtectedRoute = (props: RouteProps)=>{
    if(props.checkType === (props.accountType != "")){
        return props.children;
    }
    return <Navigate to="/" replace/>;
};

export default ProtectedRoute;