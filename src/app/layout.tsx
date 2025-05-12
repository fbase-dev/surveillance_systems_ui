import '@/styles/app.css';
import { ColorSchemeScript, MantineProvider, mantineHtmlProps, mergeMantineTheme, DEFAULT_THEME } from '@mantine/core';
import NextTopLoader from 'nextjs-toploader';
import {theme} from "@/app/theme";

export const metadata = {
  title: 'Fieldbase Surveillance App',
  description: 'Fieldbase remote surveillance web application.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const appTheme = mergeMantineTheme(DEFAULT_THEME, theme);
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="dark" forceColorScheme="dark" />
      </head>
      <body>
        <MantineProvider theme={appTheme} defaultColorScheme="dark" forceColorScheme="dark">
        <NextTopLoader showSpinner={false} color="#14B8FF" />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}