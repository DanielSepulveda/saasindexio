import * as React from "react";
import { type NextPage } from "next";
import { AppShell, Header, Modal, SimpleGrid, Text } from "@mantine/core";
import { type Product } from "@prisma/client";

import { api } from "~/utils/api";
import { ProductCard } from "~/components/ProductCard";
import { MS_TIME_SCALE } from "~/constants";

const Home: NextPage = () => {
  const [clickedProduct, setClickedProduct] = React.useState<Product | null>(
    null,
  );

  const { data: productsData } = api.product.list.useQuery(undefined, {
    staleTime: 5 * MS_TIME_SCALE.m,
  });

  const handleClickProduct = React.useCallback((product: Product) => {
    setClickedProduct(product);
  }, []);

  const handleCloseProductModal = React.useCallback(() => {
    setClickedProduct(null);
  }, []);

  const products = productsData || [];
  const isProductModalOpen = clickedProduct != null;

  return (
    <>
      <AppShell
        header={
          <Header height={60} p="xs">
            <Text size="xl" weight="bold">
              SaasIndex
            </Text>
          </Header>
        }
      >
        <SimpleGrid cols={2}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={handleClickProduct}
            />
          ))}
        </SimpleGrid>
      </AppShell>

      <Modal
        opened={isProductModalOpen}
        onClose={handleCloseProductModal}
        title={clickedProduct?.name}
        size="lg"
      ></Modal>
    </>
  );
};

export default Home;
