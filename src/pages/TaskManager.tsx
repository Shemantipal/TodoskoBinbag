import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addTask, deleteTask, reorderTasks, editTask } from "../redux/taskSlice";
import { RootState } from "../redux/store";
import { Task } from "../types";
import { Delete, Add, Edit, DragIndicator, AccessTime, Flag, CalendarMonth } from "@mui/icons-material";
import { RainbowButton } from "../components/magicui/rainbow-button";

interface DragState {
  taskId: number | null;
  sourceStatus: Task["status"] | null;
}

const TaskManager: React.FC = () => {
  const dispatch = useDispatch();
  const tasks: Task[] = useSelector((state: RootState) => state.tasks.tasks);
  const [newTasks, setNewTasks] = useState<Record<Task["status"], { text: string; priority: Task["priority"]; dueDate: string }>>({
    "not-started": { text: "", priority: "Medium", dueDate: formatDateForInput(new Date()) },
    "in-progress": { text: "", priority: "Medium", dueDate: formatDateForInput(new Date()) },
    "completed": { text: "", priority: "Medium", dueDate: formatDateForInput(new Date()) },
  });

  const [editingTask, setEditingTask] = useState<{
    id: number | null;
    text: string;
    priority: Task["priority"];
    dueDate: string;
  }>({ id: null, text: "", priority: "Medium", dueDate: "" });
  const [filterStatus, setFilterStatus] = useState<"all" | Task["status"]>("all");
  const [sortCriteria, setSortCriteria] = useState<"date-newest" | "date-oldest" | "priority-high" | "priority-low">("date-newest");
  const [dragState, setDragState] = useState<DragState>({ taskId: null, sourceStatus: null });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Helper function to format date for input
  function formatDateForInput(date: Date): string {
    try {
      // Format as YYYY-MM-DDThh:mm
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return new Date().toISOString().slice(0, 16);
    }
  }

  // Helper function to convert input date to ISO string
  function convertInputDateToISO(inputDate: string): string {
    if (!inputDate) return new Date().toISOString();
    return new Date(inputDate).toISOString();
  }

  const handleAddTask = (status: Task["status"]) => {
    if (newTasks[status].text.trim()) {
      dispatch(addTask({
        text: newTasks[status].text,
        status,
        priority: newTasks[status].priority,
        date: convertInputDateToISO(newTasks[status].dueDate)
      }));
      setNewTasks((prev) => ({
        ...prev,
        [status]: { text: "", priority: "Medium", dueDate: formatDateForInput(new Date()) }
      }));
    }
  };

  const handleDeleteTask = (id: number) => {
    dispatch(deleteTask(id));
  };

  const handleEditTask = (task: Task) => {
    console.log("Original task date:", task.date);
    const formattedDate = formatDateForInput(new Date(task.date));
    console.log("Formatted date for input:", formattedDate);

    setEditingTask({
      id: task.id,
      text: task.text,
      priority: task.priority,
      dueDate: formattedDate
    });
  };

  const handleSaveEdit = (id: number) => {
    console.log("Saving task with priority:", editingTask.priority);
    console.log("Saving task with due date:", editingTask.dueDate);

    if (editingTask.text.trim()) {
      dispatch(editTask({
        id,
        text: editingTask.text,
        priority: editingTask.priority,
        date: convertInputDateToISO(editingTask.dueDate)
      }));
      setEditingTask({ id: null, text: "", priority: "Medium", dueDate: "" });
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, taskId: number, status: Task["status"]) => {
    setDragState({ taskId, sourceStatus: status });
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", taskId.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLUListElement | HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLUListElement | HTMLDivElement>, targetStatus: Task["status"]) => {
    e.preventDefault();
    setIsDragging(false);

    if (!dragState.taskId || !dragState.sourceStatus) return;

    const taskId = dragState.taskId;
    const sourceStatus = dragState.sourceStatus;

    if (sourceStatus === targetStatus) return;

    const sourceTasks = tasks.filter(task => task.status === sourceStatus);
    const targetTasks = tasks.filter(task => task.status === targetStatus);

    const sourceIndex = sourceTasks.findIndex(task => task.id === taskId);
    const targetIndex = targetTasks.length;

    dispatch(
      reorderTasks({
        taskId,
        sourceIndex,
        destinationIndex: targetIndex,
        sourceStatus,
        destinationStatus: targetStatus,
      })
    );

    setDragState({ taskId: null, sourceStatus: null });
  };

  const columns = [
    { id: "not-started", title: "Not Started", bg: "bg-red-50", border: "border-red-400", headerBg: "bg-red-500", hoverBg: "hover:bg-red-100" },
    { id: "in-progress", title: "In Progress", bg: "bg-yellow-50", border: "border-yellow-400", headerBg: "bg-yellow-500", hoverBg: "hover:bg-yellow-100" },
    { id: "completed", title: "Completed", bg: "bg-green-50", border: "border-green-400", headerBg: "bg-green-500", hoverBg: "hover:bg-green-100" },
  ] as const;

  const sortTasks = (tasksToSort: Task[]) => {
    return [...tasksToSort].sort((a, b) => {
      if (sortCriteria === "date-newest") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortCriteria === "date-oldest") return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortCriteria === "priority-high") {
        const priorityOrder: Record<string, number> = { Low: 0, Medium: 1, High: 2 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      if (sortCriteria === "priority-low") {
        const priorityOrder: Record<string, number> = { Low: 0, Medium: 1, High: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return 0;
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "text-red-600";
      case "Medium": return "text-yellow-600";
      case "Low": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const getPriorityBgColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-100";
      case "Medium": return "bg-yellow-100";
      case "Low": return "bg-green-100";
      default: return "bg-gray-100";
    }
  };

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };

    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    return date.toLocaleString(undefined, options);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-purple-300 to-purple-700 px-4 py-8">
      <div className="flex justify-center my-6 font-mono">
        <RainbowButton>Manage. Prioritize. Conquer.</RainbowButton>
      </div>

      <div className="bg-slate-300 backdrop-blur-sm p-6 border-black border-4 rounded-xl shadow-lg w-full max-w-7xl mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="filter-status" className="block text-sm font-medium text-black">Filter by Status</label>
            <select
              id="filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "all" | Task["status"])}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none hover:border-gray-400 transition-all"
            >
              <option value="all">All Tasks</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="sort-criteria" className="block text-sm font-medium text-black">Sort by</label>
            <select
              id="sort-criteria"
              value={sortCriteria}
              onChange={(e) => setSortCriteria(e.target.value as typeof sortCriteria)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none hover:border-gray-400 transition-all"
            >
              <option value="date-newest">Newest First</option>
              <option value="date-oldest">Oldest First</option>
              <option value="priority-high">High Priority First</option>
              <option value="priority-low">Low Priority First</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-8xl items-start">
        {columns.map(({ id, title, bg, border, headerBg, hoverBg }) => (
          <div
            key={id}
            className={`bg-white/90 backdrop-blur-sm shadow-2xl border-black border-4 rounded-xl overflow-hidden transition-all duration-300 ${isDragging ? 'ring-2 ring-offset-2 ring-indigo-400' : ''}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, id)}
          >
            <div className={`${headerBg} p-4`}>
              <h2 className="text-2xl font-bold text-center text-white">{title}</h2>
            </div>

            <div className="p-6">
              <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Add New Task</h3>
                <div className="flex flex-col gap-3 w-full">
                  <input
                    type="text"
                    placeholder="Task description"
                    value={newTasks[id].text}
                    onChange={(e) => setNewTasks((prev) => ({
                      ...prev,
                      [id]: { ...prev[id], text: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 hover:border-gray-400 transition-all"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask(id)}
                    aria-label="Task description"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="relative">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
                      <select
                        value={newTasks[id].priority}
                        onChange={(e) => setNewTasks((prev) => ({
                          ...prev,
                          [id]: { ...prev[id], priority: e.target.value as Task["priority"] }
                        }))}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none hover:border-gray-400 transition-all appearance-none"
                        aria-label="Task priority"
                      >
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority</option>
                      </select>
                      <Flag className="absolute right-3 top-7 text-gray-400 pointer-events-none" />
                    </div>

                    <div className="relative">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Due Date</label>
                      <input
                        type="datetime-local"
                        value={newTasks[id].dueDate}
                        onChange={(e) => setNewTasks((prev) => ({
                          ...prev,
                          [id]: { ...prev[id], dueDate: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none hover:border-gray-400 transition-all"
                        aria-label="Task due date"
                      />
                      <CalendarMonth className="absolute right-3 top-7 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddTask(id)}
                    className="w-full bg-indigo-600 hover:bg-indigo-900 text-white py-2 px-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <Add /> Add Task
                  </button>
                </div>
              </div>

              <ul
                className={`space-y-4 min-h-[200px] transition-all duration-300 ${isDragging ? `${hoverBg} p-4 rounded-lg` : ''}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, id)}
              >
                {sortTasks(tasks.filter((task) =>
                  task.status === id && (filterStatus === "all" || task.status === filterStatus)
                )).map((task) => (
                  <li
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id, task.status)}
                    onDragEnd={handleDragEnd}
                    className={`group p-4 rounded-xl shadow-md border ${border} ${bg} 
                      hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-move
                      relative overflow-hidden`}
                  >
                    <div className={`absolute inset-0 w-1 ${getPriorityBgColor(task.priority)}`}></div>
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DragIndicator className="text-gray-400" />
                    </div>

                    {editingTask.id === task.id ? (
                      <div className="flex flex-col gap-3 pl-2">
                        <input
                          type="text"
                          value={editingTask.text}
                          onChange={(e) => setEditingTask((prev) => ({ ...prev, text: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 hover:border-gray-400 transition-all"
                          autoFocus
                          aria-label="Edit task description"
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="relative">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
                            <select
                              value={editingTask.priority}
                              onChange={(e) => setEditingTask((prev) => ({
                                ...prev,
                                priority: e.target.value as Task["priority"]
                              }))}
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none hover:border-gray-400 transition-all appearance-none"
                              aria-label="Edit task priority"
                            >
                              <option value="Low">Low Priority</option>
                              <option value="Medium">Medium Priority</option>
                              <option value="High">High Priority</option>
                            </select>
                            <Flag className="absolute right-3 top-7 text-gray-400 pointer-events-none" />
                          </div>

                          <div className="relative">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Due Date</label>
                            <input
                              type="datetime-local"
                              value={editingTask.dueDate}
                              onChange={(e) => setEditingTask((prev) => ({
                                ...prev,
                                dueDate: e.target.value
                              }))}
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none hover:border-gray-400 transition-all"
                              aria-label="Edit task due date"
                            />
                            <CalendarMonth className="absolute right-3 top-7 text-gray-400 pointer-events-none" />
                          </div>
                        </div>

                        <button
                          onClick={() => handleSaveEdit(task.id)}
                          className="w-full bg-indigo-600 hover:bg-indigo-800 text-white py-2 px-4 rounded-lg shadow-md transition-all hover:shadow-lg mt-2 font-medium flex items-center justify-center gap-2"
                        >
                          <Edit className="w-4 h-4" /> Save Changes
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 pl-4">
                        <span className="text-lg text-gray-800 font-medium">{task.text}</span>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getPriorityBgColor(task.priority)} bg-opacity-50`}>
                            <Flag className={`w-3 h-3 ${getPriorityColor(task.priority)}`} />
                            <span className={`${getPriorityColor(task.priority)} font-medium text-xs`}>
                              {task.priority}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                            <AccessTime className="w-3 h-3 text-gray-500" />
                            <span className="text-gray-600 text-xs">
                              {formatDate(task.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {editingTask.id !== task.id && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditTask(task)}
                          className="p-1 rounded-lg hover:bg-indigo-100 text-indigo-600 transition-colors"
                          aria-label="Edit task"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                          aria-label="Delete task"
                        >
                          <Delete className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </li>
                ))}
                {tasks.filter(task => task.status === id && (filterStatus === "all" || task.status === filterStatus)).length === 0 && (
                  <div className="text-center py-8 text-gray-400 italic">
                    No tasks in this column
                  </div>
                )}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskManager;