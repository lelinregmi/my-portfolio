export interface Subject {
  id: string;
  name: string;
}

export const subjectIdFromName = (name: string) =>
  name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const subjectRouteId = (subject: Subject) =>
  subjectIdFromName(subject.name) || subject.id;

export const findSubjectByRouteId = (subjects: Subject[], routeId: string) =>
  subjects.find((subject) => subject.id === routeId)
  ?? subjects.find((subject) => subjectRouteId(subject) === routeId)
  ?? null;

const subject = (name: string): Subject => ({
  id: subjectIdFromName(name),
  name,
});

export const subjectsByGrade: Record<number, Subject[]> = {
  9: [
    subject("Computer Fundamentals"),
    subject("Operating System"),
    subject("Office Applications"),
    subject("Internet and Email"),
    subject("Computer Security"),
  ],
  10: [
    subject("Computer System"),
    subject("Number System and Boolean Logic"),
    subject("Programming"),
    subject("Web Technology"),
    subject("Database"),
    subject("Cybersecurity and Digital Citizenship"),
  ],
  11: [
    subject("Computer System and Architecture"),
    subject("Software and Programming"),
    subject("Web Technology"),
    subject("Multimedia"),
    subject("Information Security"),
  ],
  12: [
    subject("Database Management System"),
    subject("Data Structures and Algorithms"),
    subject("Computer Network"),
    subject("Software Engineering"),
    subject("Programming in C"),
    subject("Object-Oriented Programming"),
  ],
};
