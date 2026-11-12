import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { StudentFacade } from "../state/student.facade";

@Component({
  standalone: true,
  selector: "student-detalle-maestro",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: "./detalle-maestro.html",
  styles: [":host { display: contents; }"],
})
export class DetalleMaestroView {
  readonly zodiacIcons: Readonly<Record<string, string>> = {
    Aries: "♈",
    Tauro: "♉",
    Géminis: "♊",
    Cáncer: "♋",
    Leo: "♌",
    Virgo: "♍",
    Libra: "♎",
    Escorpio: "♏",
    Sagitario: "♐",
    Capricornio: "♑",
    Acuario: "♒",
    Piscis: "♓",
  };

  readonly state = inject(StudentFacade);
  protected readonly activityNavigationState = { fromTeacher: true };
  protected readonly teacherActivityGroups = computed(() => {
    const teacher = this.state.selectedMaestro;
    if (!teacher) return [];
    const month = this.state.currentActivityMonth();
    const courses = this.state.activeCourses().filter(activity => activity.instructor === teacher.nombre);
    const monthly = this.state.currentMonthActivities().filter(activity => activity.instructor === teacher.nombre);
    return [
      {
        path: "actividades-mes",
        heading: `Sus actividades de ${month.label} ${month.year}`,
        activities: monthly,
      },
      {
        path: "cursos-actuales",
        heading: "Cursos en curso",
        activities: courses,
      },
    ].filter(group => group.path === "actividades-mes" || group.activities.length > 0);
  });
}
