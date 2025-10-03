import { useEffect, useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { useCategories } from '../context/CategoryContext';
import { Link } from 'react-router-dom';
import './CatalogPage.css';

export default function CatalogPage() {
  const { products, fetchProducts } = useProducts();
  const { categories, fetchCategories } = useCategories();

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const productsPerPage = 12;

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchProducts(), fetchCategories()]);
        if (isMounted) setLoading(false);
      } catch (error) {
        console.error('Error cargando catálogo:', error);
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [fetchProducts, fetchCategories]);

  // Filtrar productos por categoría seleccionada
  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.categories?.includes(selectedCategory));

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

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

  // Generar números de página visibles
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5; // Número máximo de botones visibles

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Ajustar el inicio si hay pocas páginas al final
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="catalog-container text-center">
        <h2 className="loading-text">Cargando productos...</h2>
      </div>
    );
  }

  return (
    <>
      {/* Contenedor del encabezado degradado con las curvas */}
      <div className="contact-header-bg py-12 sm:py-20 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
          CATÁLOGO DE PRODUCTOS
        </h1>
      </div>

      <div className="catalog-container">
        {/* Filtros dinámicos */}
        <div className="catalog-filters">
          <button
            className={`filter-button ${
              selectedCategory === 'all' ? 'active' : ''
            }`}
            onClick={() => {
              setSelectedCategory('all');
              setCurrentPage(1);
            }}
          >
            Todas
          </button>

          {categories.map((cat) => (
            <button
              key={cat._id}
              className={`filter-button ${
                selectedCategory === cat.name ? 'active' : ''
              }`}
              onClick={() => {
                setSelectedCategory(cat.name);
                setCurrentPage(1);
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Grid de productos */}
        {currentProducts.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">🛍️</span>
            <p className="empty-state-text">
              No hay productos en esta categoría.
            </p>
          </div>
        ) : (
          <div className="products-grid">
            {currentProducts.map((p) => (
              <div key={p._id} className="product-card">
                <div className="product-image-wrapper">
                  <img src={p.image} alt={p.name} className="product-image" />
                </div>
                <h2 className="product-name">{p.name}</h2>
                <p className="product-price">${p.price}</p>
                <Link to={`/producto/${p._id}`} className="product-link">
                  Ver detalle
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="pagination-container">
            {/* 1. Información de la página */}
            <div className="pagination-info">
              Página {currentPage} de {totalPages} • {filteredProducts.length}{' '}
              productos
            </div>

            {/* 2. Controles (Botones) */}
            <div className="pagination-controls">
              {/* Botón Anterior */}
              <button
                className="pagination-button"
                onClick={goToPrevPage}
                disabled={currentPage === 1}
              >
                ← Anterior
              </button>

              {/* Números de página */}
              <div className="pagination-numbers">
                {/* ... Lógica de getPageNumbers() y renderizado de page-number ... */}
                {getPageNumbers().map((pageNumber) => (
                  <button
                    key={pageNumber}
                    className={`page-number ${
                      currentPage === pageNumber ? 'active' : ''
                    }`}
                    onClick={() => goToPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>

              {/* Botón Siguiente */}
              <button
                className="pagination-button"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
