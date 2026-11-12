import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { StudentFacade } from "../state/student.facade";

@Component({
  standalone: true,
  selector: "student-maestros",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: "./maestros.html",
  styles: [`
    :host {
      display: contents;
    }

    .compact-directory {
      grid-template-columns: repeat(
        auto-fill,
        minmax(min(100%, max(8rem, calc((100% - 5rem) / 6))), 1fr)
      );
    }
  `],
})
export class MaestrosView {
  readonly state = inject(StudentFacade);
  readonly setMaestrosCurrentPage = this.state.setMaestrosCurrentPage.bind(
    this.state,
  );
}
