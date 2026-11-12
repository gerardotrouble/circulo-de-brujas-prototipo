import { ChangeDetectionStrategy, Component, computed, inject, NgZone } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { RouterLink } from "@angular/router";
import { interval, map } from "rxjs";
import { StudentFacade } from "../state/student.facade";
import { StudentProfileStore } from "../state/student-profile.store";

@Component({
  standalone: true,
  selector: "student-inicio",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: "./inicio.html",
  styles: [`
    :host { display: contents; }
    .summary-cards,
    .recommended-courses {
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
    }
  `],
})
export class InicioView {
  readonly state = inject(StudentFacade);
  protected readonly studentProfile = inject(StudentProfileStore);
  protected readonly activityNavigationState = { fromDashboard: true };
  private readonly now = inject(NgZone).runOutsideAngular(() =>
    toSignal(interval(60_000).pipe(map(() => new Date())), { initialValue: new Date() }),
  );
  private readonly upcomingActivities = computed(() => {
    const now = this.now();
    const today = this.state.today();

    return this.state.monthlyActivitiesData.flatMap(activity => {
      const scheduledFor = activity.scheduledFor;
      if (!scheduledFor) return [];

      const timestamp = Date.parse(scheduledFor);
      const isUpcoming = scheduledFor.length === 10 ? scheduledFor >= today : timestamp >= now.getTime();
      return isUpcoming && Number.isFinite(timestamp) ? [{ activity, timestamp }] : [];
    }).sort((first, second) => first.timestamp - second.timestamp).map(entry => entry.activity);
  });
  protected readonly nextActivity = computed(() => this.upcomingActivities()[0]);

  protected readonly recommendedCourses = computed(() => {
    const today = this.state.today();
    const topics = new Set([...this.state.currentActivitiesData, ...this.state.pastActivitiesData]
      .flatMap(activity => activity.topics ?? []));
    const candidates = this.upcomingActivities().filter(activity =>
      activity.type === "Curso" && activity.cover && (!activity.addedOn || activity.addedOn <= today),
    );
    const related = candidates.find(activity => activity.topics?.some(topic => topics.has(topic)));
    const newest = candidates.filter(activity => activity.id !== related?.id && activity.addedOn)
      .sort((first, second) => (second.addedOn ?? "").localeCompare(first.addedOn ?? ""))[0];
    const levelMatch = candidates.find(activity =>
      activity.id !== related?.id && activity.id !== newest?.id && activity.level === this.studentProfile.enrollment.level,
    );

    return [
      { activity: related, reason: "Relacionado con tus actividades" },
      { activity: newest, reason: "Nuevo en el catálogo" },
      { activity: levelMatch, reason: "Para tu nivel" },
    ].flatMap(({ activity, reason }) => activity ? [{ activity, reason }] : []);
  });

}
