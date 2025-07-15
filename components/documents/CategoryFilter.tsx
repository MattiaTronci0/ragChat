
import React from 'react';
import { useDocumentStore } from '../../stores/documentStore';

const CategoryFilter: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory } = useDocumentStore();

  return (
    <div>
      <label htmlFor="doc-category-filter" className="sr-only">Filter by category</label>
      <select
        id="doc-category-filter"
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="w-full md:w-48 p-2 bg-white/80 dark:bg-slate-700/80 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 backdrop-blur-sm"
      >
        <option value="all">All Categories</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.name}>{cat.name}</option>
        ))}
      </select>
    </div>
  );
};

export default CategoryFilter;
