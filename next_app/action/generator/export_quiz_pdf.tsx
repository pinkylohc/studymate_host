import { jsPDF } from "jspdf";

interface ExportContent {
    contentstr: any;
}

export const exportAsPDFQuiz = (exportcontent: ExportContent) => {
    const content = exportcontent.contentstr;
    const doc = new jsPDF();
    let yOffset = 15; // Initial Y offset with larger margin
    const pageHeight = doc.internal.pageSize.height; // Page height
    const pageWidth = doc.internal.pageSize.width; // Page width
    const margin = 10; // Larger margin

    // Add title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text("Quiz Instructions", pageWidth / 2, yOffset, { align: 'center' });
    yOffset += 10;
    // Draw a black line to separate instructions and questions
    doc.setDrawColor(0, 0, 0); // Black color
    doc.setLineWidth(0.5);
    doc.line(margin, yOffset, pageWidth - margin, yOffset);
    yOffset += 10;
    // Add instructions at the beginning of the document
    const instructions = [
        "Instructions for Taking the Quiz:",
        "1. Read each question carefully.",
        "2. Answer all questions to the best of your ability.",
        "3. For multiple-choice questions, select the best answer.",
        "4. For true/false questions, indicate whether the statement is true or false.",
        "5. For short answer questions, provide a brief response.",
        "6. Review your answers before submitting the quiz.",
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    instructions.forEach((line: string) => {
        if (yOffset > pageHeight - margin) {
            doc.addPage();
            yOffset = margin;
        }
        doc.text(line, margin, yOffset);
        yOffset += 8; // Line height
    });
    yOffset += 2;
    // Draw a black line to separate instructions and questions
    doc.setDrawColor(0, 0, 0); // Black color
    doc.setLineWidth(0.5);
    doc.line(margin, yOffset, pageWidth - margin, yOffset);
    yOffset += 10; // Add extra space after the line

    content.quiz.forEach((item: any, index: number) => {
        doc.setTextColor(0, 0, 0); // Set text color to black
        // Print question type
        /* doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        const typeLines = doc.splitTextToSize(`Type: ${item.type}`, pageWidth - 2 * margin);

        typeLines.forEach((line: string) => {
            if (yOffset > pageHeight - margin) {
                doc.addPage();
                yOffset = margin;
            }
            doc.text(line, margin, yOffset);
            yOffset += 10; // Line height
        });
 */
        // Print question
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        const questionLines = doc.splitTextToSize(`Q${index + 1}: ${item.question}`, pageWidth - 2 * margin);

        questionLines.forEach((line: string) => {
            if (yOffset > pageHeight - margin) {
                doc.addPage();
                yOffset = margin;
            }
            doc.text(line, margin, yOffset);
            yOffset += 10; // Line height
        });

        // Print code block if exists
        if (item.code) {
            doc.setFont('courier', 'normal');
            doc.setFontSize(10);
            const codeLines = doc.splitTextToSize(item.code, pageWidth - 2 * margin);

            codeLines.forEach((line: string) => {
                if (yOffset > pageHeight - margin) {
                    doc.addPage();
                    yOffset = margin;
                }
                doc.text(line, margin, yOffset);
                yOffset += 5; // Line height for code
            });
        }

        // Print choices if exists
        if (item.choices) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
            item.choices.forEach((choice: string, choiceIndex: number) => {
                const choiceLines = doc.splitTextToSize(`${String.fromCharCode(65 + choiceIndex)}. ${choice}`, pageWidth - 2 * margin);

                choiceLines.forEach((line: string) => {
                    if (yOffset > pageHeight - margin) {
                        doc.addPage();
                        yOffset = margin;
                    }
                    doc.text(line, margin, yOffset);
                    yOffset += 10; // Line height for choices
                });
            });
        }

        // Print answer if exists
        if (item.answer) {
            doc.setTextColor(255, 0, 0); // Set text color to red
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
            const answerLines = doc.splitTextToSize(`Answer: ${item.answer}`, pageWidth - 2 * margin);

            answerLines.forEach((line: string) => {
                if (yOffset > pageHeight - margin) {
                    doc.addPage();
                    yOffset = margin;
                }
                doc.text(line, margin, yOffset);
                yOffset += 10; // Line height for answer
            });
        }

        if (item.explanation) {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(12);
            const explanationLines = doc.splitTextToSize(`Explanation: ${item.explanation}`, pageWidth - 2 * margin);
        
            explanationLines.forEach((line: string) => {
                if (yOffset > pageHeight - margin) {
                    doc.addPage();
                    yOffset = margin;
                }
                doc.text(line, margin, yOffset);
                yOffset += 10; // Line height
            });
        }
        
        // add space for each qs
        if (yOffset > pageHeight - margin) {
            doc.addPage();
            yOffset = margin;
        }
        yOffset += 10;

    });

    const currentDate = new Date().toLocaleDateString().toString().split('/').join('-');
    doc.save(`Quiz_${currentDate}.pdf`);
};