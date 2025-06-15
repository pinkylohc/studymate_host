import NewPasswordForm from "@/components/auth/new_password_form";
import StartHeader from "@/components/start_header";
import { Suspense } from 'react'

export default function NewPasswordPage() {
    return(
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <StartHeader />
            <div className="container mx-auto px-4 py-8 h-[calc(100vh-4rem)]">
                <Suspense>
                    <NewPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}