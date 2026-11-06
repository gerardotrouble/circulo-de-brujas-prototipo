import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from "@angular/core";
import { StudentFacade } from "../state/student.facade";

@Component({
  standalone: true,
  selector: "student-detalle-actividad",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: "./detalle-actividad.html",
  styles: [":host { display: contents; }"],
})
export class DetalleActividadView {
  readonly state = inject(StudentFacade);
  readonly isMonthlyActivity = computed(() => {
    const activity = this.state.selectedActivity;
    return this.state.monthlyActivitiesData.some((item) => item === activity);
  });
  readonly handleMaestroClick = this.state.handleMaestroClick.bind(this.state);
  readonly returnFromActivity = this.state.returnFromActivity.bind(this.state);
}
