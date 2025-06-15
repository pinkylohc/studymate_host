"use client"

import * as z from "zod";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NewPasswordSchema } from "@/schemas";
import { newPassword } from "@/action/new_password";
import { FormError, FormSuccess, FormValidate } from "@/components/form_message";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function NewPasswordForm() {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    
      
    const form = useForm<z.infer<typeof NewPasswordSchema>>({
        resolver: zodResolver(NewPasswordSchema),
        defaultValues: {
         password: "",
         },
    });
 
    const submitForm = (values: z.infer<typeof NewPasswordSchema>) => {
         setError("");
         setSuccess("");
        
         startTransition(() => {
             newPassword(values, token)
                .then((data)=>{
                 setError(data?.error);
                 setSuccess(data?.success);
              })
         });
    }

    return(
        <div className="flex items-center justify-center h-full">
            <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
                    <p className="mt-2 text-sm text-gray-600">Enter your new password below</p>
                </div>

                <form onSubmit={form.handleSubmit(submitForm)} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
                        <input 
                            {...form.register("password")}
                            type="password" 
                            name="password"
                            id="password"
                            disabled={isPending}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition" 
                        />
                        {form.formState.errors.password && <FormValidate message={form.formState.errors.password.message} />}
                    </div>

                    <FormError message={error}/>
                    <FormSuccess message={success}/>

                    <button 
                        type="submit" 
                        disabled={isPending} 
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 disabled:opacity-50"
                    >
                        Reset password
                    </button>

                    <div className="text-center">
                        <Link href="/auth/login" className="text-sm text-gray-600 hover:text-blue-600 transition">
                            Back to login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}