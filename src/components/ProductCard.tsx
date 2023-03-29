import * as React from "react";
import {
  Anchor,
  Card,
  Group,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { type Product } from "@prisma/client";
import { IconExternalLink } from "@tabler/icons-react";

type ProductCardProps = {
  onClick: (product: Product) => void;
  product: Product;
};

export function ProductCard(props: ProductCardProps) {
  const { product, onClick } = props;
  const { name, shortDesc, url } = product;

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onClick(product);
    },
    [onClick, product],
  );

  return (
    <UnstyledButton onClick={handleClick}>
      <Card withBorder h="100%">
        <Stack>
          <Group position="apart" align="center">
            <Title order={3}>{name}</Title>
            <Anchor
              href={url}
              target="_blank"
              onClick={(e) => {
                e.stopPropagation();
              }}
              sx={(theme) => ({
                display: "inline-flex",
                "&:hover": {
                  color: theme.colors.blue[7],
                },
              })}
            >
              <IconExternalLink />
            </Anchor>
          </Group>
          <Text color="dimmed">{shortDesc}</Text>
        </Stack>
      </Card>
    </UnstyledButton>
  );
}
