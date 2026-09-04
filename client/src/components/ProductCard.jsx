import { Link } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import Button from './Button';

const ProductCard = ({ product, onAdd, adding = false }) => {
  return (
    <article className="product-card">
      <Link to={`/products/${product._id}`} className="product-media">
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.featured && <span className="badge">Featured</span>}
      </Link>
      <div className="product-body">
        <p className="product-category">{product.category?.name || 'General'}</p>
        <h3>
          <Link to={`/products/${product._id}`}>{product.name}</Link>
        </h3>
        <div className="product-meta">
          <strong>${Number(product.price).toFixed(2)}</strong>
          {product.compareAtPrice > product.price && (
            <span className="compare-price">${Number(product.compareAtPrice).toFixed(2)}</span>
          )}
        </div>
        <Button
          size="sm"
          disabled={adding || product.stock < 1}
          onClick={() => onAdd?.(product)}
        >
          <FiShoppingCart /> {product.stock < 1 ? 'Out of stock' : 'Add to cart'}
        </Button>
      </div>
    </article>
  );
};

export default ProductCard;
