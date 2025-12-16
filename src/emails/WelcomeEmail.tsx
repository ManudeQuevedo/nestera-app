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
  Hr,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  dashboardLink?: string;
  userName?: string;
}

export const WelcomeEmail = ({
  dashboardLink = "https://nestera.app/dashboard",
  userName = "Viajero",
}: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Bienvenido a la calma financiera.</Preview>
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
          <Container className="mx-auto my-[40px] w-[465px] rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-100 p-[20px]">
            {/* Glass Card */}
            <Section className="rounded-2xl border border-white/50 bg-white/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
              {/* Logo */}
              <Section className="mb-8 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-md">
                  <div className="h-5 w-5 rounded-sm bg-white/90" />
                </div>
              </Section>

              {/* Header */}
              <Heading className="mb-6 text-center text-2xl font-bold tracking-tight text-slate-800">
                Bienvenido a la calma financiera.
              </Heading>

              {/* Body Copy */}
              <Text className="text-base leading-relaxed text-slate-700">
                Hola {userName},
              </Text>

              <Text className="mb-4 text-base leading-relaxed text-slate-600">
                Gracias por unirte a Nestera. Sabemos que el mundo financiero
                puede sentirse caótico. Estamos aquí para cambiar eso.
              </Text>

              <Text className="mb-8 text-base leading-relaxed text-slate-600">
                Tu cuenta está lista. Es hora de dejar atrás el estrés de la
                quincena y empezar a construir con claridad y tranquilidad.
              </Text>

              {/* Action */}
              <Section className="mb-8 text-center">
                <Button
                  className="rounded-full bg-emerald-500 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-emerald-600"
                  href={dashboardLink}>
                  IR A MI DASHBOARD
                </Button>
              </Section>

              <Hr className="border-slate-100 my-6" />

              {/* Support Note */}
              <Text className="text-center text-sm text-slate-500">
                Estamos en esto juntos. Si tienes dudas, solo responde a este
                correo.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="mt-8 text-center">
              <Text className="text-xs text-slate-400 mb-2">
                Nestera inc. <br />
                San Pedro Garza García, NL, México.
              </Text>
              <Link href="#" className="text-xs text-slate-400 underline">
                Darse de baja
              </Link>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;
