import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { map } from "rxjs";
import { PhotoCrop, StudentProfileStore } from "../state/student-profile.store";
import { StudentAvatar } from "./student-avatar";

const centeredCrop: PhotoCrop = { zoom: 1, x: 0, y: 0 };
const previewSize = 0.88;
const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
const arrowOffsets: Readonly<Record<string, readonly [number, number] | undefined>> = {
  ArrowLeft: [-0.03, 0],
  ArrowRight: [0.03, 0],
  ArrowUp: [0, -0.03],
  ArrowDown: [0, 0.03],
};

@Component({
  standalone: true,
  selector: "student-configuracion",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, StudentAvatar],
  templateUrl: "./configuracion.html",
  styleUrl: "./configuracion.scss",
})
export class ConfiguracionView {
  private readonly destroyRef = inject(DestroyRef);
  private readonly editor = viewChild.required<ElementRef<HTMLDialogElement>>("photoEditor");
  private readonly confirmation = viewChild.required<ElementRef<HTMLDialogElement>>("photoConfirmation");
  protected readonly student = inject(StudentProfileStore);
  protected readonly nameForm = new FormGroup({
    magicalName: new FormControl({
      value: this.student.profile().magicalName,
      disabled: Boolean(this.student.profile().magicalName),
    }, { nonNullable: true }),
    displayName: new FormControl(this.student.profile().displayName, { nonNullable: true }),
  });
  private readonly nameDraft = toSignal(this.nameForm.valueChanges.pipe(
    map(() => this.nameForm.getRawValue()),
  ), { initialValue: this.nameForm.getRawValue() });
  protected readonly nameChanged = computed(() => {
    const draft = this.nameDraft();
    const saved = this.student.profile();
    return draft.magicalName.trim() !== saved.magicalName || draft.displayName !== saved.displayName;
  });
  protected readonly nameError = signal("");
  protected readonly photoError = signal("");
  protected readonly saveStatus = signal("");
  protected readonly confirmError = signal("");
  protected readonly loadingPhoto = signal(false);
  protected readonly draft = signal<HTMLImageElement | null>(null);
  protected readonly crop = signal(centeredCrop);
  private readonly originalCrop = signal(centeredCrop);
  private photoLoad = 0;
  private statusTimer?: ReturnType<typeof setTimeout>;
  protected readonly photoChanged = computed(() => {
    const image = this.draft();
    if (!image) return false;
    const { photo, photoEdit } = this.student.profile();
    const original = this.originalCrop();
    const current = this.crop();
    return image.getAttribute("src") !== (photoEdit?.source ?? photo) ||
      Math.abs(current.zoom - original.zoom) > 0.000001 ||
      Math.abs(current.x - original.x) > 0.000001 ||
      Math.abs(current.y - original.y) > 0.000001;
  });
  protected readonly minZoom = computed(() => {
    const image = this.draft();
    if (!image) return 0.65;
    return Math.min(0.65, Math.min(image.naturalWidth, image.naturalHeight) /
      Math.max(image.naturalWidth, image.naturalHeight));
  });
  protected readonly photoSize = computed(() => {
    const image = this.draft();
    if (!image) return null;
    const scale = previewSize / Math.max(image.naturalWidth, image.naturalHeight);
    return { width: image.naturalWidth * scale, height: image.naturalHeight * scale };
  });
  protected readonly cropDiameter = computed(() => {
    const photo = this.photoSize();
    return photo ? Math.min(photo.width, photo.height) / this.crop().zoom : 0;
  });
  private drag: { id: number; x: number; y: number } | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.statusTimer));
  }

  protected saveName(): void {
    if (!this.nameChanged()) return;
    this.nameError.set("");
    const { magicalName, displayName } = this.nameForm.getRawValue();
    const name = magicalName.trim();
    if (displayName === "magical" && !name) {
      this.nameError.set("Escribe un nombre mágico para poder mostrarlo.");
      return;
    }

    try {
      this.student.saveName(name, displayName);
      this.nameForm.controls.magicalName.reset({ value: name, disabled: Boolean(name) });
      this.showSavedStatus("Cambio guardado.");
    } catch {
      this.nameError.set("No se pudo guardar la preferencia en este navegador.");
    }
  }

  protected editMagicalName(input: HTMLInputElement): void {
    this.nameForm.controls.magicalName.enable();
    input.focus();
  }

  protected async openPhotoEditor(): Promise<void> {
    this.discardDraft();
    this.editor().nativeElement.showModal();
    const { photo, photoEdit } = this.student.profile();
    const source = photoEdit?.source ?? photo;
    if (!source) return;

    const load = ++this.photoLoad;
    this.loadingPhoto.set(true);
    try {
      const image = await this.readImage(source);
      if (load !== this.photoLoad || this.destroyRef.destroyed) return;
      this.draft.set(image);
      const crop = photoEdit?.crop ?? centeredCrop;
      this.setCrop(crop.zoom, crop.x, crop.y);
      this.originalCrop.set(this.crop());
    } catch {
      if (load === this.photoLoad) this.photoError.set("No se pudo abrir la foto actual. Elige otra foto.");
    } finally {
      if (load === this.photoLoad) this.loadingPhoto.set(false);
    }
  }

  protected async choosePhoto(input: HTMLInputElement): Promise<void> {
    const file = input.files?.[0];
    input.value = "";
    if (!file || this.loadingPhoto()) return;

    this.photoError.set("");
    if (!acceptedTypes.includes(file.type) || file.size > 20 * 1024 * 1024) {
      this.photoError.set("Elige una imagen JPG, PNG o WebP de hasta 20 MB.");
      return;
    }

    this.loadingPhoto.set(true);
    const load = ++this.photoLoad;
    const url = URL.createObjectURL(file);
    try {
      const original = await this.readImage(url);
      if (load !== this.photoLoad || this.destroyRef.destroyed) return;
      const scale = Math.min(1, 1200 / Math.max(original.naturalWidth, original.naturalHeight));
      const context = this.photoCanvas(
        Math.max(1, Math.round(original.naturalWidth * scale)),
        Math.max(1, Math.round(original.naturalHeight * scale)),
      );
      context.drawImage(original, 0, 0, context.canvas.width, context.canvas.height);
      const image = await this.readImage(context.canvas.toDataURL("image/jpeg", 0.9));
      if (load !== this.photoLoad || this.destroyRef.destroyed) return;
      this.draft.set(image);
      this.resetCrop();
    } catch {
      if (load === this.photoLoad && !this.destroyRef.destroyed) {
        this.photoError.set("No se pudo abrir la imagen. Elige otro archivo.");
      }
    } finally {
      URL.revokeObjectURL(url);
      if (load === this.photoLoad && !this.destroyRef.destroyed) this.loadingPhoto.set(false);
    }
  }

  protected discardDraft(): void {
    this.photoLoad++;
    this.draft.set(null);
    this.loadingPhoto.set(false);
    this.photoError.set("");
    this.originalCrop.set(centeredCrop);
    this.drag = null;
  }

  protected moveCropWithKey(event: KeyboardEvent): void {
    const offset = arrowOffsets[event.key];
    if (!offset) return;
    event.preventDefault();
    const { zoom, x, y } = this.crop();
    this.setCrop(zoom, x + offset[0], y + offset[1]);
  }

  protected startDrag(event: PointerEvent, surface: HTMLElement): void {
    if (event.button !== 0 || this.drag) return;
    this.drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
    surface.setPointerCapture(event.pointerId);
  }

  protected moveDrag(event: PointerEvent, surface: HTMLElement): void {
    const drag = this.drag;
    if (!drag || drag.id !== event.pointerId) return;
    const diameter = surface.getBoundingClientRect().width;
    const { zoom, x, y } = this.crop();
    this.setCrop(zoom, x + (event.clientX - drag.x) / diameter, y + (event.clientY - drag.y) / diameter);
    this.drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
  }

  protected stopDrag(event: PointerEvent): void {
    if (this.drag?.id === event.pointerId) this.drag = null;
  }

  protected setZoom(zoom: number): void {
    const { x, y } = this.crop();
    this.setCrop(zoom, x, y);
  }

  protected resetCrop(): void {
    const image = this.draft();
    if (!image) return;
    const ratio = Math.min(image.naturalWidth, image.naturalHeight) /
      Math.max(image.naturalWidth, image.naturalHeight);
    this.setCrop(Math.min(1, 1.25 * ratio), 0, 0);
  }

  protected requestConfirmation(): void {
    this.confirmError.set("");
    this.confirmation().nativeElement.showModal();
  }

  protected confirmPhoto(): void {
    const image = this.draft();
    const photo = this.photoSize();
    if (!image || !photo || !this.photoChanged()) return;
    const crop = this.crop();
    const diameter = this.cropDiameter();
    const scale = 512 / diameter;
    try {
      const context = this.photoCanvas(512, 512);
      context.drawImage(image, ((diameter - photo.width) / 2 - crop.x) * scale,
        ((diameter - photo.height) / 2 - crop.y) * scale, photo.width * scale, photo.height * scale);
      this.student.savePhoto(context.canvas.toDataURL("image/jpeg", 0.88), {
        source: image.getAttribute("src") ?? image.src,
        crop,
      });
      this.confirmation().nativeElement.close();
      this.editor().nativeElement.close();
      this.showSavedStatus("Foto de perfil actualizada.");
    } catch {
      this.confirmError.set("No se pudo guardar la foto en este navegador.");
    }
  }

  private setCrop(zoom: number, x: number, y: number): void {
    const photo = this.photoSize();
    if (!photo) return;
    zoom = Math.max(this.minZoom(), Math.min(3, zoom));
    const diameter = Math.min(photo.width, photo.height) / zoom;
    const margin = (1 - diameter) / 2;
    const maxX = Math.min(margin, Math.abs(photo.width - diameter) / 2);
    const maxY = Math.min(margin, Math.abs(photo.height - diameter) / 2);
    this.crop.set({
      zoom,
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    });
  }

  private async readImage(source: string): Promise<HTMLImageElement> {
    const image = new Image();
    image.src = source;
    await image.decode();
    return image;
  }

  private photoCanvas(width: number, height: number): CanvasRenderingContext2D {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No se puede preparar el recorte.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    return context;
  }

  private showSavedStatus(message: string): void {
    clearTimeout(this.statusTimer);
    this.saveStatus.set(message);
    this.statusTimer = setTimeout(() => this.saveStatus.set(""), 3200);
  }
}
