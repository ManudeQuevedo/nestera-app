import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
  Link,
} from "@react-email/components";
import * as React from "react";

interface VerificationEmailProps {
  activationLink?: string;
}

export const VerificationEmail = ({
  activationLink = "https://nestera.app/activate",
}: VerificationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Casi terminamos. Activa tu cuenta de Nestera.</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                emerald: {
                  500: "#10b981",
                  600: "#059669",
                },
                slate: {
                  50: "#f8fafc",
                  100: "#f1f5f9",
                  200: "#e2e8f0",
                  300: "#cbd5e1",
                  400: "#94a3b8",
                  500: "#64748b",
                  600: "#475569",
                  800: "#1e293b",
                  900: "#0f172a",
                },
              },
            },
          },
        }}>
        <Body className="bg-slate-50 font-sans text-slate-900 antialiased">
          {/* Subtle Gradient Background Container */}
          <Container className="mx-auto my-[40px] w-[465px] rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-100 p-[20px]">
            {/* Glass Card */}
            <Section className="rounded-2xl border border-white/50 bg-white/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
              {/* Logo Segment */}
              <Section className="mb-8 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-md">
                  {/* Placeholder Icon */}
                  <div className="h-5 w-5 rounded-sm bg-white/90" />
                </div>
                <Text className="mt-2 text-sm font-semibold tracking-wide text-slate-900">
                  NESTERA
                </Text>
              </Section>

              {/* Content */}
              <Heading className="mb-4 text-center text-2xl font-bold tracking-tight text-slate-800">
                Casi terminamos.
              </Heading>

              <Text className="mb-8 text-center text-base leading-relaxed text-slate-600">
                Solo falta un paso para asegurar tu cuenta y comenzar a poner
                orden en tus finanzas. Haz clic abajo para verificar tu correo.
              </Text>

              {/* Button */}
              <Section className="mb-8 text-center">
                <Button
                  className="rounded-full bg-emerald-500 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-emerald-600"
                  href={activationLink}>
                  ACTIVAR CUENTA
                </Button>
              </Section>

              {/* Divider */}
              <div className="mb-6 h-px w-full bg-slate-100" />

              {/* Small Footer in Card */}
              <Text className="text-center text-xs text-slate-400">
                Si no creaste esta cuenta, puedes ignorar este correo.
              </Text>
            </Section>

            {/* Global Footer */}
            <Section className="mt-8 text-center">
              <Text className="text-xs text-slate-400">
                © 2024 Nestera Technologies. <br />
                Diseñado para tu tranquilidad financiera.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default VerificationEmail;
