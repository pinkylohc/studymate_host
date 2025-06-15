"use client"

import * as z from "zod";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetSchema } from "@/schemas";
import { reset } from "@/action/reset";
import { FormError, FormSuccess, FormValidate } from "@/components/form_message";
import Link from "next/link";


export default function ResetForm() {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    
      
    const form = useForm<z.infer<typeof ResetSchema>>({
        resolver: zodResolver(ResetSchema),
        defaultValues: {
         email: "",
         },
    });
 
    const submitForm = (values: z.infer<typeof ResetSchema>) => {
         setError("");
         setSuccess("");
        
         startTransition(() => {
             reset(values)
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
                    <h1 className="text-2xl font-bold text-gray-900">Forgot your password?</h1>
                    <p className="mt-2 text-sm text-gray-600">Enter your email to reset your password</p>
                </div>

                <form onSubmit={form.handleSubmit(submitForm)} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input 
                            {...form.register("email")}
                            type="email" 
                            name="email"
                            id="email"
                            disabled={isPending}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition" 
                        />
                        {form.formState.errors.email && <FormValidate message={form.formState.errors.email.message} />}
                    </div>

                    <FormError message={error}/>
                    <FormSuccess message={success}/>

                    <button 
                        type="submit" 
                        disabled={isPending} 
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 disabled:opacity-50"
                    >
                        Send reset email
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