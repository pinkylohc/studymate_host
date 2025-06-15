/*
  This component is used to signin with google and github.
*/
"use client"

import {FcGoogle} from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

import signInWithProvider from "@/action/social";

export default function SocialLogin(){

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, provider: string) => {
        e.preventDefault();
        const result = await signInWithProvider(provider);
      };

    return(
        <div>
            {/* signin with google */}
            <form className="flex flex-col items-center justify-center"
            onSubmit={(e) => handleSubmit(e, 'google')}
            > 

                <button type="submit" name="action" value="google"
                        className="flex bg-white items-center p-1 rounded-md m-1 text-sm sm:text-base border-2 border-black">
                    <FcGoogle className="h-5 w-5 mr-2"/>
                    Login with Google
                </button> 

            </form>

            {/* signin with github */}
            <form className="flex flex-col items-center justify-center"
            onSubmit={(e) => handleSubmit(e, 'github')}
            > 

                <button type="submit" name="action" value="github"
                    className="flex bg-black items-center text-white p-1 rounded-md m-1 text-sm sm:text-base border-2">
                    <FaGithub className="h-5 w-5 mr-2"/>
                    Login with GitHub
                </button> 

            </form>
        </div>
    );
}