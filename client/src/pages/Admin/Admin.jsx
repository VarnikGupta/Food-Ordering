import React, { useState, useEffect } from "react";

import LogIn from "../../components/LogIn/LogIn";
import SignUp from "../../components/SignUp/SignUp";

const Admin = () => {
  const [signUp, setSignUp] = useState(false);
    const [logIn, setLogIn] = useState(true);
    
    useEffect(() => {
        localStorage.removeItem("auth");
    },[])
  
    return (
        <>

          {logIn &&
            // createPortal(
                <LogIn setLogIn={setLogIn} setSignUp={setSignUp} isAdmin={true} />
                // document.getElementById("portal")
                // )
            }
    
            </>
    //   {logIn &&
    //     createPortal(
        //   <LogIn setLogIn={setLogIn} setSignUp={setSignUp} />
    //       document.getElementById("portal")
    //     )}
    // </div>
  );
};

export default Admin;
