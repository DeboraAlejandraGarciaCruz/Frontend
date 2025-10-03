import { createContext, useContext, useState, useCallback } from 'react';
import { apiFetch } from '../utils/api';

const CategoryContext = createContext();
export const useCategories = () => useContext(CategoryContext);

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Obtener categorías
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/categories');
      setCategories(data);
    } catch (err) {
      console.error('Error cargando categorías:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear categoría
  const addCategory = async (newCat) => {
    const data = await apiFetch('/api/categories', {
      method: 'POST',
      body: newCat, // 👈 ya no stringify
    });
    setCategories((prev) => [...prev, data]);
  };

  // Editar categoría
  const updateCategory = async (id, updated) => {
    const data = await apiFetch(`/api/categories/${id}`, {
      method: 'PUT',
      body: updated, // 👈 igual aquí
    });
    setCategories((prev) => prev.map((c) => (c._id === id ? data : c)));
  };

  // Eliminar categoría
  const deleteCategory = async (id) => {
    await apiFetch(`/api/categories/${id}`, { method: 'DELETE' });
    setCategories((prev) => prev.filter((c) => c._id !== id));
  };

  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        fetchCategories,
        addCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};
