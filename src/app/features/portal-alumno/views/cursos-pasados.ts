import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { StudentFacade } from "../state/student.facade";

@Component({
  standalone: true,
  selector: "student-cursos-pasados",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: "./cursos-pasados.html",
  styles: [":host { display: contents; }"],
})
export class CursosPasadosView {
  readonly state = inject(StudentFacade);
  readonly setCurrentPage = this.state.setCurrentPage.bind(this.state);
}
