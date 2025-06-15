"use client"

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

interface TableProps {
  data: any[];
}

const Table = ({ data }: TableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filter, setFilter] = useState('');
  const [materialTypeFilter, setMaterialTypeFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'ascending' | 'descending' } | null>(null);

  // Filtered data
  const filteredData = data
    /**.filter(record => {
      if (record.title === null) return true;
      return record.title.toLowerCase().includes(filter.toLowerCase());
    })*/
    .filter(record => materialTypeFilter ? record.materialtype === materialTypeFilter : true);

  // Sorting logic
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortConfig !== null) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
    }
    return 0;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
        <select
          value={materialTypeFilter}
          onChange={(e) => setMaterialTypeFilter(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm text-gray-700"
        >
          <option value="">All Types</option>
          {Array.from(new Set(data.map(record => record.materialtype))).map(type => (
            <option key={type} value={type} className="capitalize">{type}</option>
          ))}
        </select>

        <div className="flex items-center space-x-2 text-sm">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="p-1.5 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed"
          >
            ←
          </button>
          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="p-1.5 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed"
          >
            →
          </button>
        </div>
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th scope="col" className="w-1/4 px-6 py-3 text-left">
              <button 
                onClick={() => handleSort('materialtype')}
                className="group inline-flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-900"
              >
                <span>Type</span>
                <span className="invisible group-hover:visible text-gray-400">↕</span>
              </button>
            </th>
            <th scope="col" className="w-2/5 px-6 py-3 text-left">
              <button 
                onClick={() => handleSort('createTime')}
                className="group inline-flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-900"
              >
                <span>Created At</span>
                <span className="invisible group-hover:visible text-gray-400">↕</span>
              </button>
            </th>
            <th scope="col" className="w-1/3 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentData.length > 0 ? (
            currentData.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-medium capitalize
                    ${record.materialtype === 'quiz' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-700/10' : 
                      record.materialtype === 'summary' ? 'bg-green-50 text-green-700 ring-1 ring-green-700/10' : 
                      record.materialtype === 'tutorial' ? 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-700/10' : 
                      'bg-gray-50 text-gray-700 ring-1 ring-gray-700/10'}`}
                  >
                    {record.materialtype}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {format(new Date(record.createTime), 'MMM dd, yyyy HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex items-center justify-end space-x-4">
                    <Link 
                      href={`/materials/${record.materialtype}/${record.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Details
                    </Link>
                    {record.materialtype === 'quiz' && (
                      <Link 
                        href={`/materials/quiz/${record.id}/result?quizid=${record.id}`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Results
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;