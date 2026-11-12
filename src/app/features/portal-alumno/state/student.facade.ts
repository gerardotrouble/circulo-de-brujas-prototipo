import { Location } from "@angular/common";
import { computed, ErrorHandler, inject, Injectable, NgZone, signal } from "@angular/core";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { catchError, distinctUntilChanged, filter, interval, map, of, shareReplay } from "rxjs";
import { ActivatedRoute, NavigationEnd, NavigationExtras, Router } from "@angular/router";
import { coursePage } from "../domain/course-page";
import {
  activityCalendarDay,
  belongsToCalendarMonth,
  calendarMonth,
  isPublishedMonthlyActivity,
  portalDate,
} from "../domain/activity-calendar";
import { paymentAlerts, pendingPaymentStatus } from "../domain/payment-alerts";
import { FormControl } from "@angular/forms";
import { Activity } from "../domain/student.models";
import { STUDENT_REPOSITORY } from "../data-access/student.repository";
import { mysticPatternStyle } from "../../../shared/mystic-pattern";

const sections = ["cursos-actuales", "cursos-pasados", "pagos", "actividades-mes", "maestros", "configuracion"] as const;
type StudentView = "dashboard" | (typeof sections)[number];
type MenuState = { cursos: boolean; actividades: boolean };
type AgendaLayout = "list" | "grid" | "calendar";

const paymentDateFormat = new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeZone: "UTC" });
const paymentLabels = {
  overdue: { label: "Adeudo", classes: "bg-red-50 text-red-700", border: "border-red-200" },
  upcoming: { label: "Próximo pago", classes: "bg-amber-50 text-amber-700", border: "border-amber-200" },
  scheduled: { label: "Programado", classes: "bg-slate-50 text-slate-600", border: "border-slate-200" },
};

@Injectable()
export class StudentFacade {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly errorHandler = inject(ErrorHandler);
  private readonly routeChanges = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(() => this.route.firstChild?.snapshot),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true }),
  );
  private readonly child = toSignal(this.routeChanges, {
    initialValue: this.route.firstChild?.snapshot,
  });
  readonly navigationView = computed<StudentView>(() => {
    const path = this.child()?.routeConfig?.path?.split("/")[0];
    return sections.find(section => section === path) ?? "dashboard";
  });
  private readonly selectedId = computed(() => this.child()?.paramMap.get("id"));
  private readonly loadError = signal(false);
  readonly hasLoadError = this.loadError.asReadonly();
  private readonly portal = toSignal(
    inject(STUDENT_REPOSITORY)
      .getPortal()
      .pipe(
        catchError((error: unknown) => {
          this.errorHandler.handleError(error);
          this.loadError.set(true);
          return of(undefined);
        }),
      ),
  );
  readonly hasPortalData = computed(() => this.portal() !== undefined);
  readonly itemsPerPage = 6;
  readonly mysticPatternStyle = mysticPatternStyle;
  readonly Math = Math;
  readonly Number = Number;
  readonly activityLabels: Record<string, string> = {
    Taller: "Talleres",
    Ritual: "Rituales",
    Lectura: "Lecturas",
    Curso: "Cursos",
    Actividad: "Actividades",
    Servicio: "Servicios",
  };

  get currentActivitiesData() {
    return this.portal()?.current ?? [];
  }
  get pastActivitiesData() {
    return this.portal()?.past ?? [];
  }
  get pendingPaymentsData() {
    return this.portal()?.pending ?? [];
  }
  get paymentHistoryData() {
    return this.portal()?.payments ?? [];
  }
  private readonly publishedMonthlyActivities = computed(() =>
    this.portal()?.monthly.filter(isPublishedMonthlyActivity) ?? [],
  );
  get monthlyActivitiesData() {
    return this.publishedMonthlyActivities();
  }
  get maestrosData() {
    return this.portal()?.teachers ?? [];
  }

  private readonly isSidebarOpenState = signal(true);
  get isSidebarOpen() {
    return this.isSidebarOpenState();
  }
  setIsSidebarOpen(value: boolean): void {
    this.isSidebarOpenState.set(value);
  }

  private readonly isMobileMenuOpenState = signal(false);
  get isMobileMenuOpen() {
    return this.isMobileMenuOpenState();
  }
  setIsMobileMenuOpen(value: boolean): void {
    if (value) this.setIsSidebarOpen(true);
    this.isMobileMenuOpenState.set(value);
  }

  private readonly showNotificationsState = signal(false);
  get showNotifications() {
    return this.showNotificationsState();
  }
  setShowNotifications(value: boolean): void {
    this.showNotificationsState.set(value);
  }

  private readonly selectedActivityState = computed(() => {
    const source = this.navigationView();
    const id = this.selectedId();
    const items = source === "cursos-actuales" ? this.currentActivitiesData
      : source === "cursos-pasados" ? this.pastActivitiesData
      : source === "actividades-mes" ? this.monthlyActivitiesData
      : [];
    return items.find(item => String(item.id) === id);
  });

  get selectedActivity() {
    return this.selectedActivityState();
  }

  private readonly selectedMaestroState = computed(() =>
    this.maestrosData.find(item => String(item.id) === this.selectedId()),
  );

  get selectedMaestro() {
    return this.selectedMaestroState();
  }

  readonly canReturnToActivity = computed(() =>
    this.navigationView() === "maestros" &&
    this.selectedId() !== null &&
    (this.location.getState() as { fromActivity?: boolean } | null)?.fromActivity === true,
  );

  readonly fromActivityList = { fromActivityList: true };
  readonly fromActivity = { fromActivity: true };
  private readonly teachersByName = computed(() =>
    new Map(this.maestrosData.map(teacher => [teacher.nombre, teacher])),
  );
  teacherFor(instructor: string) {
    return this.teachersByName().get(instructor);
  }

  returnFromMaestro(): void {
    if (this.canReturnToActivity()) {
      this.location.back();
      return;
    }
    this.setActiveView("maestros");
  }

  readonly searchQueryControl = new FormControl("", { nonNullable: true });
  private readonly searchQueryState = toSignal(
    this.searchQueryControl.valueChanges,
    { initialValue: this.searchQueryControl.value },
  );
  get searchQuery() {
    return this.searchQueryState();
  }
  setSearchQuery(value: string): void {
    this.searchQueryControl.setValue(value);
  }

  readonly filterTypeControl = new FormControl("Todos", { nonNullable: true });
  private readonly filterTypeState = toSignal(
    this.filterTypeControl.valueChanges,
    { initialValue: this.filterTypeControl.value },
  );
  get filterType() {
    return this.filterTypeState();
  }
  setFilterType(value: string): void {
    this.filterTypeControl.setValue(value);
  }

  private readonly currentPageState = signal(1);
  get currentPage() {
    return this.currentPageState();
  }
  setCurrentPage(value: number): void {
    this.currentPageState.set(value);
  }

  readonly paymentSearchQueryControl = new FormControl("", {
    nonNullable: true,
  });
  private readonly paymentSearchQueryState = toSignal(
    this.paymentSearchQueryControl.valueChanges,
    { initialValue: this.paymentSearchQueryControl.value },
  );
  get paymentSearchQuery() {
    return this.paymentSearchQueryState();
  }
  setPaymentSearchQuery(value: string): void {
    this.paymentSearchQueryControl.setValue(value);
  }

  private readonly paymentCurrentPageState = signal(1);
  get paymentCurrentPage() {
    return this.paymentCurrentPageState();
  }
  setPaymentCurrentPage(value: number): void {
    this.paymentCurrentPageState.set(value);
  }

  readonly paymentsPerPageControl = new FormControl(5, { nonNullable: true });
  private readonly paymentsPerPageState = toSignal(
    this.paymentsPerPageControl.valueChanges,
    { initialValue: this.paymentsPerPageControl.value },
  );
  get paymentsPerPage() {
    return this.paymentsPerPageState();
  }
  setPaymentsPerPage(value: number): void {
    this.paymentsPerPageControl.setValue(value);
  }

  readonly teacherDirectoryView = signal<"compact" | "full">("full");

  readonly maestrosSearchQueryControl = new FormControl("", {
    nonNullable: true,
  });
  private readonly maestrosSearchQueryState = toSignal(
    this.maestrosSearchQueryControl.valueChanges,
    { initialValue: this.maestrosSearchQueryControl.value },
  );
  get maestrosSearchQuery() {
    return this.maestrosSearchQueryState();
  }
  setMaestrosSearchQuery(value: string): void {
    this.maestrosSearchQueryControl.setValue(value);
  }

  private readonly maestrosCurrentPageState = signal(1);
  get maestrosCurrentPage() {
    return this.maestrosCurrentPageState();
  }
  setMaestrosCurrentPage(value: number): void {
    this.maestrosCurrentPageState.set(value);
  }

  private readonly activityViewModeState = signal<AgendaLayout>("list");
  get activityViewMode() {
    return this.activityViewModeState();
  }
  setActivityViewMode(value: AgendaLayout): void {
    this.activityViewModeState.set(value);
  }

  readonly today = inject(NgZone).runOutsideAngular(() =>
    toSignal(interval(60_000).pipe(map(() => portalDate(new Date())), distinctUntilChanged()), {
      initialValue: portalDate(new Date()),
    }),
  );
  private readonly currentMonthKey = computed(() => this.today().slice(0, 7));
  readonly currentActivityMonth = computed(() => calendarMonth(this.currentMonthKey()));
  readonly currentMonthActivities = computed(() =>
    this.monthlyActivitiesData.filter(activity =>
      belongsToCalendarMonth(activity, this.currentActivityMonth(), this.currentMonthKey()),
    ),
  );
  private readonly nextActivityMonth = computed(() => calendarMonth(this.currentActivityMonth().nextKey));
  private readonly selectedCalendarMonthKey = signal<string | null>(null);
  private readonly nextMonthActivities = computed(() =>
    this.monthlyActivitiesData.filter(activity =>
      belongsToCalendarMonth(activity, this.nextActivityMonth(), this.currentMonthKey()),
    ),
  );
  private readonly viewingNextCalendarMonth = computed(() =>
    this.activityViewMode === "calendar" &&
    this.nextMonthActivities().length > 0 &&
    this.selectedCalendarMonthKey() === this.nextActivityMonth().key,
  );
  readonly activityMonth = computed(() =>
    this.viewingNextCalendarMonth() ? this.nextActivityMonth() : this.currentActivityMonth(),
  );
  readonly calendarMonthLink = computed(() => {
    if (this.activityViewMode !== "calendar" || !this.nextMonthActivities().length) return null;
    return this.viewingNextCalendarMonth()
      ? { label: `Volver a ${this.currentActivityMonth().name}`, back: true }
      : { label: `Ver ${this.nextActivityMonth().name}`, back: false };
  });

  toggleCalendarMonth(): void {
    const link = this.calendarMonthLink();
    if (!link) return;
    this.selectedCalendarMonthKey.set(link.back ? null : this.nextActivityMonth().key);
    this.selectedCalendarDayState.set(null);
  }

  private readonly selectedCalendarDayState = signal<{ monthKey: string; day: number } | null>(null);
  readonly selectedCalendarDay = computed(() => {
    const selection = this.selectedCalendarDayState();
    return selection?.monthKey === this.activityMonth().key ? selection.day : null;
  });

  selectCalendarDay(day: number): void {
    this.selectedCalendarDayState.set({ monthKey: this.activityMonth().key, day });
  }

  readonly activitySearchQueryControl = new FormControl("", {
    nonNullable: true,
  });
  private readonly activitySearchQueryState = toSignal(
    this.activitySearchQueryControl.valueChanges,
    { initialValue: this.activitySearchQueryControl.value },
  );
  get activitySearchQuery() {
    return this.activitySearchQueryState();
  }
  setActivitySearchQuery(value: string): void {
    this.activitySearchQueryControl.setValue(value);
  }

  private readonly activityFilterTypeState = signal("Todos");
  get activityFilterType() {
    return this.activityFilterTypeState();
  }
  setActivityFilterType(value: string): void {
    this.activityFilterTypeState.set(value);
  }

  private readonly activityCurrentPageState = signal(1);
  get activityCurrentPage() {
    return this.activityCurrentPageState();
  }
  setActivityCurrentPage(value: number): void {
    this.activityCurrentPageState.set(value);
  }

  private readonly openMenusState = signal<MenuState>({
    cursos: false,
    actividades: false,
  });
  get openMenus() {
    return this.openMenusState();
  }
  setOpenMenus(value: MenuState): void {
    this.openMenusState.set(value);
  }

  readonly activeCourses = computed(() =>
    this.currentActivitiesData.filter(activity => activity.type === "Curso" && activity.badge === "En curso"),
  );
  readonly paymentStatuses = computed(() => {
    if (!this.hasPortalData()) return null;
    const { overdue, upcoming } = paymentAlerts(this.pendingPaymentsData, this.today());
    const statuses = [];
    if (overdue) statuses.push(paymentLabels.overdue);
    if (upcoming) statuses.push(paymentLabels.upcoming);
    if (!statuses.length) statuses.push({ label: "Al corriente", classes: "bg-green-100 text-green-700" });
    return statuses;
  });
  readonly pendingPaymentCards = computed(() => this.pendingPaymentsData.map(payment => {
    const status = pendingPaymentStatus(payment, this.today());
    const due = Date.parse(`${payment.dueOn}T00:00:00Z`);
    const dueDate = Number.isFinite(due) ? paymentDateFormat.format(due) : payment.dueDate;
    return { ...payment, ...paymentLabels[status], dueDate, overdue: status === "overdue" };
  }));
  readonly isActiveCoursesView = computed(() =>
    this.navigationView() === "cursos-actuales" && this.child()?.queryParamMap.get("estado") === "activo",
  );

  readonly currentCourses = computed(() =>
    coursePage(
      this.isActiveCoursesView() ? this.activeCourses() : this.currentActivitiesData,
      this.searchQuery,
      this.filterType,
      this.currentPage,
      this.itemsPerPage,
    ),
  );
  readonly pastCourses = computed(() =>
    coursePage(
      this.pastActivitiesData,
      this.searchQuery,
      this.filterType,
      this.currentPage,
      this.itemsPerPage,
    ),
  );
  readonly paymentHistory = computed(() => {
    const {
      paymentSearchQuery,
      paymentCurrentPage,
      paymentsPerPage,
      paymentHistoryData,
    } = this;
    const filteredPayments = paymentHistoryData.filter((tx) =>
      tx.concept.toLowerCase().includes(paymentSearchQuery.toLowerCase()),
    );
    const totalPaymentPages = Math.ceil(
      filteredPayments.length / paymentsPerPage,
    );
    const indexOfLastPayment = paymentCurrentPage * paymentsPerPage;
    const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
    const currentPayments = filteredPayments.slice(
      indexOfFirstPayment,
      indexOfLastPayment,
    );
    return {
      filteredPayments,
      totalPaymentPages,
      indexOfLastPayment,
      indexOfFirstPayment,
      currentPayments,
    };
  });
  readonly monthlyActivities = computed(() => {
    const {
      activitySearchQuery,
      activityFilterType,
      activityCurrentPage,
      itemsPerPage,
    } = this;
    const searchStr = this.activityViewMode === "calendar" ? "" : activitySearchQuery.toLowerCase();
    const monthActivities = this.viewingNextCalendarMonth()
      ? this.nextMonthActivities()
      : this.currentMonthActivities();
    const filteredActivities = monthActivities.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchStr) ||
        item.instructor.toLowerCase().includes(searchStr) ||
        item.day.includes(searchStr);
      const matchesFilter =
        activityFilterType === "Todos" ||
        item.type === activityFilterType ||
        item.additionalTypes?.includes(activityFilterType);
      return matchesSearch && matchesFilter;
    });
    const totalActPages = Math.ceil(filteredActivities.length / itemsPerPage);
    const idxLastAct = activityCurrentPage * itemsPerPage;
    const idxFirstAct = idxLastAct - itemsPerPage;
    const currentActs = filteredActivities.slice(idxFirstAct, idxLastAct);
    return {
      filteredActivities,
      totalActPages,
      idxLastAct,
      idxFirstAct,
      currentActs,
    };
  });
  readonly teacherDirectory = computed(() => {
    const {
      maestrosSearchQuery,
      maestrosCurrentPage,
      maestrosData,
      itemsPerPage,
    } = this;
    const filteredMaestros = maestrosData.filter((maestro) => {
      const searchStr = maestrosSearchQuery.toLowerCase();
      const matchesName = maestro.nombre.toLowerCase().includes(searchStr);
      const matchesSpecialty = maestro.especialidades.some((esp) =>
        esp.toLowerCase().includes(searchStr),
      );
      return matchesName || matchesSpecialty;
    });
    const totalMaestrosPages = Math.ceil(
      filteredMaestros.length / itemsPerPage,
    );
    const idxLastMaestro = maestrosCurrentPage * itemsPerPage;
    const idxFirstMaestro = idxLastMaestro - itemsPerPage;
    const currentMaestros = filteredMaestros.slice(
      idxFirstMaestro,
      idxLastMaestro,
    );
    return {
      filteredMaestros,
      totalMaestrosPages,
      idxLastMaestro,
      idxFirstMaestro,
      currentMaestros,
    };
  });

  constructor() {
    this.searchQueryControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.setCurrentPage(1));
    this.filterTypeControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.setCurrentPage(1));
    this.paymentsPerPageControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.setPaymentCurrentPage(1));
    this.paymentSearchQueryControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.setPaymentCurrentPage(1));
    this.activitySearchQueryControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.setActivityCurrentPage(1));
    this.maestrosSearchQueryControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.setMaestrosCurrentPage(1));
  }

  setActiveView(value: StudentView): void {
    if ((value === "cursos-actuales" || value === "cursos-pasados") && value !== this.navigationView()) {
      this.setSearchQuery("");
      this.setFilterType("Todos");
    }
    this.navigate(value);
  }

  private navigate(
    section: StudentView,
    id?: number,
    { closeMenu = true, state }: { closeMenu?: boolean; state?: NavigationExtras["state"] } = {},
  ): void {
    if (closeMenu) this.setIsMobileMenuOpen(false);
    const commands = ["/portal-alumno"];
    if (section !== "dashboard") commands.push(section);
    if (id !== undefined) commands.push(String(id));
    void this.router.navigate(commands, { state });
  }

  toggleSidebar(): void {
    if (this.isSidebarOpen)
      this.setOpenMenus({ cursos: false, actividades: false });
    this.setIsSidebarOpen(!this.isSidebarOpen);
  }

  toggleMenu(menu: keyof MenuState): void {
    const opening = !this.isSidebarOpen || !this.openMenus[menu];
    if (
      menu === "actividades" &&
      opening &&
      (this.navigationView() !== "actividades-mes" || this.selectedId() !== null)
    ) {
      this.navigate("actividades-mes", undefined, { closeMenu: false });
      this.setActivityFilterType("Todos");
      this.setActivitySearchQuery("");
      this.setActivityCurrentPage(1);
    }
    this.setOpenMenus({
      cursos: opening && menu === "cursos",
      actividades: opening && menu === "actividades",
    });
    this.setIsSidebarOpen(true);
  }

  returnFromActivity(): void {
    const origin = this.location.getState() as {
      fromTeacher?: boolean;
      fromDashboard?: boolean;
      fromActivityList?: boolean;
      fromNotification?: boolean;
    } | null;
    if (origin?.fromTeacher || origin?.fromDashboard || origin?.fromActivityList || origin?.fromNotification) {
      this.location.back();
      return;
    }
    this.setActiveView(this.navigationView());
  }

  activitiesOnDay<T extends Activity>(items: readonly T[], day: number): T[] {
    return items.filter(item => activityCalendarDay(item) === day);
  }
}
