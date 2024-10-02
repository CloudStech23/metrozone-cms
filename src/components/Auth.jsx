// src/Auth.js

import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../firebaseConfig"; // Adjust the import based on your project structure

const Auth = () => {
    const auth = getAuth(app);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Reset any previous error messages

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        try {
            if (isRegistering) {
                // Registration
                await createUserWithEmailAndPassword(auth, email, password);
                alert("Registration successful!");
            } else {
                // Sign In
                await signInWithEmailAndPassword(auth, email, password);
                alert("Login successful!");
            }
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="auth-container">
            <h2>{isRegistering ? "Register" : "Login"}</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">{isRegistering ? "Register" : "Login"}</button>
                <p onClick={() => setIsRegistering(!isRegistering)}>
                    {isRegistering ? "Already have an account? Login" : "Don't have an account? Register"}
                </p>
                {error && <p className="error">{error}</p>}
            </form>
        </div>
    );
};

export default Auth;
