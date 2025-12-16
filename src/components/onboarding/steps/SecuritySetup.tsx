import { Button } from "@/components/ui/button";
import { Shield, ShieldCheck, ArrowRight, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

interface SecuritySetupProps {
  onUpdate: (data: any) => void;
  nextStep?: () => void;
}

export function SecuritySetup({ onUpdate, nextStep }: SecuritySetupProps) {
  const router = useRouter();

  const handleEnable = () => {
    // Redirect to setup MFA page
    // Note: This will exit the wizard. Ideally we'd persist state or open in new tab,
    // but standard flow is to redirect.
    router.push("/setup-mfa");
  };

  const handleSkip = () => {
    // Just proceed
    if (nextStep) nextStep();
  };

  return (
    <div className="flex flex-col items-center text-center space-y-6 animate-in slide-in-from-right fade-in duration-500">
      <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-2 ring-8 ring-emerald-50 dark:ring-emerald-900/10">
        <ShieldCheck className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
          Blindaje de Cuenta
          <span className="ml-2 inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            Recomendado
          </span>
        </h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Tu seguridad es prioridad. Activa la autenticación de dos pasos (2FA)
          para proteger tu patrimonio, o hazlo más tarde en Configuración.
        </p>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700 w-full max-w-md text-left">
        <div className="flex items-start gap-4">
          <ShieldAlert className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white">
              ¿Por qué activar 2FA?
            </h4>
            <p className="text-sm text-slate-500 mt-1">
              Agrega una capa extra de defensa. Incluso si alguien obtiene tu
              contraseña, no podrá acceder a tus finanzas sin tu segundo factor.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm pt-4">
        <Button
          onClick={handleEnable}
          size="lg"
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
          <Shield className="w-4 h-4 mr-2" />
          Activar 2FA Ahora
        </Button>

        <Button
          onClick={handleSkip}
          variant="ghost"
          className="w-full text-slate-500 hover:text-slate-900 dark:hover:text-white">
          Hacerlo más tarde
        </Button>
      </div>
    </div>
  );
}
