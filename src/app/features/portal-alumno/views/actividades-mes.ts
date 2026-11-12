import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  viewChild,
} from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { StudentFacade } from "../state/student.facade";

@Component({
  standalone: true,
  selector: "student-actividades-mes",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: "./actividades-mes.html",
  styles: [
    ":host { display: contents; }",
    `
      #selected-day-heading { scroll-margin-block-start: 1rem; }
      .month-calendar { container-type: inline-size; }
      .month-dot { display: none; }
      @container (width < 560px) {
        .month-week, .month-days { min-width: 0; }
        .month-days { grid-auto-rows: 52px; }
        .month-day { flex-direction: column; align-items: center; gap: 2px; padding: 4px 0; }
        .month-events { display: none; }
        .month-dot { display: block; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
      }
    `,
  ],
})
export class ActividadesMesView {
  private readonly injector = inject(Injector);
  private readonly selectedDayHeading = viewChild<ElementRef<HTMLElement>>("selectedDayHeading");
  readonly state = inject(StudentFacade);
  readonly setActivityViewMode = this.state.setActivityViewMode.bind(
    this.state,
  );
  readonly setActivityCurrentPage = this.state.setActivityCurrentPage.bind(
    this.state,
  );
  readonly activitiesOnDay = this.state.activitiesOnDay.bind(this.state);
  readonly selectedDayActivities = computed(() => {
    const day = this.state.selectedCalendarDay();
    return day === null
      ? []
      : this.activitiesOnDay(this.state.monthlyActivities().filteredActivities, day);
  });

  selectCalendarDay(day: number): void {
    this.state.selectCalendarDay(day);
    afterNextRender({
      write: () => {
        const heading = this.selectedDayHeading()?.nativeElement;
        if (!heading) return;

        const reduceMotion = heading.ownerDocument.defaultView
          ?.matchMedia("(prefers-reduced-motion: reduce)").matches;
        heading.focus({ preventScroll: true });
        heading.scrollIntoView({
          behavior: reduceMotion ? "instant" : "smooth",
          block: "start",
          inline: "nearest",
        });
      },
    }, { injector: this.injector });
  }
}
