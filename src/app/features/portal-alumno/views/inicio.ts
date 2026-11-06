import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { StudentFacade } from "../state/student.facade";

@Component({
  standalone: true,
  selector: "student-inicio",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: "./inicio.html",
  styles: [`
    :host { display: contents; }
    .summary-cards {
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 176px), 1fr));
    }
  `],
})
export class InicioView {
  readonly state = inject(StudentFacade);
}
