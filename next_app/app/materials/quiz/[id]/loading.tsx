import { ProcessingModal } from "@/components/generator/loading_modal";


export default function Loading() {
    return(
        <>
            <ProcessingModal isVisible={true} message="Your request is processing..." />
        </>

    );
};