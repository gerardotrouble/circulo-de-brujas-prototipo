import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  viewChild,
} from "@angular/core";
import { StudentFacade } from "./state/student.facade";
import { RouterLink, RouterOutlet } from "@angular/router";
@Component({
  standalone: true,
  selector: "cb-portal",
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./student.html",
  styleUrl: "./student.scss",
  providers: [StudentFacade],
  imports: [RouterLink, RouterOutlet],
})
export class Student {
  readonly state = inject(StudentFacade);
  private readonly notifications =
    viewChild<ElementRef<HTMLElement>>("notifications");
  readonly setIsMobileMenuOpen = this.state.setIsMobileMenuOpen.bind(
    this.state,
  );
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
