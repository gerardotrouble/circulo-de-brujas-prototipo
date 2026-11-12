import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { StudentFacade } from "../state/student.facade";

@Component({
  standalone: true,
  selector: "student-detalle-actividad",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: "./detalle-actividad.html",
  styles: [":host { display: contents; }"],
})
export class DetalleActividadView {
  readonly state = inject(StudentFacade);
  readonly isMonthlyActivity = computed(
    () => this.state.navigationView() === "actividades-mes",
  );
  readonly returnFromActivity = this.state.returnFromActivity.bind(this.state);
}
