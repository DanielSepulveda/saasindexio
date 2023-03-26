import { type NextPage } from "next";
import { AppShell, Header, SimpleGrid, Text } from "@mantine/core";

import { api } from "~/utils/api";
import { ProductCard } from "~/components/ProductCard";

const Home: NextPage = () => {
  const { data: productsData } = api.product.list.useQuery();

  const products = productsData || [];

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
            <ProductCard key={product.id} {...product} />
          ))}
        </SimpleGrid>
      </AppShell>
    </>
  );
};

export default Home;
