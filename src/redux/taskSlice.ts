import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Task } from "../types"; 

interface TaskState {
  tasks: Task[];
}

const getInitialTasks = (): Task[] => {
  try {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  } catch (error) {
    console.error("Error loading tasks from localStorage:", error);
    return [];
  }
};

const initialState: TaskState = {
  tasks: getInitialTasks(),
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<{ text: string; status: Task["status"]; priority: Task["priority"]; date: string }>) => {
      const newTask: Task = {
        id: Date.now(),
        text: action.payload.text,
        status: action.payload.status,
        completed: false,
        priority: action.payload.priority,
        date: action.payload.date,
      };
      state.tasks.push(newTask);
    },
    
    deleteTask: (state, action: PayloadAction<number>) => {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload);
    },
    
    editTask: (state, action: PayloadAction<{ id: number; text: string; priority: Task["priority"]; date: string }>) => {
      const taskIndex = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (taskIndex !== -1) {
        state.tasks[taskIndex] = {
          ...state.tasks[taskIndex],
          text: action.payload.text,
          priority: action.payload.priority,
          date: action.payload.date || state.tasks[taskIndex].date,
        };
      }
    },
    
    toggleComplete: (state, action: PayloadAction<number>) => {
      const taskIndex = state.tasks.findIndex((t) => t.id === action.payload);
      if (taskIndex !== -1) {
        state.tasks[taskIndex].completed = !state.tasks[taskIndex].completed;
      }
    },
    
    reorderTasks: (
      state,
      action: PayloadAction<{ 
        taskId: number;
        sourceIndex: number; 
        destinationIndex: number; 
        sourceStatus: Task["status"]; 
        destinationStatus: Task["status"] 
      }>
    ) => {
      const { taskId, sourceStatus, destinationStatus,  destinationIndex } = action.payload;
      
     
      const taskIndex = state.tasks.findIndex(task => task.id === taskId);
      if (taskIndex === -1) return;
      
  
      const [taskToMove] = state.tasks.splice(taskIndex, 1);
      
      
      if (sourceStatus !== destinationStatus) {
        taskToMove.status = destinationStatus;
      }
      
     
      const tasksInDestination = state.tasks.filter(
        task => task.status === destinationStatus
      );
      
     
      if (destinationIndex >= tasksInDestination.length) {
       
        state.tasks.push(taskToMove);
      } else {
       
        const destinationTask = tasksInDestination[destinationIndex];
        const insertIndex = state.tasks.findIndex(task => task.id === destinationTask.id);
        state.tasks.splice(insertIndex, 0, taskToMove);
      }
    },
    
    sortTasks: (state, action: PayloadAction<{ criteria: "status" | "date" | "priority" }>) => {
      if (action.payload.criteria === "status") {
        state.tasks.sort((a, b) => a.status.localeCompare(b.status));
      } else if (action.payload.criteria === "date") {
        state.tasks.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      } else if (action.payload.criteria === "priority") {
        const priorityOrder = { Low: 0, Medium: 1, High: 2 };
        state.tasks.sort(
          (a, b) => 
            (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) - 
            (priorityOrder[b.priority as keyof typeof priorityOrder] || 0)
        );
      }
    },
  },
});

export const { 
  addTask, 
  deleteTask, 
  toggleComplete, 
  reorderTasks, 
  editTask, 
  sortTasks 
} = taskSlice.actions;

export default taskSlice.reducer;