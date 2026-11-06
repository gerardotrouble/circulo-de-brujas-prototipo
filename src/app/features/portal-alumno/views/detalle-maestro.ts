import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { StudentFacade } from "../state/student.facade";

@Component({
  standalone: true,
  selector: "student-detalle-maestro",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: "./detalle-maestro.html",
  styles: [":host { display: contents; }"],
})
export class DetalleMaestroView {
  readonly zodiacIcons: Readonly<Record<string, string>> = {
    Aries: "♈",
    Tauro: "♉",
    Géminis: "♊",
    Cáncer: "♋",
    Leo: "♌",
    Virgo: "♍",
    Libra: "♎",
    Escorpio: "♏",
    Sagitario: "♐",
    Capricornio: "♑",
    Acuario: "♒",
    Piscis: "♓",
  };

  readonly state = inject(StudentFacade);
  readonly setActiveView = this.state.setActiveView.bind(this.state);
}
