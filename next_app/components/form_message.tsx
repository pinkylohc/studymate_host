import { FaRegCheckCircle } from "react-icons/fa";

import { FaExclamationTriangle } from "react-icons/fa";



interface FormProps {
    message?: string;
}

export const FormError = ({
    message,
}: FormProps) => {
    if(!message) return null;

    return(
        <div className="bg-red-300/55 p-3 rounded-md max-w-64 flex items-center gap-x-2 text-sm text-red-600 text-destructive">
            <FaExclamationTriangle className="h-4 w-4"/>
            <p className="break-words">{message}</p>    
        </div>
    );
};

export const FormSuccess = ({
    message,
}: FormProps) => {
    if(!message) return null;

    return(
        <div className="bg-emerald-500 p-3 rounded-md flex items-center gap-x-2 text-sm text-white">
            <FaRegCheckCircle className="h-4 w-4" />
            <p>{message}</p>    
        </div>
    );
};


export const FormValidate = ({
    message,
}: FormProps) => {
    if(!message) return null;

    return(
        <div className="rounded-md flex items-center text-sm text-red-500">
            <p>{message}</p>    
        </div>
    );
};