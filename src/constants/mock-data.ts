export interface MockSubject {
  id: string
  courseCode: string
  name: string
  department: string
  description: string
}

export const MOCK_SUBJECTS: MockSubject[] = [
  {
    id: "cs-001",
    courseCode: "CSC-101",
    name: "Foundations of Computer Science",
    department: "Computer Science",
    description:
      "An introductory course that covers programming logic, algorithm design, and core computing concepts for first-year CS students.",
  },
  {
    id: "math-201",
    courseCode: "MTH-201",
    name: "Discrete Mathematics",
    department: "Mathematics",
    description:
      "A survey of discrete structures, including logic, sets, relations, graphs, and combinatorics, with applications to computing and proofs.",
  },
  {
    id: "eng-150",
    courseCode: "ENG-150",
    name: "Introduction to Literary Studies",
    department: "English",
    description:
      "A course exploring close reading, literary theory, and critical writing through representative works from poetry, drama, and prose.",
  },
]
