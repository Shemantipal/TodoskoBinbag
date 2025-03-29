export interface Task {
  id: number;
  text: string;
  status: "not-started" | "in-progress" | "completed";
  completed: boolean;
  priority: "Low" | "Medium" | "High";
  date: string;
}
