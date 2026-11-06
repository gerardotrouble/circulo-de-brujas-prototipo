import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { StudentFacade } from "../state/student.facade";

@Component({
  standalone: true,
  selector: "student-actividades-mes",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: "./actividades-mes.html",
  styles: [":host { display: contents; }"],
})
export class ActividadesMesView {
  readonly state = inject(StudentFacade);
  readonly openActivity = this.state.openActivity.bind(this.state);
  readonly setActivityViewMode = this.state.setActivityViewMode.bind(
    this.state,
  );
  readonly setActivityCurrentPage = this.state.setActivityCurrentPage.bind(
    this.state,
  );
  readonly handleMaestroClick = this.state.handleMaestroClick.bind(this.state);
  readonly activitiesOnDay = this.state.activitiesOnDay.bind(this.state);
}
