import { computed, ErrorHandler, inject, Injectable, signal } from "@angular/core";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { catchError, distinctUntilChanged, filter, map, of, shareReplay } from "rxjs";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { coursePage } from "../domain/course-page";
import { FormControl } from "@angular/forms";
import { Activity, Teacher } from "../domain/student.models";
import { STUDENT_REPOSITORY } from "../data-access/student.repository";
import { mysticPatternStyle } from "../../../shared/mystic-pattern";

const sections = ["cursos-actuales", "cursos-pasados", "pagos", "actividades-mes", "maestros"] as const;
type StudentView = "dashboard" | (typeof sections)[number];
type MenuState = { cursos: boolean; actividades: boolean };
type AgendaLayout = "list" | "grid" | "calendar";

@Injectable()
export class StudentFacade {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
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
  get monthlyActivitiesData() {
    return this.portal()?.monthly ?? [];
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

  openActivity(activity: Activity): void {
    this.navigate(this.navigationView(), activity.id);
  }

  openMaestro(teacher: Teacher): void {
    this.setOpenMenus({ cursos: false, actividades: false });
    this.navigate("maestros", teacher.id);
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

  readonly currentCourses = computed(() =>
    coursePage(
      this.currentActivitiesData,
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
      monthlyActivitiesData,
      itemsPerPage,
    } = this;
    const filteredActivities = monthlyActivitiesData.filter((item) => {
      const searchStr = activitySearchQuery.toLowerCase();
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
    const calendarDays = Array.from({ length: 42 }, (_, i) => {
      const dayNumber = i - 5;
      return dayNumber > 0 && dayNumber <= 30 ? dayNumber : null;
    });
    return {
      filteredActivities,
      totalActPages,
      idxLastAct,
      idxFirstAct,
      currentActs,
      calendarDays,
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
    this.routeChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.setSearchQuery("");
      this.setFilterType("Todos");
      this.setPaymentSearchQuery("");
      this.setMaestrosSearchQuery("");
    });
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
    this.navigate(value);
  }

  private navigate(section: StudentView, id?: number, closeMenu = true): void {
    if (closeMenu) this.setIsMobileMenuOpen(false);
    const commands = ["/portal-alumno"];
    if (section !== "dashboard") commands.push(section);
    if (id !== undefined) commands.push(String(id));
    void this.router.navigate(commands);
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
      this.navigate("actividades-mes", undefined, false);
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

  handleMaestroClick(event: Event, instructor: string): void {
    event.stopPropagation();
    const teacher = this.maestrosData.find(
      (item) => item.nombre === instructor,
    );
    if (!teacher) return;
    this.openMaestro(teacher);
  }

  returnFromActivity(): void {
    this.setActiveView(this.navigationView());
  }

  activitiesOnDay<T extends Activity>(items: readonly T[], day: number): T[] {
    return items.filter((item) => item.day === String(day));
  }
}
