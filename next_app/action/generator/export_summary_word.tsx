import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, HeadingLevel, AlignmentType, ShadingType, convertInchesToTwip } from "docx";
import { saveAs } from "file-saver";

interface ExportContent {
    contentstr: string;  // Now expecting markdown string
}

type DocElement = Paragraph | Table;

export const exportAsWordSummary = (exportcontent: ExportContent) => {
    const lines = exportcontent.contentstr.split('\n');
    const elements: DocElement[] = [];
    let inCodeBlock = false;
    let codeLanguage = '';
    let tableRows: string[][] = [];

    // Function to process inline formatting
    const processInlineFormatting = (text: string) => {
        const parts = text.split(/(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*|~~.*?~~|`.*?`)/g).filter(Boolean);
        return parts.map(part => {
            if (part.startsWith('***') && part.endsWith('***')) {
                return new TextRun({
                    text: part.slice(3, -3),
                    bold: true,
                    italics: true,
                    size: 24
                });
            } else if (part.startsWith('**') && part.endsWith('**')) {
                return new TextRun({
                    text: part.slice(2, -2),
                    bold: true,
                    size: 24
                });
            } else if (part.startsWith('*') && part.endsWith('*')) {
                return new TextRun({
                    text: part.slice(1, -1),
                    italics: true,
                    size: 24
                });
            } else if (part.startsWith('~~') && part.endsWith('~~')) {
                return new TextRun({
                    text: part.slice(2, -2),
                    strike: true,
                    size: 24
                });
            } else if (part.startsWith('`') && part.endsWith('`')) {
                return new TextRun({
                    text: part.slice(1, -1),
                    font: 'Courier New',
                    size: 24,
                    shading: {
                        type: ShadingType.SOLID,
                        color: "F0F0F0"
                    }
                });
            } else {
                return new TextRun({
                    text: part,
                    size: 24
                });
            }
        });
    };

    lines.forEach((line, index) => {
        // Headers
        if (line.startsWith('# ')) {
            elements.push(
                new Paragraph({
                    heading: HeadingLevel.HEADING_1,
                    spacing: { after: 200 },
                    children: [
                        new TextRun({
                            text: line.substring(2),
                            size: 36
                        })
                    ]
                })
            );
            return;
        }

        if (line.startsWith('## ')) {
            elements.push(
                new Paragraph({
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 200 },
                    children: [
                        new TextRun({
                            text: line.substring(3),
                            size: 32
                        })
                    ]
                })
            );
            return;
        }

        if (line.startsWith('### ')) {
            elements.push(
                new Paragraph({
                    heading: HeadingLevel.HEADING_3,
                    spacing: { after: 200 },
                    children: [
                        new TextRun({
                            text: line.substring(4),
                            size: 28
                        })
                    ]
                })
            );
            return;
        }

        // Lists (both ordered and unordered)
        if (line.match(/^\s*[-*+]\s/) || line.match(/^\s*\d+\.\s/)) {
            const leadingSpaces = line.match(/^\s*/)?.[0]?.length || 0;
            const indentLevel = Math.floor(leadingSpaces / 2);
            const isOrdered = line.match(/^\s*\d+\.\s/);

            // Remove bullet/number and spaces
            const textContent = line.replace(/^\s*(?:[-*+]|\d+\.)\s+/, '');

            elements.push(
                new Paragraph({
                    children: processInlineFormatting(textContent),
                    bullet: {
                        level: indentLevel
                    },
                    indent: {
                        left: convertInchesToTwip(0.5 * (indentLevel + 1)),
                        hanging: convertInchesToTwip(0.25)
                    },
                    spacing: { after: 120 }
                })
            );
            return;
        }

        // Code blocks
        if (line.trim().startsWith('```')) {
            if (!inCodeBlock) {
                const parts = line.trim().substring(3).split(' ');
                codeLanguage = parts[0];
                inCodeBlock = true;
            } else {
                inCodeBlock = false;
                codeLanguage = '';
            }
            return;
        }


        if (inCodeBlock) {
            elements.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: line,
                            font: 'Courier New',
                            size: 20
                        })
                    ],
                    spacing: { after: 120 },
                    shading: {
                        type: ShadingType.SOLID,
                        color: "F0F0F0"
                    }
                })
            );
            return;
        }

        // Tables
        if (line.startsWith('|')) {
            const cells = line.split('|')
                .filter(cell => cell.trim() !== '')
                .map(cell => cell.trim());

            if (cells.length > 0) {
                if (line.includes('---')) {
                    // This is a separator row, skip it
                    return;
                }

                const tableRow = new TableRow({
                    children: cells.map(cell =>
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: processInlineFormatting(cell),
                                    alignment: AlignmentType.LEFT
                                })
                            ],
                            borders: {
                                top: { style: BorderStyle.SINGLE, size: 1 },
                                bottom: { style: BorderStyle.SINGLE, size: 1 },
                                left: { style: BorderStyle.SINGLE, size: 1 },
                                right: { style: BorderStyle.SINGLE, size: 1 }
                            },
                            shading: tableRows.length === 0 ? {
                                type: ShadingType.SOLID,
                                color: "F0F0F0"
                            } : undefined
                        })
                    )
                });

                if (tableRows.length === 0) {
                    // Start new table
                    tableRows = [cells];
                    elements.push(
                        new Table({
                            rows: [tableRow]
                        })
                    );
                } else {
                    // Add to existing table
                    const currentTable = elements[elements.length - 1] as Table;
                    (currentTable as any).root.push(tableRow);
                    tableRows.push(cells);
                }
            }
            return;
        } else if (tableRows.length > 0) {
            // Reset table state when we're no longer in a table
            tableRows = [];
        }

        // Regular paragraphs
        if (line.trim() !== '') {
            elements.push(
                new Paragraph({
                    children: processInlineFormatting(line),
                    spacing: { after: 120 }
                })
            );
        } else {
            // Empty line
            elements.push(
                new Paragraph({
                    spacing: { after: 120 }
                })
            );
        }
    });

    const doc = new Document({
        sections: [{
            properties: {},
            children: elements
        }]
    });

    // Generate and save document
    Packer.toBlob(doc).then((blob) => {
        saveAs(blob, `Summary_${new Date().toISOString().slice(0, 10)}.docx`);
    });
};