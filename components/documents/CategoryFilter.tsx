
import React from 'react';
import { useDocumentStore } from '../../stores/documentStore';

const CategoryFilter: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory } = useDocumentStore();

  return (
    <div>
      <label htmlFor="doc-category-filter" className="sr-only">Filtra per categoria</label>
      <select
        id="doc-category-filter"
        value={selectedCategory}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
        className="w-full md:w-48 p-2 bg-white/95 dark:bg-gray-700/80 border border-gray-400 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 backdrop-blur-sm"
      >
        <option value="all">Tutte le Categorie</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.name}>{cat.name}</option>
        ))}
      </select>
    </div>
  );
};

export default CategoryFilter;
