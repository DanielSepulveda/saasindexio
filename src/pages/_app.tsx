import { type AppType } from "next/app";
import Head from "next/head";
import { MantineProvider } from "@mantine/core";

import { api } from "~/utils/api";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>SaasIndex</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          colorScheme: "dark",
        }}
      >
        <Component {...pageProps} />
      </MantineProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
