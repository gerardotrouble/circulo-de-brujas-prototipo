import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { PortalArt } from "../../../shared/portal-art";
import { StudentFacade } from "../state/student.facade";

@Component({
  standalone: true,
  selector: "student-pagos",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, PortalArt, RouterLink],
  templateUrl: "./pagos.html",
  styles: [":host { display: contents; }"],
})
export class PagosView {
  readonly state = inject(StudentFacade);
  readonly setPaymentCurrentPage = this.state.setPaymentCurrentPage.bind(
    this.state,
  );
}
