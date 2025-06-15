/*
  Login page
*/

import StartHeader from "@/components/start_header"
import LoginForm from "@/components/auth/login_form"

export default function LoginPage() {
    return(
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <StartHeader />

            <div className="container mx-auto px-4 py-8 h-[calc(100vh-4rem)]">
                <LoginForm />
            </div>
        </div> 
    )
};