import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

const Rough = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const handleGoogleLogin = async (credentialResponse) => {
        try {
            setLoading(true);
            setError("");
            if (!credentialResponse?.credential) {
                setError("Google authentication failed");
                return;
            }
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        credential: credentialResponse.credential,
                    }),
                }
            );
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    data.problem ||
                    "Google login failed"
                );
            }
            localStorage.setItem("token", data.token);
        } catch (err) {
            console.error("Google Login Error:", err);
            setError(err.message || "Google login failed");
        } finally {
            setLoading(false);
        }
    };
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
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
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
                                useOneTap
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Rough;