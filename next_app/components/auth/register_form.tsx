"use client"

import * as z from "zod";

import SocialLogin from "./social_login";

import Link from "next/link";
import { RegisterSchema } from "@/schemas"
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormError, FormSuccess, FormValidate } from "@/components/form_message";
import { register } from "@/action/register";


export default function RegisterForm() {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof RegisterSchema>>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
        name: "",
         email: "",
         password: "",
         },
     });
     
     const submitForm = (values: z.infer<typeof RegisterSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            register(values)
               .then((data)=>{
                setError(data.error);
                setSuccess(data.success);
             })
        });
    }

    return(
        <div className="flex items-center justify-center h-full">
            <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
                    <p className="mt-2 text-sm text-gray-600">Sign up for a new account</p>
                </div>

                <form onSubmit={form.handleSubmit(submitForm)} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Username</label>
                        <input 
                            {...form.register("name")}
                            type="text" 
                            id="name"
                            name="name" 
                            disabled={isPending}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition" 
                        />
                        {form.formState.errors.name && <FormValidate message={form.formState.errors.name.message} />}
                    </div>

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

                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
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
                        Create Account
                    </button>

                    <div className="text-center">
                        <Link href="/auth/login" className="text-sm text-gray-600 hover:text-blue-600 transition">
                            Already have an account? <span className="font-medium">Sign in</span>
                        </Link>
                    </div>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                </div>
                
                <SocialLogin />
            </div>
        </div>
    );
}