// email verification

import { NewVerificationForm } from "@/components/auth/new_verification_form";
import { Suspense } from 'react'

export default function NewVerificationPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8 h-screen">
                <Suspense>
                    <NewVerificationForm />
                </Suspense>
            </div>
        </div>
    );
}