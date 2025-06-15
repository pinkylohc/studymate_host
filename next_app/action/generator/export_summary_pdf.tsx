import { jsPDF } from "jspdf";

interface ExportContent {
    contentstr: string;  // Now expecting markdown string
}

export const exportAsPDFSummary = (exportcontent: ExportContent) => {
    const doc = new jsPDF();
    let yOffset = 15; // Initial Y offset with larger margin
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 10;
    let inCodeBlock = false;
    let tableRows: string[] = [];
    let codeLanguage = '';
    let listLevel = 0;

    // Function to check if we need a new page
    const checkNewPage = (height: number) => {
        if (yOffset + height > pageHeight - margin) {
            doc.addPage();
            yOffset = margin;
            return true;
        }
        return false;
    };

    // Function to process inline formatting
    const processInlineFormatting = (text: string, x: number, y: number, maxWidth: number) => {
        // Split text by various markdown patterns
        const parts = text.split(/(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*|~~.*?~~|`.*?`)/g).filter(Boolean);
        let currentX = x;

        parts.forEach(part => {
            // Bold and Italic
            if (part.startsWith('***') && part.endsWith('***')) {
                doc.setFont('helvetica', 'bolditalic');
                const content = part.slice(3, -3);
                doc.text(content, currentX, y);
                currentX += doc.getTextWidth(content);
            }
            // Bold
            else if (part.startsWith('**') && part.endsWith('**')) {
                doc.setFont('helvetica', 'bold');
                const content = part.slice(2, -2);
                doc.text(content, currentX, y);
                currentX += doc.getTextWidth(content);
            }
            // Italic
            else if (part.startsWith('*') && part.endsWith('*')) {
                doc.setFont('helvetica', 'italic');
                const content = part.slice(1, -1);
                doc.text(content, currentX, y);
                currentX += doc.getTextWidth(content);
            }
            // Strikethrough
            else if (part.startsWith('~~') && part.endsWith('~~')) {
                doc.setFont('helvetica', 'normal');
                const content = part.slice(2, -2);
                const textWidth = doc.getTextWidth(content);
                // Draw the text
                doc.text(content, currentX, y);
                // Set strikethrough line style
                doc.setDrawColor(0, 0, 0);  // Black color
                // Draw the strikethrough line
                doc.line(currentX, y - 1, currentX + textWidth, y - 1);
                currentX += textWidth;
            }
            // Inline code
            else if (part.startsWith('`') && part.endsWith('`')) {
                doc.setFont('courier', 'normal');
                const content = part.slice(1, -1);
                const codeWidth = doc.getTextWidth(content);

                // Add spacing before inline code if not at start of line
                if (currentX > x) {
                    currentX += 1; // Add space before code
                }

                doc.setFillColor(245, 245, 245);
                doc.rect(currentX - 0.5, y - doc.getFontSize() * 0.3, codeWidth + 1, doc.getFontSize() * 0.45, 'F');

                doc.text(content, currentX, y);
                currentX += codeWidth;

                // Add spacing after inline code if not at end of line
                if (currentX < x + maxWidth) {
                    currentX += 1;
                }
            }
            // Regular text
            else {
                doc.setFont('helvetica', 'normal');
                const textLines = doc.splitTextToSize(part, maxWidth - (currentX - x));
                doc.text(textLines[0] || '', currentX, y);
                currentX += doc.getTextWidth(textLines[0] || '');
            }
        });

        return currentX;
    };

    // Split the markdown content into lines
    const lines = exportcontent.contentstr.split('\n');

    lines.forEach((line, index) => {
        let fontSize = 12;
        let lineHeight = fontSize * 0.9;

        // Check for new page
        checkNewPage(lineHeight);

        // Headers
        if (line.startsWith('# ')) {
            fontSize = 24;
            lineHeight = fontSize * 0.9;
            doc.setFontSize(fontSize);
            doc.setFont('helvetica', 'bold');
            const text = line.substring(2);
            const textLines = doc.splitTextToSize(text, pageWidth - 2 * margin);
            textLines.forEach((textLine: string, idx: number) => {
                checkNewPage(lineHeight);
                doc.text(textLine, margin, yOffset + (idx * lineHeight));
            });
            yOffset += textLines.length * lineHeight + 3;
            return;
        }

        if (line.startsWith('## ')) {
            fontSize = 20;
            lineHeight = fontSize * 0.9;
            doc.setFontSize(fontSize);
            doc.setFont('helvetica', 'bold');
            const text = line.substring(3);
            const textLines = doc.splitTextToSize(text, pageWidth - 2 * margin);
            textLines.forEach((textLine: string, idx: number) => {
                checkNewPage(lineHeight);
                doc.text(textLine, margin, yOffset + (idx * lineHeight));
            });
            yOffset += textLines.length * lineHeight + 2;
            return;
        }

        if (line.startsWith('### ')) {
            fontSize = 16;
            lineHeight = fontSize * 0.9;
            doc.setFontSize(fontSize);
            doc.setFont('helvetica', 'bold');
            const text = line.substring(4);
            const textLines = doc.splitTextToSize(text, pageWidth - 2 * margin);
            textLines.forEach((textLine: string, idx: number) => {
                checkNewPage(lineHeight);
                doc.text(textLine, margin, yOffset + (idx * lineHeight));
            });
            yOffset += textLines.length * lineHeight + 1;
            return;
        }

        // Lists
        if (line.match(/^\s*[-*+]\s/) || line.match(/^\s*\d+\.\s/)) {
            fontSize = 12;
            lineHeight = fontSize * 0.9;
            doc.setFontSize(fontSize);

            // Calculate indentation level
            const leadingSpaces = line.match(/^\s*/)?.[0]?.length || 0;
            const indentLevel = Math.floor(leadingSpaces / 2);

            // Calculate positions
            const bulletIndent = margin + (indentLevel * 8);
            const textIndent = bulletIndent + 4;

            // Draw bullet or number
            doc.setFont('helvetica', 'normal');
            const isOrdered = line.match(/^\s*\d+\.\s/);
            if (isOrdered) {
                const number = line.match(/^\s*(\d+)\./)?.[1] || '1';
                doc.text(`${number}.`, bulletIndent, yOffset);
            } else {
                doc.text('•', bulletIndent, yOffset);
            }

            // Process the text content with inline formatting
            const textContent = line.replace(/^\s*(?:[-*+]|\d+\.)\s+/, '');
            const maxWidth = pageWidth - textIndent - margin;
            processInlineFormatting(textContent, textIndent, yOffset, maxWidth);

            yOffset += lineHeight * 0.9;
            return;
        }

        // Code blocks
        if (line.trim().startsWith('```')) {
            if (!inCodeBlock) {
                codeLanguage = line.trim().substring(3).split(' ')[0];
                inCodeBlock = true;
                yOffset += fontSize * 0.2;
            } else {
                inCodeBlock = false;
                codeLanguage = '';
                yOffset += fontSize * 0.2;
            }
            return;
        }


        if (inCodeBlock) {
            fontSize = 10;
            lineHeight = fontSize * 0.7;
            doc.setFontSize(fontSize);
            doc.setFont('courier', 'normal');

            // Draw background with minimal padding
            doc.setFillColor(245, 245, 245);
            doc.rect(margin, yOffset - fontSize * 0.6, pageWidth - 2 * margin, lineHeight + 0.2, 'F');

            // Draw text
            doc.setTextColor(0, 0, 0);
            const textLines = doc.splitTextToSize(line, pageWidth - 2 * margin - 6);
            textLines.forEach((textLine: string, idx: number) => {
                checkNewPage(lineHeight);
                doc.text(textLine, margin + 3, yOffset + (idx * lineHeight));
            });

            yOffset += lineHeight;
            return;
        }

        // Tables
        if (line.startsWith('|')) {
            fontSize = 9; // Smaller font for tables
            lineHeight = fontSize * 0.8; // Tighter line spacing for tables
            doc.setFontSize(fontSize);

            const cells = line.split('|')
                .filter(cell => cell.trim() !== '')
                .map(cell => cell.trim());

            if (cells.length > 0) {
                const cellWidth = (pageWidth - 2 * margin) / cells.length;
                const cellHeight = lineHeight + 0.2;
                const cellTop = yOffset - fontSize * 0.6;
                const cellBottom = yOffset + lineHeight * 0.4;
                const textBaseline = yOffset + (lineHeight * 0.2); // Adjust text baseline for vertical centering

                // Draw borders and backgrounds
                cells.forEach((_, index) => {
                    const x = margin + (cellWidth * index);

                    if (!line.includes('---')) {
                        if (tableRows.length === 0) {
                            // Header row background - extend to match borders exactly
                            doc.setFillColor(240, 240, 240);
                            doc.rect(x, cellTop, cellWidth, cellBottom - cellTop, 'F');
                        }
                    }
                });

                // Draw all borders after backgrounds
                if (!line.includes('---')) {
                    doc.setDrawColor(200, 200, 200);

                    cells.forEach((_, index) => {
                        const x = margin + (cellWidth * index);

                        // Draw vertical borders for all columns
                        if (tableRows.length === 0) {
                            // For header, draw full height vertical lines
                            doc.line(x, cellTop, x, cellBottom);
                        } else {
                            // For content rows, connect to previous row
                            doc.line(x, cellTop, x, cellBottom);
                        }

                        // Draw horizontal borders
                        if (tableRows.length === 0) {
                            // Header: top and bottom borders
                            doc.line(x, cellTop, x + cellWidth, cellTop);
                            doc.line(x, cellBottom, x + cellWidth, cellBottom);
                        } else {
                            // Content: only bottom border
                            doc.setDrawColor(220, 220, 220);
                            doc.line(x, cellBottom, x + cellWidth, cellBottom);
                        }
                    });

                    // Draw final vertical border
                    const finalX = margin + (cellWidth * cells.length);
                    if (tableRows.length === 0) {
                        doc.setDrawColor(200, 200, 200);
                        doc.line(finalX, cellTop, finalX, cellBottom);
                    } else {
                        doc.setDrawColor(220, 220, 220);
                        doc.line(finalX, cellTop, finalX, cellBottom);
                    }
                }

                // Reset drawing properties for text formatting
                doc.setDrawColor(0, 0, 0);

                // Add text with inline formatting
                if (!line.includes('---')) {
                    cells.forEach((cell, index) => {
                        const x = margin + (cellWidth * index) + 2;
                        const maxWidth = cellWidth - 4;
                        // Use the adjusted baseline for text positioning
                        processInlineFormatting(cell, x, textBaseline, maxWidth);
                    });

                    // Only increment yOffset for non-separator rows
                    yOffset += lineHeight * 0.8;
                }

                // Track rows for table state
                if (!line.includes('---')) {
                    tableRows.push(line);
                }
            }
            doc.setLineWidth(0.2); // Reset line width for other elements
            return;
        }

        // Regular paragraphs
        if (line.trim() !== '') {
            fontSize = 12;
            lineHeight = fontSize * 0.9;
            doc.setFontSize(fontSize);

            const maxWidth = pageWidth - 2 * margin;
            processInlineFormatting(line, margin, yOffset, maxWidth);
            yOffset += lineHeight;
        } else {
            // Empty line
            yOffset += fontSize * 0.3;
        }
    });

    // Generate and save document
    doc.save(`Summary_${new Date().toISOString().slice(0, 10)}.pdf`);
};