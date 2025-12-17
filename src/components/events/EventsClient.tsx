"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  CalendarDays,
  DollarSign,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

// Mock events for demo
interface FinancialEvent {
  id: string;
  name: string;
  date: string;
  estimated_cost: number;
  actual_cost: number | null;
  status: "pending" | "completed" | "cancelled";
  category?: string;
}

const MOCK_EVENTS: FinancialEvent[] = [
  {
    id: "1",
    name: "Cita con el dentista",
    date: "2024-12-20",
    estimated_cost: 2500,
    actual_cost: null,
    status: "pending",
    category: "Salud",
  },
  {
    id: "2",
    name: "Inscripción escolar",
    date: "2024-01-15",
    estimated_cost: 15000,
    actual_cost: null,
    status: "pending",
    category: "Educación",
  },
];

export default function EventsClient() {
  const [events, setEvents] = useState<FinancialEvent[]>(MOCK_EVENTS);
  const [newEventOpen, setNewEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: "",
    date: "",
    estimated_cost: 0,
  });

  const handleAddEvent = () => {
    if (!newEvent.name || !newEvent.date) return;

    setEvents([
      ...events,
      {
        id: Date.now().toString(),
        name: newEvent.name,
        date: newEvent.date,
        estimated_cost: newEvent.estimated_cost,
        actual_cost: null,
        status: "pending",
      },
    ]);
    setNewEvent({ name: "", date: "", estimated_cost: 0 });
    setNewEventOpen(false);
  };

  const totalPendingCost = events
    .filter((e) => e.status === "pending")
    .reduce((acc, e) => acc + e.estimated_cost, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Eventos Financieros
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Planifica gastos futuros y mantén tu presupuesto bajo control
          </p>
        </div>

        <Dialog open={newEventOpen} onOpenChange={setNewEventOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Evento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Evento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Nombre del evento</Label>
                <Input
                  value={newEvent.name}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, name: e.target.value })
                  }
                  placeholder="Ej: Cita médica"
                />
              </div>
              <div>
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, date: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Costo estimado</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="number"
                    value={newEvent.estimated_cost}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        estimated_cost: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="pl-9"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <Button onClick={handleAddEvent} className="w-full">
                Agregar Evento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cost Summary */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-amber-600 font-medium">
              Gastos Pendientes
            </p>
            <p className="text-2xl font-bold text-amber-800">
              ${totalPendingCost.toLocaleString("es-MX")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <div className="space-y-4">
        {events.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {event.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {new Date(event.date).toLocaleDateString("es-MX", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-slate-900">
                      ${event.estimated_cost.toLocaleString("es-MX")}
                    </p>
                    {event.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {event.category}
                      </span>
                    )}
                  </div>
                  {event.status === "pending" ? (
                    <Button variant="outline" size="sm">
                      Marcar Pagado
                    </Button>
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {events.length === 0 && (
          <Card className="p-8 text-center">
            <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No tienes eventos programados.</p>
            <p className="text-slate-400 text-sm">
              Agrega citas, pagos programados o cualquier gasto futuro.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
