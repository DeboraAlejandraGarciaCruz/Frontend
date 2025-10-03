import { useParams, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { useMetrics } from '../context/MetricsContext';
import { Package, Tag } from 'lucide-react';

function ProductDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { products, fetchProducts } = useProducts();
  const { trackProductView, productViews } = useMetrics();

  const [loading, setLoading] = useState(true);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (products.length === 0) {
        await fetchProducts();
      }

      if (isMounted) {
        setLoading(false);
        const foundProduct = products.find((p) => p._id === id);
        setCurrentProduct(foundProduct);

        if (!foundProduct && !hasLoaded && products.length > 0) {
          setHasLoaded(true);
          window.location.reload();
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
      setCurrentProduct(null);
    };
  }, [id, products, fetchProducts, hasLoaded]);

  useEffect(() => {
    if (currentProduct) {
      trackProductView(currentProduct._id);
    }
  }, [currentProduct, trackProductView]);

  useEffect(() => {
    if (!hasLoaded) {
      setHasLoaded(true);
    }
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Cargando producto...
        </h2>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Producto no encontrado
          </h2>
          <button
            onClick={() => (window.location.href = '/catalogo')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Volver al Catálogo
          </button>
        </div>
      </div>
    );
  }

  const views = productViews[currentProduct._id] || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          <div>
            <img
              src={`${currentProduct.image}?${Date.now()}`}
              alt={currentProduct.name}
              className="w-full h-96 object-cover rounded-lg"
              key={`${currentProduct._id}-${Date.now()}`}
              onError={(e) => {
                e.target.src = currentProduct.image;
              }}
            />
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {currentProduct.categories
                    ?.map((cat) => cat.name)
                    .join(', ') || 'Sin categoría'}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {currentProduct.name}
              </h1>
              <p className="text-gray-600">{currentProduct.description}</p>

              <p className="mt-4">
                <strong>Colores:</strong>{' '}
                {currentProduct.colors?.map((c) => c.name).join(', ') ||
                  'No especificados'}
              </p>
              <p>
                <strong>Categorías:</strong>{' '}
                {currentProduct.categories?.map((cat) => cat.name).join(', ') ||
                  'No especificadas'}
              </p>
            </div>

            <div className="border-t pt-6">
              <div className="text-4xl font-bold text-blue-600 mb-4">
                ${currentProduct.price}
              </div>

              <div className="space-y-3 mb-6">
                
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">
                    Visto: <strong>{views} veces</strong>
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  to={{
                    pathname: '/contacto',
                    state: { productName: currentProduct.name },
                  }}
                  className="block w-full bg-pink-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Consultar Disponibilidad
                </Link>
                <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                  Añadir a Favoritos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Productos relacionados */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Productos Relacionados
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products
            .filter(
              (p) =>
                p.categories?.some((cat) =>
                  currentProduct.categories?.map((c) => c._id).includes(cat._id)
                ) && p._id !== currentProduct._id
            )
            .slice(0, 4)
            .map((relatedProduct) => (
              <div
                key={relatedProduct._id}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <img
                  src={`${relatedProduct.image}?${Date.now()}`}
                  alt={relatedProduct.name}
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    e.target.src = relatedProduct.image;
                  }}
                />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    {relatedProduct.name}
                  </h3>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-600">
                      ${relatedProduct.price}
                    </span>
                    <Link
                      to={`/producto/${relatedProduct._id}`}
                      onClick={(e) => {
                        if (location.pathname.includes('/producto/')) {
                          e.preventDefault();
                          setTimeout(() => {
                            window.location.href = `/producto/${relatedProduct._id}`;
                          }, 50);
                        }
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Ver
                    </Link>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;

//COORDINADO ROSA, BOXER FEMENINO HOJAS TROPICALES, TOP ROSA PUFF DE TIRANTES CRUZADOS
//COORDINADO ROSA HOJAS TROPICALES BOXER FEMENINO TOP 
