import { DEMO_ORGANIZATION, DEMO_STAFF } from "@/domain/constants";
import type { ApplicationTask, Student, TaskStatus } from "@/domain/models";

const STATUS: Record<string, TaskStatus> = { ns: "not_started", ip: "in_progress", bl: "blocked", dn: "done" };
const BASE_DATE = new Date(2026, 6, 13, 12, 0, 0, 0);

function dateAt(offset: number) {
  const date = new Date(BASE_DATE);
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type RawTask = [string, keyof typeof STATUS, number, string?];
type RawStudent = { name: string; email: string; phone: string; intake: string; consultant: number; tasks: RawTask[] };

const RAW: RawStudent[] = [
  { name: "Aarav Sharma", email: "aarav.sharma@gmail.com", phone: "+91 98200 11234", intake: "Winter 2026", consultant: 0, tasks: [["APS","dn",-60],["IELTS","dn",-45],["GRE","ip",-3],["SOP","ip",5],["LOR 1","dn",-30],["LOR 2","ns",-1],["Blocked Account","ns",14],["Health Insurance","ns",30],["Visa Appointment","ns",20],["Uni-Assist Submission","ip",-5,"TU Munich"],["Uni-Assist Submission","ns",2,"RWTH Aachen"]] },
  { name: "Diya Patel", email: "diya.patel@gmail.com", phone: "+91 99870 44521", intake: "Summer 2027", consultant: 1, tasks: [["APS","dn",-50],["IELTS","dn",-40],["GRE","dn",-35],["SOP","ip",60],["LOR 1","dn",-20],["LOR 2","ip",45],["Blocked Account","ns",120],["Health Insurance","ns",150],["Visa Appointment","ns",140],["Uni-Assist Submission","ip",90,"TU Berlin"],["Uni-Assist Submission","ns",95,"Uni Stuttgart"]] },
  { name: "Ishaan Gupta", email: "ishaan.g@outlook.com", phone: "+91 90045 78210", intake: "Winter 2026", consultant: 2, tasks: [["APS","dn",-70],["IELTS","dn",-60],["GRE","dn",-55],["SOP","dn",-20],["LOR 1","dn",-30],["LOR 2","dn",-25],["Blocked Account","ip",6],["Health Insurance","ns",25],["Visa Appointment","ip",4],["Uni-Assist Submission","dn",-10,"KIT"],["Uni-Assist Submission","dn",-8,"TU Darmstadt"]] },
  { name: "Ananya Reddy", email: "ananya.reddy@gmail.com", phone: "+91 96320 11987", intake: "Winter 2027", consultant: 0, tasks: [["APS","ip",40],["IELTS","ns",60],["GRE","ns",55],["SOP","ns",90],["LOR 1","ns",80],["LOR 2","ns",80],["Blocked Account","ns",200],["Health Insurance","ns",210],["Visa Appointment","ns",205],["Uni-Assist Submission","ns",120,"LMU Munich"]] },
  { name: "Vivaan Singh", email: "vivaan.singh@gmail.com", phone: "+91 98111 66540", intake: "Winter 2026", consultant: 1, tasks: [["APS","ns",-10],["IELTS","dn",-40],["GRE","ns",-2],["SOP","bl",3],["LOR 1","dn",-25],["LOR 2","ns",8],["Blocked Account","bl",-6],["Health Insurance","ns",20],["Visa Appointment","ns",12],["Uni-Assist Submission","ns",-1,"TU Dresden"],["Uni-Assist Submission","ns",1,"Uni Mannheim"],["Uni-Assist Submission","ns",10,"RWTH Aachen"]] },
  { name: "Saanvi Iyer", email: "saanvi.iyer@gmail.com", phone: "+91 97400 33218", intake: "Summer 2027", consultant: 2, tasks: [["APS","dn",-30],["IELTS","ip",5],["GRE","ns",30],["SOP","ns",40],["LOR 1","dn",-20],["LOR 2","ip",20],["Blocked Account","ns",130],["Health Insurance","ns",140],["Visa Appointment","ns",135],["Uni-Assist Submission","ip",50,"Uni Heidelberg"],["Uni-Assist Submission","ns",55,"TU Munich"]] },
  { name: "Kabir Nair", email: "kabir.nair@gmail.com", phone: "+91 99620 45510", intake: "Winter 2026", consultant: 0, tasks: [["APS","dn",-80],["IELTS","dn",-70],["GRE","dn",-65],["SOP","dn",-40],["LOR 1","dn",-50],["LOR 2","dn",-45],["Blocked Account","ns",-4],["Health Insurance","ip",-2],["Visa Appointment","ns",6],["Uni-Assist Submission","dn",-15,"TU Berlin"]] },
  { name: "Myra Joshi", email: "myra.joshi@gmail.com", phone: "+91 98330 22140", intake: "Summer 2027", consultant: 1, tasks: [["APS","ip",70],["IELTS","dn",-10],["GRE","ns",80],["SOP","ns",100],["LOR 1","ip",60],["LOR 2","ns",65],["Blocked Account","ns",160],["Health Insurance","ns",170],["Visa Appointment","ns",165],["Uni-Assist Submission","ip",110,"KIT"]] },
];

export function createSeedStudents(): Student[] {
  return RAW.map((raw, studentIndex) => {
    const tasks: ApplicationTask[] = raw.tasks.map((task, taskIndex) => ({
      id: `task_${studentIndex + 1}_${taskIndex + 1}`,
      name: task[0],
      status: STATUS[task[1]],
      dueDate: dateAt(task[2]),
      university: task[3] ?? null,
    }));
    return {
      id: `student_${studentIndex + 1}`,
      organizationId: DEMO_ORGANIZATION.id,
      name: raw.name,
      email: raw.email,
      phone: raw.phone,
      targetIntake: raw.intake,
      assignedConsultantId: DEMO_STAFF[raw.consultant].id,
      targetUniversities: tasks.filter((task) => task.university).map((task) => task.university as string),
      tasks,
    };
  });
}

export function createTaskDate(offset: number) {
  return dateAt(offset);
}
