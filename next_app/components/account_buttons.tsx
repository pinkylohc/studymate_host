'use client'

import signOutUser from '@/action/signout';
import { deleteAccount } from '@/db/user';
import { useRouter } from 'next/navigation';

interface DeleteAccountButtonProps {
    userId: string;
  }
  
export const DeleteAccountButton: React.FC<DeleteAccountButtonProps> = ({ userId }) => {
    const router = useRouter();


  const handleDeleteAccount = async () => {
    const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (!confirmed) return;

    try {
        // Call the server-side function to delete the account
        await deleteAccount(userId);
        await signOutUser();
        // Redirect to login page
        router.push('/');
        
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('An error occurred while deleting your account');
      }

  };

  return (
    <button
      onClick={handleDeleteAccount}
      className="bg-red-500 text-white p-2 rounded mt-4 hover:bg-red-600 transition duration-200"
    >
      Delete Account
    </button>
  );
};

