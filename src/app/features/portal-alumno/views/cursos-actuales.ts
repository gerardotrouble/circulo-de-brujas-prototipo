import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { StudentFacade } from "../state/student.facade";

@Component({
  standalone: true,
  selector: "student-cursos-actuales",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: "./cursos-actuales.html",
  styles: [":host { display: contents; }"],
})
export class CursosActualesView {
  readonly state = inject(StudentFacade);
  readonly openActivity = this.state.openActivity.bind(this.state);
  readonly setCurrentPage = this.state.setCurrentPage.bind(this.state);
  readonly handleMaestroClick = this.state.handleMaestroClick.bind(this.state);
}
