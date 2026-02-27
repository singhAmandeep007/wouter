import { useEffect, useMemo, useState } from "react";
import { Link, Route, Switch } from "wouter";
import { api } from "../../shared/api/client";
import type { Category, Product } from "../../shared/api/types";
import "./catalog.css";

function CatalogHome() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    void api.getCategories().then(setCategories);
    void api.getProducts().then(setProducts);
  }, []);

  return (
    <section className="module-card">
      <h2>Catalog Home</h2>
      <p>This is the default route for the catalog module.</p>

      <h3>Categories</h3>
      <ul className="module-links">
        {categories.map((category) => (
          <li key={category.id}>
            <Link href={`/catalog/category/${category.id}`}>{category.title}</Link>
          </li>
        ))}
      </ul>

      <h3>Featured products</h3>
      <ul>
        {products.slice(0, 3).map((product) => (
          <li key={product.id}>
            <Link href={`/catalog/product/${product.id}`}>{product.title}</Link> - ${product.price}
          </li>
        ))}
      </ul>
    </section>
  );
}

function CategoryProducts({ categoryId }: { categoryId: string }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    void api.getProducts().then((all) => setProducts(all.filter((item) => item.categoryId === categoryId)));
  }, [categoryId]);

  return (
    <section className="module-card">
      <h2>Category: {categoryId}</h2>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <Link href={`/catalog/product/${product.id}`}>{product.title}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProductDetails({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getProductById(productId)
      .then(setProduct)
      .catch((err: Error) => setError(err.message));
  }, [productId]);

  if (error) {
    return <p>Failed to load product: {error}</p>;
  }

  if (!product) {
    return <p>Loading product...</p>;
  }

  return (
    <section className="module-card">
      <h2>{product.title}</h2>
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
      <p>Stock: {product.stock}</p>
      <p>
        <Link href={`/catalog/category/${product.categoryId}`}>Back to category</Link>
      </p>
    </section>
  );
}

function CatalogNotFound() {
  return (
    <section className="module-card">
      <h2>Catalog route not found</h2>
      <p>
        Go to <Link href="/catalog">catalog default route</Link>.
      </p>
    </section>
  );
}

function CatalogModule() {
  const routeHints = useMemo(
    () => ["/catalog", "/catalog/category/phones", "/catalog/product/p-100", "/catalog/unknown-path"],
    []
  );

  return (
    <section>
      <h2>Catalog Module Routes</h2>
      <ul>
        {routeHints.map((path) => (
          <li key={path}>
            <Link href={path}>{path}</Link>
          </li>
        ))}
      </ul>

      <Switch>
        <Route path="/catalog">
          <CatalogHome />
        </Route>
        <Route path="/catalog/category/:categoryId">
          {(params) => <CategoryProducts categoryId={params.categoryId} />}
        </Route>
        <Route path="/catalog/product/:productId">{(params) => <ProductDetails productId={params.productId} />}</Route>
        <Route>
          <CatalogNotFound />
        </Route>
      </Switch>
    </section>
  );
}

export default CatalogModule;
