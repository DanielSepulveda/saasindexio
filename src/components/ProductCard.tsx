import {
  ActionIcon,
  Anchor,
  Card,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { type Product } from "@prisma/client";
import { IconExternalLink } from "@tabler/icons-react";

type ProductCardProps = Product;

export function ProductCard(props: ProductCardProps) {
  const { name, shortDesc, url } = props;

  return (
    <Card withBorder>
      <Stack>
        <Group position="apart">
          <Title order={3}>{name}</Title>
          <Anchor href={url} target="_blank">
            <ActionIcon>
              <IconExternalLink />
            </ActionIcon>
          </Anchor>
        </Group>
        <Text color="dimmed">{shortDesc}</Text>
      </Stack>
    </Card>
  );
}
