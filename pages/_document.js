import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <title>Calculadora de Producción de Hierro</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Calculadora de Productos y chatbot para Satisfactory." />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
