import { computed, Injectable, signal } from "@angular/core";

type DisplayName = "legal" | "magical";

export interface PhotoCrop {
  readonly zoom: number;
  readonly x: number;
  readonly y: number;
}

interface PhotoEdit {
  readonly source: string;
  readonly crop: PhotoCrop;
}

interface ProfilePreferences {
  readonly magicalName: string;
  readonly displayName: DisplayName;
  readonly photo: string | null;
  readonly photoEdit?: PhotoEdit;
}

const firstName = "Mariana";
const firstSurname = "Oliva";
const enrollment = {
  legalName: `${firstName} Dayami ${firstSurname} Ramos`,
  registration: "10293847",
  level: "Principiante",
} as const;

const storageKey = "circulo-de-brujas:student-profile:" + enrollment.registration;
const defaults: ProfilePreferences = {
  magicalName: "",
  displayName: "legal",
  photo: "assets/profiles/day.jpg",
};

@Injectable({ providedIn: "root" })
export class StudentProfileStore {
  readonly enrollment = enrollment;
  private readonly preferences = signal(this.readPreferences());
  readonly profile = this.preferences.asReadonly();

  private readonly selectedMagicalName = computed(() => {
    const { magicalName, displayName } = this.profile();
    return displayName === "magical" ? magicalName : "";
  });
  readonly visibleName = computed(() => this.selectedMagicalName() || enrollment.legalName);
  readonly menuName = computed(() => this.selectedMagicalName() || `${firstName} ${firstSurname}`);
  saveName(magicalName: string, displayName: DisplayName): void {
    this.save({ ...this.profile(), magicalName, displayName });
  }

  savePhoto(photo: string, photoEdit: PhotoEdit): void {
    this.save({ ...this.profile(), photo, photoEdit });
  }

  private save(preferences: ProfilePreferences): void {
    localStorage.setItem(storageKey, JSON.stringify(preferences));
    this.preferences.set(preferences);
  }

  private readPreferences(): ProfilePreferences {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null") as
        Partial<ProfilePreferences> | null;
      if (!saved) return defaults;

      const magicalName = typeof saved.magicalName === "string" ? saved.magicalName : "";
      const photo = saved.photo;
      const edit = saved.photoEdit;
      return {
        magicalName,
        displayName: saved.displayName === "magical" && magicalName ? "magical" : "legal",
        photo: photo === null || photo === defaults.photo ||
          (typeof photo === "string" && photo.startsWith("data:image/jpeg;base64,"))
          ? photo
          : defaults.photo,
        photoEdit: photo && edit && typeof edit.source === "string" &&
          (edit.source === defaults.photo || edit.source.startsWith("data:image/jpeg;base64,")) &&
          Number.isFinite(edit.crop?.zoom) && Number.isFinite(edit.crop?.x) && Number.isFinite(edit.crop?.y)
          ? edit
          : undefined,
      };
    } catch {
      return defaults;
    }
  }
}
