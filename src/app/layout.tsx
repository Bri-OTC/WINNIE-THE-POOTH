//layout.tsx ( next)
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Menu from "@/components/layout/menu";
import { ThemeProvider } from "next-themes";
import PrivyProviderWrapper from "./privy-provider";
import Information from "@/components/layout/information";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "PIO",
  description: `PIO testnet is a derivative trading platform`,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-poppins antialiased",
          poppins.variable
        )}
      >
        {" "}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <PrivyProviderWrapper>
            <div className="bg-black">
              <div className="flex flex-col h-[100vh] bg-background">
                <div className="h-full flex flex-col">
                  <div className="h-full max-h-[90vh] overflow-y-auto">
                    <div className="max-w-[1024px] mx-auto">{children}</div>
                  </div>
                  <Menu />
                </div>
              </div>
            </div>
            <ToastContainer
              autoClose={2000}
              toastStyle={{ background: "black", color: "white" }}
              progressStyle={{ background: "var(--orange-color)" }}
              closeOnClick={true}
              pauseOnHover={true}
              draggable={true}
            />
          </PrivyProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
