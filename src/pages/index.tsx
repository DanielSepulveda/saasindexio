import * as React from "react";
import { type NextPage } from "next";
import {
  ActionIcon,
  AppShell,
  Header,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { type Product } from "@prisma/client";
import { IconX } from "@tabler/icons-react";
import { debounce } from "lodash-es";

import { api } from "~/utils/api";
import { ProductCard } from "~/components/ProductCard";
import { MS_TIME_SCALE } from "~/constants";

const Home: NextPage = () => {
  const [clickedProduct, setClickedProduct] = React.useState<Product | null>(
    null,
  );

  const handleClickProduct = React.useCallback((product: Product) => {
    setClickedProduct(product);
  }, []);

  const handleCloseProductModal = React.useCallback(() => {
    setClickedProduct(null);
  }, []);

  const [searchQuery, setSearchQuery] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const debouncedSearchChange = React.useMemo(
    () => debounce(handleSearchChange, 500),
    [],
  );

  const handleClearSearch = React.useCallback(() => {
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
      setSearchQuery("");
    }
  }, []);

  const { data: productsData } = api.product.list.useQuery(
    {
      search: searchQuery,
    },
    {
      staleTime: 5 * MS_TIME_SCALE.m,
    },
  );

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
        <Stack>
          <TextInput
            ref={searchInputRef}
            placeholder="Search product"
            variant="filled"
            size="xl"
            // value={searchQuery}
            onChange={debouncedSearchChange}
            rightSection={
              <ActionIcon variant="transparent" onClick={handleClearSearch}>
                <IconX />
              </ActionIcon>
            }
          />
          <SimpleGrid
            cols={1}
            breakpoints={[
              { minWidth: "sm", cols: 2 },
              { minWidth: "lg", cols: 3 },
            ]}
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={handleClickProduct}
              />
            ))}
          </SimpleGrid>
        </Stack>
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
