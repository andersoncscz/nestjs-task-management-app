import { taskDone, taskInProgress, taskOpen, tasks } from './tasks.test-data';
import { TaskStatus } from './types/task.status.enum';

interface CreateTasksServiceMockArgs {
  rejectOnGetTasks?: boolean;
  rejectOnGetTaskById?: boolean;
  rejectOnCreateTask?: boolean;
  rejectOnDeleteTask?: boolean;
  rejectOnUpdateTaskTitle?: boolean;
  rejectOnUpdateTaskDescription?: boolean;
  rejectOnUpdateTaskStatus?: boolean;
}

export const createTasksServiceMock = ({
  rejectOnGetTasks,
  rejectOnGetTaskById,
  rejectOnCreateTask,
  rejectOnDeleteTask,
  rejectOnUpdateTaskTitle,
  rejectOnUpdateTaskDescription,
  rejectOnUpdateTaskStatus,
}: CreateTasksServiceMockArgs) => {
  const error = new Error('Ooops!');
  const mockReject = jest.fn().mockRejectedValue(error);

  return {
    getTasks: rejectOnGetTasks
      ? mockReject
      : jest.fn().mockResolvedValue(tasks),
    getTaskById: rejectOnGetTaskById
      ? mockReject
      : jest.fn().mockResolvedValue(taskDone),
    createTask: rejectOnCreateTask
      ? mockReject
      : jest.fn().mockResolvedValue(taskOpen),
    deleteTask: rejectOnDeleteTask
      ? mockReject
      : jest.fn().mockResolvedValue(null),
    updateTaskTitle: rejectOnUpdateTaskTitle
      ? mockReject
      : jest.fn().mockResolvedValue({
          ...taskInProgress,
          title: 'title updated',
        }),
    updateTaskDescription: rejectOnUpdateTaskDescription
      ? mockReject
      : jest.fn().mockResolvedValue({
          ...taskInProgress,
          description: 'description updated',
        }),
    updateTaskStatus: rejectOnUpdateTaskStatus
      ? mockReject
      : jest.fn().mockResolvedValue({
          ...taskInProgress,
          status: TaskStatus.DONE,
        }),
  };
};
