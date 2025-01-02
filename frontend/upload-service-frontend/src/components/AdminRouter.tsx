import React, { useEffect, useState } from 'react';
import { AdminDashboard } from "./AdminDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@shadcn/components/ui/card";
import { Input } from "@shadcn/components/ui/input";
import { Button } from "@shadcn/components/ui/button";
import { useApi } from "../hooks/useApi";

interface AuthResponse {
}

export function AdminLogin() {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('adminAuthenticated') === 'true');
    const { fetchData, isLoading, error } = useApi<AuthResponse>();

    if (isAuthenticated) {
        return <AdminDashboard/>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await checkPassword();
    };

    async function checkPassword() {
        await fetchData('authCheck', {}, { password, generate_response: 'true' })
            .then((data) => {
                localStorage.setItem('adminAuthenticated', 'true');
                localStorage.setItem('adminPassword', password);
                setIsAuthenticated(true);
            })
            .catch(() => {
                localStorage.setItem('adminAuthenticated', 'false');
                localStorage.removeItem('adminPassword');
                setIsAuthenticated(false);
                alert('Incorrect password');
            });
    }

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
