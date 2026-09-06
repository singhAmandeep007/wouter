import { useMemo } from "react";
import { Link, Route, Switch } from "wouter";
import { useCategories } from "@/resources/category";
import { useProduct, useProducts } from "@/resources/product";
import { ActiveLink } from "../../shared/routing/ActiveLink";
import "./catalog.css";

function CatalogHome() {
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts();

  return (
    <section
      className="module-card"
      data-testid="catalog-home-page"
    >
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
  // `select` derives the filtered list from the cached products query — the underlying
  // fetch is shared/deduped with CatalogHome, and the filter re-runs without refetching.
  const { data: products = [] } = useProducts({
    select: (all) => all.filter((item) => item.categoryId === categoryId),
  });

  return (
    <section
      className="module-card"
      data-testid="catalog-category-page"
    >
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
  // No race condition: TanStack Query keys the request by productId and discards stale
  // responses, so fast navigation between products can't show the wrong one.
  const { data: product, error, isPending } = useProduct(productId);

  if (error) {
    return <p>Failed to load product: {error.message}</p>;
  }

  if (isPending) {
    return <p>Loading product...</p>;
  }

  return (
    <section
      className="module-card"
      data-testid="catalog-product-page"
    >
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
    <section
      className="module-card"
      data-testid="catalog-not-found"
    >
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
    <section data-testid="catalog-module">
      <h2>Catalog Module Routes</h2>
      <ul className="module-links">
        {routeHints.map((path) => (
          <li key={path}>
            <ActiveLink
              exact
              href={path}
              testId={`catalog-hint-${path.replaceAll("/", "-").replace(/^-+/, "")}`}
            >
              {path}
            </ActiveLink>
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
