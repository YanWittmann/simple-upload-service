import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@shadcn/components/ui/input";
import { Button } from "@shadcn/components/ui/button";

// In a real application, this would be securely hashed and stored
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
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter admin password"
        />
        <Button type="submit">Login</Button>
      </form>
    </div>
  );
}

