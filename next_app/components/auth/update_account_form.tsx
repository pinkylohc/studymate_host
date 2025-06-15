'use client'

import { updatePassword, updateUserName } from "@/db/user";
import { useState } from "react";

interface UpdateAccountFormProps {
    userId: string;
    initialUsername: string;
    initialEmail: string;
}

export default function UpdateAccountForm({ userId, initialUsername, initialEmail }: UpdateAccountFormProps) {
    const [username, setUsername] = useState(initialUsername);
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');



    const handleUsernameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        await updateUserName(userId, username);  
        setMessage('User Name updated successfully. Please re-login to see changes.');
  
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        await updatePassword(userId, password);
        setMessage('Password updated successfully. Please re-login to see changes.');
        
    };


    return (
        <div className="space-y-4">
            {message && (
                <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
                    {message}
                </div>
            )}
            {error && (
                <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                    {error}
                </div>
            )}
            <form onSubmit={handleUsernameSubmit} className="space-y-4">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">User Name:</label>
                    <input
                        type="text"
                        id="username"
                        value={username? username : ''}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Update Username
                </button>
            </form>

            <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
                <span className="block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm">{initialEmail}</span>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Update Password
                </button>
            </form>
        </div>
    )
};