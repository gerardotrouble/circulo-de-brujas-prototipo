import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  Injector,
  signal,
  viewChild,
} from "@angular/core";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, RouterLink, RouterOutlet } from "@angular/router";
import { filter, fromEvent, map } from "rxjs";
import { StudentFacade } from "./state/student.facade";
import { StudentProfileStore } from "./state/student-profile.store";
import { StudentAvatar } from "./views/student-avatar";

const themePreferenceKey = "circulo-de-brujas:portal-theme";
const readNoticesKey = "circulo-de-brujas:demo-read-notices";

function readNoticeIds(): string[] {
  try {
    const ids: unknown = JSON.parse(localStorage.getItem(readNoticesKey) ?? "[]");
    return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function readDarkTheme(): boolean {
  try {
    return localStorage.getItem(themePreferenceKey) === "dark";
  } catch {
    return false;
  }
}

@Component({
  standalone: true,
  selector: "cb-portal",
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./student.html",
  styleUrl: "./student.scss",
  providers: [StudentFacade],
  imports: [RouterLink, RouterOutlet, StudentAvatar],
  host: { "[attr.data-theme]": 'darkTheme() ? "dark" : "light"' },
})
export class Student {
  private readonly injector = inject(Injector);
  readonly state = inject(StudentFacade);
  readonly studentProfile = inject(StudentProfileStore);
  protected readonly darkTheme = signal(readDarkTheme());
  private readonly notifications =
    viewChild<ElementRef<HTMLElement>>("notifications");
  private readonly notificationTrigger = viewChild<ElementRef<HTMLButtonElement>>("notificationTrigger");
  private readonly openMenuTrigger = viewChild<ElementRef<HTMLButtonElement>>("openMenuTrigger");
  private readonly closeMenuTrigger = viewChild<ElementRef<HTMLButtonElement>>("closeMenuTrigger");
  private readonly portalContent =
    viewChild<ElementRef<HTMLElement>>("portalContent");
  private readonly mobileQuery = matchMedia("(max-width: 767px)");
  protected readonly mobile = toSignal(fromEvent<MediaQueryListEvent>(this.mobileQuery, "change").pipe(
    map(event => event.matches),
  ), { initialValue: this.mobileQuery.matches });
  protected readonly notices = [
    {
      id: "ritual-203",
      title: "Nuevo ritual añadido",
      description: "Ritual de Luna Llena en Tauro",
      route: "/portal-alumno/actividades-mes/203",
    },
    {
      id: "payment-101",
      title: "Pago confirmado",
      description: "Mensualidad de Tarot Evolutivo",
      route: "/portal-alumno/pagos",
    },
  ];
  protected readonly readNotices = signal(readNoticeIds());
  protected readonly unreadCount = computed(() => this.notices.filter(notice => !this.readNotices().includes(notice.id)).length);
  protected readonly notificationOrigin = { fromNotification: true };
  readonly setShowNotifications = this.state.setShowNotifications.bind(
    this.state,
  );
  readonly setActivitySearchQuery = this.state.setActivitySearchQuery.bind(
    this.state,
  );
  readonly setActivityFilterType = this.state.setActivityFilterType.bind(
    this.state,
  );
  readonly setActivityCurrentPage = this.state.setActivityCurrentPage.bind(
    this.state,
  );
  readonly setOpenMenus = this.state.setOpenMenus.bind(this.state);
  readonly setActiveView = this.state.setActiveView.bind(this.state);
  readonly toggleSidebar = this.state.toggleSidebar.bind(this.state);
  readonly toggleMenu = this.state.toggleMenu.bind(this.state);

  constructor() {
    inject(Router).events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed(),
    ).subscribe(() => {
      this.state.setShowNotifications(false);
      afterNextRender({ write: () => {
        const content = this.portalContent()?.nativeElement;
        if (!content) return;
        content.scrollTo({ top: 0, left: 0, behavior: "instant" });
        if (this.mobile() && this.state.isMobileMenuOpen) return;
        const heading = content.querySelector<HTMLElement>("h1");
        heading?.setAttribute("tabindex", "-1");
        (heading ?? content).focus({ preventScroll: true });
      } }, { injector: this.injector });
    });
  }

  protected setIsMobileMenuOpen(open: boolean): void {
    this.state.setIsMobileMenuOpen(open);
    afterNextRender({ write: () => {
      const trigger = open ? this.closeMenuTrigger() : this.openMenuTrigger();
      trigger?.nativeElement.focus({ preventScroll: true });
    } }, { injector: this.injector });
  }

  protected openNotice(id: string): void {
    if (!this.readNotices().includes(id)) {
      const ids = [...this.readNotices(), id];
      this.readNotices.set(ids);
      try {
        localStorage.setItem(readNoticesKey, JSON.stringify(ids));
      } catch {
        // El aviso queda leído durante esta visita.
      }
    }
    this.state.setShowNotifications(false);
    this.notificationTrigger()?.nativeElement.focus({ preventScroll: true });
  }

  @HostListener("document:keydown.escape")
  protected dismissOnEscape(): void {
    if (this.mobile() && this.state.isMobileMenuOpen) {
      this.setIsMobileMenuOpen(false);
    } else if (this.state.showNotifications) {
      this.state.setShowNotifications(false);
      this.notificationTrigger()?.nativeElement.focus({ preventScroll: true });
    }
  }

  protected toggleTheme(): void {
    this.darkTheme.update(enabled => !enabled);
    try {
      localStorage.setItem(themePreferenceKey, this.darkTheme() ? "dark" : "light");
    } catch {
      // El tema sigue activo durante la visita si el navegador bloquea el almacenamiento.
    }
  }

  @HostListener("document:mousedown", ["$event"])
  dismissNotifications(event: MouseEvent): void {
    if (
      event.target instanceof Node &&
      !this.notifications()?.nativeElement.contains(event.target)
    ) {
      this.state.setShowNotifications(false);
    }
  }
}
