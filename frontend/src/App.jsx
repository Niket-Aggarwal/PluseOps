import React from 'react'
import { Routes, Route } from "react-router-dom";
import Rough from "./utility/Rough"

function App() {

    return (
        <>
            <h1 className='text-white bg-black'>Starting...</h1>
            <Rough />
            {/* <Routes>
                <Route path="/" element={<Home />} />
            </Routes> */}
        </>
    )
}

export default App