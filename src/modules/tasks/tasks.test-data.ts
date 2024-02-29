import { Task } from './task.entity';
import { TaskStatus } from './types/task.status.enum';

export const taskOpen: Task = {
  id: '1',
  title: 'title',
  description: 'description',
  status: TaskStatus.OPEN,
};

export const taskInProgress: Task = {
  id: '2',
  title: 'title',
  description: 'description',
  status: TaskStatus.IN_PROGRESS,
};

export const taskDone: Task = {
  id: '3',
  title: 'title',
  description: 'description',
  status: TaskStatus.DONE,
};

export const tasks: Task[] = [taskOpen, taskInProgress, taskDone];
