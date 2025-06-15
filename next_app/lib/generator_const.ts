
export const fileTypes = [
    'Document',
    'Presentation',
    'Spreadsheet',
    'Image',
    'Audio',
    // Todo: support video
    'Video',
    // will be deprecated
    'PDF/Word'
] as const;

export const difficultyLevels = ['Easy', 'Medium', 'Hard'];

export const languages = ['English', 'Chinese'];


// for handle different accept file for file loader
export const fileTypeMappings = {
    'Document': {
        display: 'Document (PDF, Word, Text, CSV, JSON, XML, HTML, Markdown)',
        extensions: '.pdf,.docx,.txt,.csv,.json,.xml,.html,.md'
    },
    'Presentation': {
        display: 'Presentation (PowerPoint',
        extensions: '.pptx'
    },
    'Spreadsheet': {
        display: 'Spreadsheet (Excel)',
        extensions: '.xlsx'
    },
    'Image': {
        display: 'Image (JPG, PNG)',
        extensions: '.jpg,.jpeg,.png'
    },
    'Audio': {
        display: 'Audio (MP3, WAV)',
        extensions: '.mp3,.wav'
    },
    // TODO: support video
    'Video': {
        display: 'Video (MP4)',
        extensions: '.mp4'
    },
    // will be deprecated
    'PDF/Word': {
        display: 'PDF/Word (PDF, Word)',
        extensions: '.pdf,.docx'
    },
} as const;

export type FileCategory = typeof fileTypes[number];

export function getAcceptedFileTypes(category: FileCategory) {
    return fileTypeMappings[category].extensions;
}

export function getAllSupportedExtensions() {
    return Object.values(fileTypeMappings)
        .map((mapping) => mapping.extensions)
        .join(',');
}