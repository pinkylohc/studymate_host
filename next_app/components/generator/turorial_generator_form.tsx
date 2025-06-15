"use client"
import axios from 'axios';
import FileLoader from "./file_loader";
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { uploadMaterial } from '@/action/generator/upload_material';
import { difficultyLevels, languages } from '@/lib/generator_const';
import { DifficultyLevelSelectionBar, LanguageSelectionBar } from './selection_bar';
import { ProcessingModal } from './loading_modal';
import ReferenceLibrarySelector from './ReferenceLibrarySelector';
import MetadataFilter from './MetadataFilter';
import { useCollections } from '@/hooks/useCollections';
import { HiOutlineDocumentText, HiOutlineLibrary, HiOutlineAdjustments } from 'react-icons/hi';

interface TutorialGeneratorFormProps {
    userEmail?: string | null;
}

export default function TutorialGeneratorForm({ userEmail }: TutorialGeneratorFormProps) {
    const router = useRouter()
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string>('');
    const [text, setText] = useState("");
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [usePrecisePDFMode, setUsePrecisePDFMode] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Quiz-specific states
    const [language, setLanguage] = useState<string>(languages[0]);
    const [difficulty, setDifficulty] = useState<string>(difficultyLevels[0]);
    const [prompt, setPrompt] = useState<string>("");
    const [numberOfQuestions, setNumberOfQuestions] = useState<number>(10);

    const {
        collections: availableCollections,
        metadata: collectionMetadata,
        selectedCollections,
        setSelectedCollections,
        selectedFilters,
        setSelectedFilters,
        getAvailableMetadata
    } = useCollections(userEmail);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.max(200, textarea.scrollHeight)}px`;
        }
    }, [text]);

    async function handleSubmitForm(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        
        if (!text.trim() && files.length === 0) {
            setError("Please provide either text or upload files");
            return;
        }

        try {
            setIsModalVisible(true);
            
            // First, generate summary
            const summaryFormData = new FormData();
            files.forEach(file => summaryFormData.append("files", file));
            summaryFormData.append("inputtext", text);
            summaryFormData.append("file_type", "Auto");
            summaryFormData.append("precise_pdf", usePrecisePDFMode.toString());
            
            if (selectedCollections.length > 0) {
                summaryFormData.append("collections", selectedCollections.join(','));
            }

            if (selectedFilters.course_codes.length > 0) {
                summaryFormData.append("course_codes", selectedFilters.course_codes.join(','));
            }
            if (selectedFilters.topics.length > 0) {
                summaryFormData.append("topics", selectedFilters.topics.join(','));
            }
            if (selectedFilters.filenames.length > 0) {
                summaryFormData.append("filenames", selectedFilters.filenames.join(','));
            }
            
            const summaryResponse = await axios.post(
                "http://localhost:8000/summary/submit",
                summaryFormData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            // Then, generate quiz
            const quizFormData = new FormData();
            files.forEach(file => quizFormData.append("files", file));
            quizFormData.append("inputtext", text);
            quizFormData.append("language", language);
            quizFormData.append("difficulty", difficulty);
            quizFormData.append("noQuestion", numberOfQuestions.toString());
            quizFormData.append("prompt", prompt);
            quizFormData.append("file_type", "Auto");
            quizFormData.append("precise_pdf", usePrecisePDFMode.toString());

            if (selectedCollections.length > 0) {
                quizFormData.append("collections", selectedCollections.join(','));
            }
            if (selectedFilters.course_codes.length > 0) {
                quizFormData.append("course_codes", selectedFilters.course_codes.join(','));
            }
            if (selectedFilters.topics.length > 0) {
                quizFormData.append("topics", selectedFilters.topics.join(','));
            }
            if (selectedFilters.filenames.length > 0) {
                quizFormData.append("filenames", selectedFilters.filenames.join(','));
            }

            const quizResponse = await axios.post(
                "http://localhost:8000/quiz/submit",
                quizFormData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            // Combine the data
            const tutorialData = {
                files: files.map(f => f.name),
                text: text,
                summary: summaryResponse.data,
                quiz: quizResponse.data,
                language: language,
                difficulty: difficulty,
                prompt: prompt,
                noQuestion: numberOfQuestions,
                collections: selectedCollections,
                filters: selectedFilters
            };

            // Store in database
            const tutorialId = await uploadMaterial(
                JSON.stringify(tutorialData),
                "tutorial",
                JSON.stringify({
                    fileName: files.map(f => f.name),
                    text: text,
                    collections: selectedCollections,
                    filters: selectedFilters,
                    language: language,
                    difficulty: difficulty,
                    prompt: prompt,
                    noQuestion: numberOfQuestions
                })
            );

            router.push(`/materials/tutorial/${tutorialId}`);
            
        } catch(e) {
            console.error("Error submitting form:", e);
            setError("An error occurred while generating the tutorial");
        } finally {
            setIsModalVisible(false);
        }
    }

    return (
        <form 
          onSubmit={handleSubmitForm} 
          className="max-w-[1200px] mx-auto w-full"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Input Methods */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-gray-200/75 shadow-sm">
                        <div className="flex items-center space-x-3 mb-4">
                            <HiOutlineDocumentText className="w-6 h-6 text-blue-600" />
                            <h2 className="text-lg font-medium text-gray-900">Upload Files or Enter Text</h2>
                        </div>
                        <FileLoader 
                            files={files} 
                            setFiles={setFiles} 
                            inputType="All" 
                            usePrecisePDFMode={usePrecisePDFMode}
                            setUsePrecisePDFMode={setUsePrecisePDFMode}
                        />
                        <div className="mt-4">
                            <textarea
                                ref={textareaRef}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Type or paste your text here to generate a tutorial..."
                                className="w-full min-h-[200px] max-h-[600px] p-4 rounded-xl border border-gray-200 
                                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none bg-gray-50/50
                                overflow-y-auto leading-relaxed"
                                style={{
                                    height: 'auto',
                                }}
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-200/75 shadow-sm">
                        <div className="flex items-center space-x-3 mb-4">
                            <HiOutlineLibrary className="w-6 h-6 text-blue-600" />
                            <h2 className="text-lg font-medium text-gray-900">Reference Library</h2>
                        </div>
                        <ReferenceLibrarySelector
                            availableCollections={availableCollections}
                            selectedCollections={selectedCollections}
                            setSelectedCollections={setSelectedCollections}
                            collectionMetadata={collectionMetadata}
                            setSelectedFilters={setSelectedFilters}
                            selectedFilters={selectedFilters}
                        />

                        {selectedCollections.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-gray-700 mb-3">Filter References</h3>
                                <MetadataFilter
                                    availableMetadata={getAvailableMetadata()}
                                    selectedFilters={selectedFilters}
                                    setSelectedFilters={setSelectedFilters}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Quiz Settings */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-gray-200/75 shadow-sm">
                        <div className="flex items-center space-x-3 mb-4">
                            <HiOutlineAdjustments className="w-6 h-6 text-blue-600" />
                            <h2 className="text-lg font-medium text-gray-900">Quiz Settings</h2>
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                                <DifficultyLevelSelectionBar difficultyLevel={difficulty} setDifficultyLevel={setDifficulty} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                                <LanguageSelectionBar language={language} setLanguage={setLanguage} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
                                <input
                                    type="number"
                                    value={numberOfQuestions}
                                    onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50"
                                    min="1"
                                    max="50"
                                />
                                <p className="mt-1.5 text-sm text-gray-500">Enter a number between 1 and 50</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Subject Focus (optional)</label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g., I want to focus more on topics related to grammar"
                                    className="w-full h-[120px] px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-gray-50/50"
                                />
                                <p className="mt-1.5 text-sm text-gray-500">Specify any particular topics or areas you want the quiz to focus on</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3.5 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
                        >
                            Generate Tutorial
                        </button>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}
                </div>
            </div>

            <ProcessingModal
                isVisible={isModalVisible}
                message="Generating tutorial..."
            />
        </form>
    );
}