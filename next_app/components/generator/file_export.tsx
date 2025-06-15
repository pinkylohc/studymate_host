"use client"

import { FaFilePdf, FaFileWord } from "react-icons/fa";
import { exportAsPDFSummary } from "@/action/generator/export_summary_pdf";
import { exportAsWordSummary } from "@/action/generator/export_summary_word";
import { exportAsPDFQuiz } from "@/action/generator/export_quiz_pdf";
import { exportAsWordQuiz } from "@/action/generator/export_quiz_word";

interface exportprop{
    contentstr: any;
    type: string;
}
export default function FileExport({ exportcontent }: { exportcontent: exportprop }){
    const handleExportPDF = () => {
        if (exportcontent.type === 'quiz') {
            exportAsPDFQuiz(exportcontent);
        } else {
            exportAsPDFSummary(exportcontent);
        }
    };

    const handleExportWord = () => {
        if (exportcontent.type === 'quiz') {
            exportAsWordQuiz(exportcontent);
        } else {
            exportAsWordSummary(exportcontent);
        }
    };
    return(

        <div className="space-x-3 mt-1 flex flex-row">


            <button 
                className="rounded-md bg-blue-300 p-2 flex flex-row hover:bg-sky-200 hover:text-blue-600"
                onClick={handleExportPDF} 
            >
                <FaFilePdf className="md:w-6  md:h-6"/>
                <p className="hidden md:block">PDF</p>
            </button>

            <button 
                className="rounded-md bg-blue-300 p-2 flex flex-row hover:bg-sky-200 hover:text-blue-600"
                onClick={handleExportWord}
            >
                <FaFileWord className="md:w-6  md:h-6"/>
                <p className="hidden md:block">Word</p>
            </button>
        </div>

    );
}