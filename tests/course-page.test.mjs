import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { coursePage } from "../src/app/features/portal-alumno/domain/course-page.ts";

test("filtra por instructor y por tipo sin distinguir mayúsculas", () => {
  const activities = [
    { id: 1, title: "Lectura", instructor: "Erin Ahra", type: "Taller" },
    { id: 2, title: "Herbolaria", instructor: "Diana Lunar", type: "Curso" },
  ];
  assert.deepEqual(
    coursePage(activities, "ERIN", "Taller introductorio", 1, 6).currentItems,
    [activities[0]],
  );
});

test("el JSON local conserva la paginación y el estado vacío", () => {
  const mock = JSON.parse(
    readFileSync(
      new URL(
        "../src/app/features/portal-alumno/data-access/student.mock.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  const first = coursePage(mock.current, "", "Todos", 1, 6);
  const second = coursePage(mock.current, "", "Todos", 2, 6);
  assert.deepEqual(
    [...first.currentItems, ...second.currentItems],
    mock.current,
  );
  assert.equal(
    coursePage(mock.past, "sin coincidencias", "Todos", 1, 6).totalPages,
    0,
  );
});
