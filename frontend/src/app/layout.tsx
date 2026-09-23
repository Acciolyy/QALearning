import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../lib/theme/ThemeContext";

export const metadata: Metadata = {
  title: "QALearning - Bureau de Inspeção Forense",
  description: "Plataforma de ensino prático de QA e engenharia de testes de software",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-mode="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('qalearning-theme');if(m==='light'||m==='dark'){document.documentElement.setAttribute('data-mode',m);}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
