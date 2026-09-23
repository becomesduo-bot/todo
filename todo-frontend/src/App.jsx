import Signup from "./components/api/singup.jsx";
import Login from "./components/api/login";
import Dashboard from "./components/api/dashboard";
import { useState } from "react";

function App() {

  // Login hone wala user
  const [user, setUser] = useState(null);

  // Signup ya Login screen
  const [showLogin, setShowLogin] = useState(false);


  // ==================================
  // LOGIN SUCCESS
  // ==================================

  function handleLoginSuccess(loggedInUser) {

    console.log("User logged in:", loggedInUser);

    // User ko state mein save karo
    setUser(loggedInUser);
  }


  // ==================================
  // SIGNUP SUCCESS
  // ==================================

  function handleSignupSuccess() {

    // Signup ke baad Login screen show karo
    setShowLogin(true);
  }


  // ==================================
  // DASHBOARD
  // ==================================

  if (user) {

    return (
      <Dashboard user={user} />
    );

  }


  // ==================================
  // LOGIN / SIGNUP
  // ==================================

  return (

    <div>

      {showLogin ? (

        <Login
          onSuccess={handleLoginSuccess}
        />

      ) : (

        <Signup
          onSuccess={handleSignupSuccess}
        />

      )}


      {/* ==========================
                SWITCH BUTTON
            ========================== */}

      <div className="text-center mt-4">

        <button
          onClick={() => setShowLogin(!showLogin)}
          className="text-blue-500 underline"
        >

          {showLogin
            ? "New user? Sign up"
            : "Already have an account? Login"
          }

        </button>

      </div>

    </div>

  );
}


export default App;
