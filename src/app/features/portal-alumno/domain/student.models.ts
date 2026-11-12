export interface Activity {
  id: number;
  title: string;
  type: string;
  instructor: string;
  gradient: string;
  icon: string;
  cover?: string;
  posterListing?: boolean;
  sessionLabel?: string;
  venue?: string;
  additionalTypes?: string[];
  walkIn?: boolean;
  duration?: string;
  status?: string;
  schedule?: string;
  mode?: string;
  badge?: string;
  badgeColor?: string;
  statusType?: string;
  dateRange?: string;
  day?: string;
  month?: string;
  time?: string;
  scheduledFor?: string;
  addedOn?: string;
  topics?: string[];
  level?: string;
  openFirstClass?: boolean;
  description?: string;
  cost?: string;
}

export interface Teacher {
  id: number;
  nombre: string;
  rol: string;
  especialidades: string[];
  senderos?: string[];
  descripcion: string;
  cumpleanos?: string;
  signo?: string;
  redes?: string[];
  antiguedad?: string;
  perfilFicticio?: boolean;
  foto: string;
}

export interface MonthlyActivity extends Activity {
  day: string;
  month: string;
  agendaMonth?: string; // YYYY-MM para actividades sin una fecha concreta.
  publicationStatus?: "draft" | "published";
}

export interface StudentData {
  current: Activity[];
  past: Activity[];
  monthly: MonthlyActivity[];
  pending: PendingPayment[];
  payments: Payment[];
  teachers: Teacher[];
}

export interface PendingPayment {
  id: number;
  course: string;
  type: string;
  amount: string;
  dueDate: string;
  dueOn?: string; // Fecha límite en formato YYYY-MM-DD.
  status: string;
  monthsOwed: number;
  color: string;
  bg: string;
  border: string;
  icon: string;
}
export interface Payment {
  id: number;
  date: string;
  concept: string;
  method: string;
  methodType: string;
  amount: string;
  status: string;
}
