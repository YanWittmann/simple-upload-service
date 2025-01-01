import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@shadcn/components/ui/input";
import { Button } from "@shadcn/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@shadcn/components/ui/card";

const ADMIN_PASSWORD = 'admin123';

export function AdminLogin() {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('adminAuthenticated', 'true');
      navigate('/admin');
    } else {
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

