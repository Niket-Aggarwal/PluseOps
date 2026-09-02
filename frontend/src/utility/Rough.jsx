import React, { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";

const API_URL = import.meta.env.VITE_API_URL;

const Rough = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [error, setError] = useState("");

    // Verify active session on initial page load
    useEffect(() => {
        const checkSession = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setInitializing(false);
                return;
            }
            try {
                const response = await fetch(`${API_URL}/auth/session`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    setUser(data.user);
                } else {
                    localStorage.removeItem("token");
                }
            } catch (err) {
                console.error("Session verification failed:", err);
                localStorage.removeItem("token");
            } finally {
                setInitializing(false);
            }
        };
        checkSession();
    }, []);

    const handleGoogleLogin = async (credentialResponse) => {
        try {
            setLoading(true);
            setError("");
            if (!credentialResponse?.credential) {
                setError("Google authentication failed");
                return;
            }
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    credential: credentialResponse.credential,
                }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    data.problem ||
                    "Google login failed"
                );
            }
            localStorage.setItem("token", data.token);
            setUser(data.user);
        } catch (err) {
            console.error("Google Login Error:", err);
            setError(err.message || "Google login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null);
        setError("");
    };

    if (initializing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
                <div className="text-gray-400">Loading session...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white">
                        PulseOps
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Never Let Your Backend Sleep Again.
                    </p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl">
                    {user ? (
                        <div className="text-center">
                            {user.picture ? (
                                <img
                                    src={user.picture}
                                    alt={user.name}
                                    className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-indigo-500 shadow-md"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                                    {user.name?.charAt(0) || "U"}
                                </div>
                            )}
                            <h2 className="text-2xl font-semibold text-white">
                                Welcome, {user.name}!
                            </h2>
                            <p className="text-gray-400 text-sm mt-1 mb-6">
                                {user.email}
                            </p>
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm mb-6">
                                Authentication Successful! Active Session Persistent.
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-semibold text-white text-center">
                                Welcome to PulseOps
                            </h2>
                            <p className="text-gray-400 text-center mt-2 mb-8">
                                Sign in to monitor your APIs
                            </p>
                            {error && (
                                <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                                    {error}
                                </div>
                            )}
                            <div className="flex justify-center">
                                {loading ? (
                                    <p className="text-gray-400">
                                        Signing in...
                                    </p>
                                ) : (
                                    <GoogleLogin
                                        onSuccess={handleGoogleLogin}
                                        onError={() => {
                                            setError(
                                                "Google authentication failed"
                                            );
                                        }}
                                    />
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Rough;