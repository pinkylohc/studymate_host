"use client"

import { BeatLoader } from "react-spinners";
import Link from 'next/link';
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { newVerification } from "@/action/check_token";


export const NewVerificationForm = () => {
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();

    const searchParams = useSearchParams();

    const token = searchParams.get('token');

    const onSubmit = useCallback(() => {
        if (success || error) return;

        if (!token) { setError("missing token"); return;};

        newVerification(token)
          .then((data) => {
             setSuccess(data.success);
             setError(data.error);
        })
          .catch (() => {
            setError("An error occurred");
          })
          
    },[token]);

    useEffect(() => {
        onSubmit();
    },[onSubmit]);


    return(
        <div className="flex items-center justify-center h-full">
            <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Verifying your email</h1>
                    <p className="mt-2 text-sm text-gray-600">Please wait while we confirm your email address</p>
                </div>

                <div className="space-y-6">
                    {!success && !error && (
                        <div className="flex justify-center">
                            <BeatLoader color="#3b82f6" />
                        </div>
                    )}

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm">
                            {success}
                        </div>
                    )}

                    <div className="text-center">
                        <Link href="/auth/login" className="text-sm text-gray-600 hover:text-blue-600 transition">
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}