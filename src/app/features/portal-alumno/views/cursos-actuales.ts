import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { StudentFacade } from "../state/student.facade";

@Component({
  standalone: true,
  selector: "student-cursos-actuales",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: "./cursos-actuales.html",
  styles: [":host { display: contents; }"],
})
export class CursosActualesView {
  readonly state = inject(StudentFacade);
  readonly setCurrentPage = this.state.setCurrentPage.bind(this.state);
}
