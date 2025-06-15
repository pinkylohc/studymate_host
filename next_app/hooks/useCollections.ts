import { useState, useEffect } from 'react';
import axios from 'axios';

export interface Collection {
  id: string;
  name: string;
  description: string;
}

export interface MetadataFilters {
  course_codes: string[];
  topics: string[];
  filenames: string[];
}

export interface CollectionMetadata {
  course_codes: string[];
  topics: string[];
  filenames: string[];
}

export function useCollections(userEmail?: string | null) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [metadata, setMetadata] = useState<Record<string, CollectionMetadata>>({});
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<MetadataFilters>({
    course_codes: [],
    topics: [],
    filenames: []
  });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchCollectionsAndMetadata = async () => {
      try {
        let collections = [];
        const metadataMap: Record<string, CollectionMetadata> = {};

        // Add user collection if logged in
        if (userEmail) {
          const userCollectionId = `user_${userEmail.replace('@', '_').replace('.', '_')}`;
          collections.push({
            id: userCollectionId,
            name: "My Personal Library",
            description: "Your uploaded study materials"
          });
          
          // Fetch user collection metadata
          const userMetadata = await axios.get(`http://localhost:8000/documents/${userCollectionId}/metadata`);
          metadataMap[userCollectionId] = userMetadata.data;
        }

        // Add public collection
        collections.push({
          id: 'default',
          name: "Public Library",
          description: "Shared study materials and resources"
        });
        
        // Fetch public collection metadata
        const publicMetadata = await axios.get('http://localhost:8000/documents/default/metadata');
        metadataMap['default'] = publicMetadata.data;

        setCollections(collections);
        setMetadata(metadataMap);
      } catch (err) {
        console.error('Error fetching libraries:', err);
        setError('Failed to load libraries');
      }
    };

    fetchCollectionsAndMetadata();
  }, [userEmail]);

  const getAvailableMetadata = () => {
    const availableMetadata: CollectionMetadata = {
      course_codes: [],
      topics: [],
      filenames: []
    };

    selectedCollections.forEach(collectionId => {
      const collMeta = metadata[collectionId];
      if (collMeta) {
        availableMetadata.course_codes = Array.from(
          new Set([...availableMetadata.course_codes, ...collMeta.course_codes])
        );
        availableMetadata.topics = Array.from(
          new Set([...availableMetadata.topics, ...collMeta.topics])
        );
        availableMetadata.filenames = Array.from(
          new Set([...availableMetadata.filenames, ...collMeta.filenames])
        );
      }
    });

    return availableMetadata;
  };

  return {
    collections,
    metadata,
    selectedCollections,
    setSelectedCollections,
    selectedFilters,
    setSelectedFilters,
    getAvailableMetadata,
    error
  };
} 