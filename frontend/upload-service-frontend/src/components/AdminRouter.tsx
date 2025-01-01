import React, { useState } from 'react';
import { AdminDashboard } from "./AdminDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@shadcn/components/ui/card";
import { Input } from "@shadcn/components/ui/input";
import { Button } from "@shadcn/components/ui/button";

import hash from 'hash.js';

const ADMIN_PASSWORD = 'ac3fafe4183d9714894fc7f97bdfe4b79688638c437491d6b4e452f8a3df656d';

function hashPassword(password: string) {
    return hash.sha256().update(password).digest('hex');
}

export function AdminLogin() {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('adminAuthenticated') === 'true');

    if (isAuthenticated) {
        return <AdminDashboard />;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(hashPassword(password))
        if (hashPassword(password) === ADMIN_PASSWORD) {
            localStorage.setItem('adminAuthenticated', 'true');
            setIsAuthenticated(true);
        } else {
            localStorage.setItem('adminAuthenticated', 'false');
            setIsAuthenticated(false);
            alert('Incorrect password');
        }
    };

    return (
        <Card className="max-w-md mx-auto mt-8">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter admin password"
                    />
                    <Button type="submit" className="w-full">Login</Button>
                </form>
            </CardContent>
        </Card>
    );
}
