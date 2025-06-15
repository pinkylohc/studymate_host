import { BookOpenIcon, TagIcon, DocumentIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface MetadataFilters {
  course_codes: string[];
  topics: string[];
  filenames: string[];
}

interface MetadataFilterProps {
  availableMetadata: {
    course_codes: string[];
    topics: string[];
    filenames: string[];
  };
  selectedFilters: MetadataFilters;
  setSelectedFilters: (filters: MetadataFilters) => void;
}

export default function MetadataFilter({
  availableMetadata,
  selectedFilters,
  setSelectedFilters
}: MetadataFilterProps) {
  return (
    <div className="space-y-6">
      {/* Course Codes Filter */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <BookOpenIcon className="h-5 w-5 text-blue-600" />
          <h4 className="font-medium text-gray-900">Courses</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableMetadata.course_codes.map((code) => {
            const isSelected = selectedFilters.course_codes.includes(code);
            return (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setSelectedFilters({
                    ...selectedFilters,
                    course_codes: isSelected
                      ? selectedFilters.course_codes.filter(c => c !== code)
                      : [...selectedFilters.course_codes, code]
                  });
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isSelected
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`}
              >
                {code}
              </button>
            );
          })}
        </div>
      </div>

      {/* Topics Filter */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <TagIcon className="h-5 w-5 text-blue-600" />
          <h4 className="font-medium text-gray-900">Topics</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableMetadata.topics.map((topic) => {
            const isSelected = selectedFilters.topics.includes(topic);
            return (
              <button
                key={topic}
                type="button"
                onClick={() => {
                  setSelectedFilters({
                    ...selectedFilters,
                    topics: isSelected
                      ? selectedFilters.topics.filter(t => t !== topic)
                      : [...selectedFilters.topics, topic]
                  });
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isSelected
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`}
              >
                {topic}
              </button>
            );
          })}
        </div>
      </div>

      {/* Files Filter */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <DocumentIcon className="h-5 w-5 text-blue-600" />
          <h4 className="font-medium text-gray-900">Files</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableMetadata.filenames.map((filename) => {
            const isSelected = selectedFilters.filenames.includes(filename);
            return (
              <button
                key={filename}
                type="button"
                onClick={() => {
                  setSelectedFilters({
                    ...selectedFilters,
                    filenames: isSelected
                      ? selectedFilters.filenames.filter(f => f !== filename)
                      : [...selectedFilters.filenames, filename]
                  });
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isSelected
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`}
              >
                {filename}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
} 