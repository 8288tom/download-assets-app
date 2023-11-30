import { useState, useEffect } from 'react';
import logo from "../logo.svg"
import '../css/App.css';

export default function Test(){
    const [data, setData] = useState(null);
    useEffect(()=>{
        fetchData()
    },[])
    
    async function fetchData(){
        const response = await fetch("/api")
        const jsonResponse = await response.json();
        setData(jsonResponse.message)
    }

    return(<>
 
        <div className='App'>
            <img src={logo} alt="logo" className='App-logo'/>
             <p>{!data ? "Loading...." : data}</p>
        </div>
        </>
        )
    }
            