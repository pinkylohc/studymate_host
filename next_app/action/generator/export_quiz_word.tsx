import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

interface ExportContent {
    contentstr: any;
}

export const exportAsWordQuiz = async (exportcontent: ExportContent) => {
    const content = exportcontent.contentstr;

    const paragraphs: Paragraph[] = [];

    // Add a black line to separate instructions and questions
    const separatorParagraph = new Paragraph({
        border: {
            bottom: {
                color: "000000",
                space: 1,
                style: "single",
                size: 6,
            },
        },
        spacing: {
            after: 200, // Add extra space after the line
        },
    });

    // Add title
    const titleParagraph = new Paragraph({
        children: [
            new TextRun({
                text: "Quiz Instructions",
                bold: true,
                size: 32,
            }),
        ],
        alignment: "center",
        spacing: {
            after: 200, // Add spacing after the title
        },
    });
    paragraphs.push(titleParagraph);
    paragraphs.push(separatorParagraph);
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

    instructions.forEach((line: string) => {
        const instructionParagraph = new Paragraph({
            children: [
                new TextRun({
                    text: line,
                    bold: true,
                    size: 24,
                }),
            ],
            spacing: {
                after: 200, // Add spacing after each instruction line
            },
        });
        paragraphs.push(instructionParagraph);
    });

    paragraphs.push(separatorParagraph);

    content.quiz.forEach((item: any, index: number) => {
        // Add question type
        /* const typeParagraph = new Paragraph({
            children: [
                new TextRun({
                    text: `Type: ${item.type}`,
                    bold: true,
                    size: 24,
                }),
            ],
            spacing: {
                after: 200, // Add spacing after the paragraph
            },
        });
        paragraphs.push(typeParagraph); */

        // Add question
        const questionParagraph = new Paragraph({
            children: [
                new TextRun({
                    text: `Q${index + 1}: ${item.question}`,
                    bold: true,
                    size: 24,
                }),
            ],
            spacing: {
                after: 200, // Add spacing after the paragraph
            },
        });
        paragraphs.push(questionParagraph);

        // Add code block if exists
        if (item.code) {
            const codeLines = item.code.split('\n');
            codeLines.forEach((line: string) => {
                const codeParagraph = new Paragraph({
                    children: [
                        new TextRun({
                            text: line,
                            font: "Courier",
                            size: 20,
                        }),
                    ],
                    spacing: {
                        after: 100, // Add spacing after each code line
                    },
                });
                paragraphs.push(codeParagraph);
            });
        }

        // Add choices if exists
        if (item.choices) {
            item.choices.forEach((choice: string, choiceIndex: number) => {
                const choiceParagraph = new Paragraph({
                    children: [
                        new TextRun({
                            text: `${String.fromCharCode(65 + choiceIndex)}. ${choice}`,
                            size: 24,
                        }),
                    ],
                    spacing: {
                        after: 100, // Add spacing after each choice
                    },
                });
                paragraphs.push(choiceParagraph);
            });
        }

        // Add answer if exists
        if (item.answer) {
            const answerParagraph = new Paragraph({
                children: [
                    new TextRun({
                        text: `Answer: ${item.answer}`,
                        color: "FF0000", // Red color
                        size: 24,
                    }),
                ],
                spacing: {
                    after: 200, // Add spacing after the answer
                },
            });
            paragraphs.push(answerParagraph);
        }

        if (item.explanation) {
            const explanationParagraph = new Paragraph({
                children: [
                    new TextRun({
                        text: `Explanation: ${item.explanation}`,
                        color: "FF0000", // Red color
                        size: 24,
                    }),
                ],
                spacing: {
                    after: 200, // Add spacing after the paragraph
                },
            });
            paragraphs.push(explanationParagraph);
        }
        
        // Add spacing between questions
        paragraphs.push(new Paragraph({ spacing: { after: 400 } }));
    });

    const doc = new Document({
        sections: [
            {
                children: paragraphs,
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    const currentDate = new Date().toLocaleDateString().toString().split('/').join('-');
    saveAs(blob, `Quiz_${currentDate}.docx`);
};