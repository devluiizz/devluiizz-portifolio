"use client";

import NextError from "next/error";

export default function NotFound() {
  return (
    <html lang="pt-BR">
      <body>
        <NextError statusCode={404} />
      </body>
    </html>
  );
}
