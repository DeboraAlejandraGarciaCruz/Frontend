import { useEffect, useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import { useCategories } from '../../context/CategoryContext';
import { useColors } from '../../context/ColorContext';
import { apiFetch } from '../../utils/api';
import CategoryForm from './CategoryForm';
import ColorForm from './ColorForm';
import { FaTag, FaFileImage, FaCheckDouble } from 'react-icons/fa';
import { IoCreate } from 'react-icons/io5';
import {
  MdDescription,
  MdOutlineAttachMoney,
  MdInvertColors,
  MdCategory,
} from 'react-icons/md';
import { GiClothes } from 'react-icons/gi';
import './ProductForm.css';

export default function ProductForm() {
  const { products, fetchProducts } = useProducts();
  const { categories, fetchCategories } = useCategories();
  const { colors, fetchColors } = useColors();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    sizes: [],
    colors: [],
    categories: [],
    image: null,
  });

  const [preview, setPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Estado de paginación - SOLO 4 PRODUCTOS POR PÁGINA
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // Fijo en 4, sin selector

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchColors();
  }, [fetchProducts, fetchCategories, fetchColors]);

  // Cálculos de paginación
  const totalProducts = products.length;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  // Asegurar que siempre haya espacio para 4 productos
  const displayedProducts = [...currentProducts];
  const emptySlots = itemsPerPage - displayedProducts.length;

  for (let i = 0; i < emptySlots; i++) {
    displayedProducts.push(null); // Marcador de espacio vacío
  }

  // Manejo de inputs simples
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Manejo de archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  // Manejo de checkboxes
  const handleCheckboxChange = (type, value) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((item) => item !== value)
        : [...prev[type], value],
    }));
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const form = new FormData();
      form.append('name', formData.name);
      form.append('description', formData.description);
      form.append('price', formData.price);
      form.append('sizes', JSON.stringify(formData.sizes));
      form.append('colors', JSON.stringify(formData.colors));
      form.append('categories', JSON.stringify(formData.categories));

      if (formData.image) {
        form.append('image', formData.image);
      }

      if (editingId) {
        await apiFetch(`/api/products/${editingId}`, {
          method: 'PUT',
          body: form,
        });
      } else {
        await apiFetch('/api/products', {
          method: 'POST',
          body: form,
        });
      }

      // Resetear formulario
      setFormData({
        name: '',
        description: '',
        price: '',
        sizes: [],
        colors: [],
        categories: [],
        image: null,
      });
      setPreview(null);
      setEditingId(null);
      fetchProducts();
      setCurrentPage(1);
    } catch (err) {
      console.error('Error guardando producto:', err);
    }
  };

  // Editar producto
  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      sizes: product.sizes || [],
      colors: product.colors?.map((c) => c._id?.toString()) || [],
      categories: product.categories?.map((cat) => cat._id?.toString()) || [],

      image: null,
    });
    setEditingId(product._id);
    setPreview(product.image || null);
  };

  // Eliminar producto
  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();

      // Ajustar página si es necesario
      if (currentProducts.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      console.error('Error eliminando producto:', err);
    }
  };

  // Navegación de páginas
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Generar números de página
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="product-form-container">
      <div className="product-form-grid">
        {/* Contenedor del Formulario */}
        <div className="form-card">
          <h2 className="form-title">
            <IoCreate style={{ marginRight: '5px', verticalAlign: 'middle', color: '#f38ca4' }} />
            {editingId ? 'Editar Producto' : 'Crear Producto'}
          </h2>

          <form onSubmit={handleSubmit} className="product-form">
            {/* Nombre */}
            <div className="form-group">
              <label className="form-label">
                <FaTag style={{ marginRight: '8px', color: '#f38ca4' }} />
                Nombre del Producto{' '}
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ingresa el nombre del producto"
                className="form-input"
                required
              />
            </div>

            {/* Descripción */}
            <div className="form-group">
              <label className="form-label">
                <MdDescription
                  style={{ marginRight: '5px', color: '#f38ca4' }}
                />
                Descripción
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe el producto..."
                className="form-textarea"
                required
              />
            </div>

            {/* Precio */}
            <div className="form-group">
              <label className="form-label">
                <MdOutlineAttachMoney
                  style={{ marginRight: '5px', color: '#f38ca4' }}
                />
                Precio ($)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                className="form-input"
                required
              />
            </div>

            {/* Tallas */}
            <div className="form-group">
              <label className="form-label">
                <GiClothes style={{ marginRight: '5px', color: '#f38ca4' }} />
                Tallas disponibles
              </label>
              <div className="checkbox-group">
                {['S', 'M', 'G', 'XG'].map((size) => (
                  <label key={size} className="checkbox-item">
                    <input
                      type="checkbox"
                      value={size}
                      checked={formData.sizes.includes(size)}
                      onChange={() => handleCheckboxChange('sizes', size)}
                    />
                    {size}
                  </label>
                ))}
              </div>
            </div>

            {/* Colores */}
            <div className="form-group">
              <label className="form-label">
                <MdInvertColors
                  style={{ marginRight: '5px', color: '#f38ca4' }}
                />
                Colores
              </label>
              <div className="checkbox-group">
                {colors.map((color) => (
                  <label key={color._id} className="checkbox-item">
                    <input
                      type="checkbox"
                      value={color._id}
                      checked={formData.colors.includes(color._id)}
                      onChange={() => handleCheckboxChange('colors', color._id)}
                    />
                    {color.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Categorías */}
            <div className="form-group">
              <label className="form-label">
                <MdCategory style={{ marginRight: '5px', color: '#f38ca4' }} />
                Categorías
              </label>
              <div className="checkbox-group">
                {categories.map((cat) => (
                  <label key={cat._id} className="checkbox-item">
                    <input
                      type="checkbox"
                      value={cat._id}
                      checked={formData.categories.includes(cat._id)}
                      onChange={() =>
                        handleCheckboxChange('categories', cat._id)
                      }
                    />
                    {cat.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Imagen */}
            <div className="form-group">
              <label className="form-label">
                <FaFileImage style={{ marginRight: '5px', color: '#f38ca4' }} />
                Imagen del producto
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="form-input"
                required={!editingId}
              />

              {(preview || (editingId && formData.image)) && (
                <div className="image-preview-container">
                  <p className="form-label">Vista previa:</p>
                  <img
                    src={preview || formData.image}
                    alt="Vista previa"
                    className="image-preview"
                  />
                </div>
              )}
            </div>

            <button type="submit" className="submit-button">
              <IoCreate
                style={{ color: '#ffffff' }}
              />
              {editingId ? ' Actualizar ' : ' Crear Producto '}
            </button>
          </form>
        </div>

        {/* Contenedor de la Lista de Productos IoMdAddCircle */}
        <div className="list-card">
          <h3 className="list-title">
            📦 Productos Existentes
            <span className="products-count">
              {totalProducts} producto{totalProducts !== 1 ? 's' : ''}
            </span>
          </h3>

          <div className="products-list">
            {displayedProducts.map((product, index) =>
              product ? (
                <div key={product._id} className="product-item">
                  <div className="product-content">
                    {/* Imagen a la izquierda */}
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-image-list"
                      />
                    )}

                    {/* Información del producto */}
                    <div className="product-info">
                      <h4 className="product-name">{product.name}</h4>
                      <div className="product-details">
                        <p>
                          <strong>Precio:</strong> ${product.price}
                        </p>
                        <p>
                          <strong>Colores:</strong>{' '}
                          {product.colors.map((c) => c.name).join(', ') ||
                            'N/A'}
                        </p>
                        <p>
                          <strong>Categorías:</strong>{' '}
                          {product.categories
                            .map((cat) => cat.name)
                            .join(', ') || 'N/A'}
                        </p>
                        <p>
                          <strong>Tallas:</strong>{' '}
                          {product.sizes.join(', ') || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="product-actions">
                      <button
                        onClick={() => handleEdit(product)}
                        className="edit-button"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="delete-button"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Espacio vacío para mantener el diseño de 4 productos
                <div
                  key={`empty-${index}`}
                  className="product-item"
                  style={{ opacity: 0, pointerEvents: 'none' }}
                >
                  <div className="product-content">
                    <div
                      className="product-image"
                      style={{ visibility: 'hidden' }}
                    ></div>
                  </div>
                </div>
              )
            )}

            {totalProducts === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">📦</div>
                <div className="empty-state-text">No hay productos</div>
                <div className="empty-state-subtext">
                  Crea tu primer producto usando el formulario
                </div>
              </div>
            )}
          </div>

          {/* PAGINACIÓN FIJA*/}
          {totalProducts > 0 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Página {currentPage} de {totalPages} • {totalProducts} productos
              </div>

              <div className="pagination-controls">
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  ← Anterior
                </button>

                <div className="pagination-numbers">
                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`page-number ${
                        currentPage === page ? 'active' : ''
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="pagination-button"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/*Gestión de Categorías y Colores */}
      <div className="management-forms">
        <CategoryForm />
        <ColorForm />
      </div>
    </div>
  );
}
