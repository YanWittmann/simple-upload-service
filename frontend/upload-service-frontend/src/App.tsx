import React from 'react';
import { StudentView } from './components/StudentView';
import { AdminLogin } from "./components/AdminRouter";
import { Toaster } from "@shadcn/components/ui/toaster";

function App() {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const isAdmin = urlSearchParams.get('admin');

    return (<>
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4">
                {isAdmin ? <AdminLogin/> : <StudentView/>}
            </div>
        </div>
        <Toaster/>
    </>);
}

export default App;

