export interface Subject {
  id: string;
  name: string;
}

export const subjectsByGrade: Record<number, Subject[]> = {
  9: [
    { id: "computer-fundamentals", name: "Computer Fundamentals" },
    { id: "operating-system", name: "Operating System" },
    { id: "office-applications", name: "Office Applications" },
    { id: "internet-and-email", name: "Internet and Email" },
    { id: "computer-security", name: "Computer Security" },
  ],
  10: [
    { id: "computer-system", name: "Computer System" },
    { id: "number-system-and-logic", name: "Number System and Boolean Logic" },
    { id: "programming", name: "Programming" },
    { id: "web-technology", name: "Web Technology" },
    { id: "database", name: "Database" },
    { id: "cybersecurity", name: "Cybersecurity and Digital Citizenship" },
  ],
  11: [
    { id: "computer-system-and-architecture", name: "Computer System and Architecture" },
    { id: "software-and-programming", name: "Software and Programming" },
    { id: "web-technology", name: "Web Technology" },
    { id: "multimedia", name: "Multimedia" },
    { id: "information-security", name: "Information Security" },
  ],
  12: [
    { id: "database-management", name: "Database Management System" },
    { id: "data-structures-and-algorithms", name: "Data Structures and Algorithms" },
    { id: "computer-network", name: "Computer Network" },
    { id: "software-engineering", name: "Software Engineering" },
    { id: "programming-in-c", name: "Programming in C" },
    { id: "object-oriented-programming", name: "Object-Oriented Programming" },
  ],
};
