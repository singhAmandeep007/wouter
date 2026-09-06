import { useMemo } from "react";
import { Link, Route, Switch } from "wouter";
import { useCategories } from "@/resources/category";
import { useProduct, useProducts } from "@/resources/product";
import { Card, ModuleNav, PageMessage, type ModuleNavItem } from "@/shared/ui";

function CatalogHome() {
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts();

  const categoryItems: ModuleNavItem[] = categories.map((category) => ({
    href: `/catalog/category/${category.id}`,
    label: category.title,
  }));

  return (
    <Card testId="catalog-home-page">
      <h2>Catalog Home</h2>
      <p>This is the default route for the catalog module.</p>

      <h3>Categories</h3>
      <ModuleNav items={categoryItems} />

      <h3>Featured products</h3>
      <ul>
        {products.slice(0, 3).map((product) => (
          <li key={product.id}>
            <Link href={`/catalog/product/${product.id}`}>{product.title}</Link> - ${product.price}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function CategoryProducts({ categoryId }: { categoryId: string }) {
  // `select` derives the filtered list from the cached products query — the underlying
  // fetch is shared/deduped with CatalogHome, and the filter re-runs without refetching.
  const { data: products = [] } = useProducts({
    select: (all) => all.filter((item) => item.categoryId === categoryId),
  });

  return (
    <Card testId="catalog-category-page">
      <h2>Category: {categoryId}</h2>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <Link href={`/catalog/product/${product.id}`}>{product.title}</Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function ProductDetails({ productId }: { productId: string }) {
  // No race condition: TanStack Query keys the request by productId and discards stale
  // responses, so fast navigation between products can't show the wrong one.
  const { data: product, error, isPending } = useProduct(productId);

  if (error) {
    return (
      <PageMessage
        tone="error"
        testId="catalog-product-error"
      >
        Failed to load product: {error.message}
      </PageMessage>
    );
  }

  if (isPending) {
    return <PageMessage testId="catalog-product-loading">Loading product...</PageMessage>;
  }

  return (
    <Card testId="catalog-product-page">
      <h2>{product.title}</h2>
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
      <p>Stock: {product.stock}</p>
      <p>
        <Link href={`/catalog/category/${product.categoryId}`}>Back to category</Link>
      </p>
    </Card>
  );
}

function CatalogNotFound() {
  return (
    <Card testId="catalog-not-found">
      <h2>Catalog route not found</h2>
      <p>
        Go to <Link href="/catalog">catalog default route</Link>.
      </p>
    </Card>
  );
}

function CatalogModule() {
  const routeHints: ModuleNavItem[] = useMemo(
    () =>
      ["/catalog", "/catalog/category/phones", "/catalog/product/p-100", "/catalog/unknown-path"].map((path) => ({
        href: path,
        label: path,
        exact: true,
        testId: `catalog-hint-${path.replaceAll("/", "-").replace(/^-+/, "")}`,
      })),
    []
  );

  return (
    <section data-testid="catalog-module">
      <h2>Catalog Module Routes</h2>
      <ModuleNav items={routeHints} />

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
