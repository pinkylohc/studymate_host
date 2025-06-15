"use client"

import { fileTypes, difficultyLevels, languages } from '@/lib/generator_const';

interface fileSelectionProp {
    inputType: string;
    setInputType: React.Dispatch<React.SetStateAction<string>>;
}

interface LanguageSelectionProp {
    language: string;
    setLanguage: React.Dispatch<React.SetStateAction<string>>;
}

interface DifficultyLevelSelectionProp {
    difficultyLevel: string;
    setDifficultyLevel: React.Dispatch<React.SetStateAction<string>>;
}

export const FileSelectionBar: React.FC<fileSelectionProp> = ({ inputType, setInputType }) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>, fileType: string) => {
        event.preventDefault();
        setInputType(fileType);
    };

    return(
        <div className="flex flex-wrap gap-2">
            {fileTypes.map(fileType => (
                <button 
                    key={fileType} 
                    onClick={(event) => handleClick(event, fileType)} 
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${inputType === fileType 
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                        }`}
                >
                    {fileType}
                </button>
            ))}
        </div>
    );
}

export const DifficultyLevelSelectionBar: React.FC<DifficultyLevelSelectionProp> = ({ difficultyLevel, setDifficultyLevel }) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>, level: string) => {
        event.preventDefault();
        setDifficultyLevel(level);
    };

    return(
        <div className="flex flex-wrap gap-2">
            {difficultyLevels.map(level => (
                <button 
                    key={level} 
                    onClick={(event) => handleClick(event, level)} 
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${difficultyLevel === level 
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                        }`}
                >
                    {level}
                </button>
            ))}
        </div>
    );
};

export const LanguageSelectionBar: React.FC<LanguageSelectionProp> = ({ language, setLanguage }) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>, lang: string) => {
        event.preventDefault();
        setLanguage(lang);
    };

    return(
        <div className="flex flex-wrap gap-2">
            {languages.map(lang => (
                <button 
                    key={lang} 
                    onClick={(event) => handleClick(event, lang)} 
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${language === lang 
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                        }`}
                >
                    {lang}
                </button>
            ))}
        </div>
    );
};