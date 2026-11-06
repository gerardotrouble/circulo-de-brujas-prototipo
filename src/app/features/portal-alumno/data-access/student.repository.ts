import { HttpClient } from "@angular/common/http";
import { inject, Injectable, InjectionToken } from "@angular/core";
import { defer, delay, map, Observable, of } from "rxjs";
import { PORTAL_ENVIRONMENT } from "../../../core/environment";
import { StudentData } from "../domain/student.models";
import mock from "./student.mock.json";

export interface StudentRepository {
  getPortal(): Observable<StudentData>;
}

export interface StudentApiBinding {
  readonly url: string;
  readonly decode: (dto: unknown) => StudentData;
}

export const STUDENT_API = new InjectionToken<StudentApiBinding>(
  "StudentApiBinding",
);

@Injectable({ providedIn: "root" })
export class MockStudentRepository implements StudentRepository {
  getPortal(): Observable<StudentData> {
    return defer(() => of(structuredClone(mock))).pipe(delay(350));
  }
}

@Injectable({ providedIn: "root" })
export class HttpStudentRepository implements StudentRepository {
  private readonly http = inject(HttpClient);
  private readonly binding = inject(STUDENT_API);
  private readonly environment = inject(PORTAL_ENVIRONMENT);

  getPortal(): Observable<StudentData> {
    const base = this.environment.apiBaseUrl;
    if (!base) throw new Error("Configura la URL base de la API del portal.");
    const url = new URL(this.binding.url, base);
    return this.http
      .get<unknown>(url.href)
      .pipe(map(this.binding.decode));
  }
}

export const STUDENT_REPOSITORY = new InjectionToken<StudentRepository>(
  "StudentRepository",
  {
    providedIn: "root",
    factory: () =>
      inject(PORTAL_ENVIRONMENT).dataSource === "mock"
        ? inject(MockStudentRepository)
        : inject(HttpStudentRepository),
  },
);
