import React from 'react';
import { HiOutlineCheck } from 'react-icons/hi';

interface Collection {
  id: string;
  name: string;
  description: string;
}

interface MetadataFilters {
  course_codes: string[];
  topics: string[];
  filenames: string[];
}

interface CollectionMetadata {
  course_codes: string[];
  topics: string[];
  filenames: string[];
}

interface ReferenceLibrarySelectorProps {
  availableCollections: Collection[];
  selectedCollections: string[];
  setSelectedCollections: (collections: string[]) => void;
  collectionMetadata: Record<string, CollectionMetadata>;
  setSelectedFilters: (filters: MetadataFilters) => void;
  selectedFilters: MetadataFilters;
}

export default function ReferenceLibrarySelector({
  availableCollections,
  selectedCollections,
  setSelectedCollections,
  collectionMetadata,
  setSelectedFilters,
  selectedFilters
}: ReferenceLibrarySelectorProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Select libraries to include in your generation. Leave unselected to use only your input.
      </p>
      <div className="grid grid-cols-1 gap-3">
        {availableCollections.map((collection) => {
          const isSelected = selectedCollections.includes(collection.id);
          return (
            <div 
              key={collection.id}
              className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50/50 shadow-sm' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                }`}
              onClick={() => {
                if (isSelected) {
                  setSelectedCollections(selectedCollections.filter(c => c !== collection.id));
                  // Clear filters when unselecting collection
                  setSelectedFilters({
                    course_codes: selectedFilters.course_codes.filter((code: string) => 
                      collectionMetadata[collection.id]?.course_codes.includes(code)
                    ),
                    topics: selectedFilters.topics.filter((topic: string) => 
                      collectionMetadata[collection.id]?.topics.includes(topic)
                    ),
                    filenames: selectedFilters.filenames.filter((filename: string) => 
                      collectionMetadata[collection.id]?.filenames.includes(filename)
                    )
                  });
                } else {
                  setSelectedCollections([...selectedCollections, collection.id]);
                }
              }}
            >
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-5 h-5 rounded border transition-colors mt-0.5
                  ${isSelected 
                    ? 'bg-blue-500 border-blue-500' 
                    : 'border-gray-300 group-hover:border-gray-400'
                  }`}
                >
                  {isSelected && (
                    <HiOutlineCheck className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h3 className={`font-medium transition-colors
                    ${isSelected ? 'text-blue-900' : 'text-gray-900 group-hover:text-gray-700'}`}
                  >
                    {collection.name}
                  </h3>
                  <p className={`text-sm transition-colors
                    ${isSelected ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-600'}`}
                  >
                    {collection.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 