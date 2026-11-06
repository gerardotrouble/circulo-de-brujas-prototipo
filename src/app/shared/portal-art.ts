import { Component, input } from "@angular/core";

@Component({
  standalone: true,
  selector: "portal-art",
  templateUrl: "./portal-art.html",
  styles: [":host { display: contents; }"],
})
export class PortalArt {
  readonly icon = input<string>();
}
