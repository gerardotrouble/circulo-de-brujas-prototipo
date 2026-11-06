import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { StudentFacade } from "../state/student.facade";

@Component({
  standalone: true,
  selector: "student-maestros",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: "./maestros.html",
  styles: [":host { display: contents; }"],
})
export class MaestrosView {
  readonly state = inject(StudentFacade);
  readonly openMaestro = this.state.openMaestro.bind(this.state);
  readonly setMaestrosCurrentPage = this.state.setMaestrosCurrentPage.bind(
    this.state,
  );
}
