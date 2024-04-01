import { Test, TestingModule } from '@nestjs/testing';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { taskDone, taskInProgress, taskOpen, tasks } from './tasks.test-data';
import { TaskStatus } from './types/task.status.enum';
import { MyLogger } from '../logger/my-logger.service';
import { TasksResolver } from './tasks.resolver';
import { TasksService } from './tasks.service';
import { userMock } from '../users/users.test-data';
import { CustomContext } from '../../types/custom-graphql-context.type';
import { UpdateTaskTitleInput } from './types/update-task-title.input';
import { Task } from './task.model';
import { UpdateTaskDescriptionInput } from './types/update-task-description.input';
import { UpdateTaskStatusInput } from './types/update-task-status.input';
import { createTasksServiceMock } from './tasks.test-utils';

describe('TasksResolver', () => {
  let tasksResolver: TasksResolver;
  let tasksService: TasksService;

  const contextMock = {
    req: {
      user: userMock,
    },
  } as unknown as CustomContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksResolver,
        {
          provide: TasksService,
          useValue: createTasksServiceMock({}),
        },
        {
          provide: MyLogger,
          useValue: {
            verbose: jest.fn(),
            setContext: jest.fn(),
          },
        },
      ],
    }).compile();

    tasksResolver = module.get<TasksResolver>(TasksResolver);
    tasksService = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(tasksResolver).toBeDefined();
    expect(tasksService).toBeDefined();
  });

  describe('getTasks', () => {
    it('should call underlying services and return an array of tasks', async () => {
      const filterDto: GetTasksFilterDto = {};
      const response = await tasksResolver.getTasks(filterDto, contextMock);

      expect(tasksService.getTasks).toHaveBeenCalledWith(filterDto, userMock);
      expect(response).toEqual(tasks);
    });
  });

  describe('getTaskById', () => {
    it('should call underlying services and return a task by its id', async () => {
      const response = await tasksResolver.getTaskById(
        taskDone.id,
        contextMock,
      );

      expect(tasksService.getTaskById).toHaveBeenCalled();
      expect(response).toBe(taskDone);
    });
  });

  describe('createTask', () => {
    it('should call underlying services, create and return a new task', async () => {
      const response = await tasksResolver.createTask(taskOpen, contextMock);

      expect(tasksService.createTask).toHaveBeenCalled();
      expect(response).toBe(taskOpen);
    });
  });

  describe('deleteTask', () => {
    it('should call underlying services to delete a task', async () => {
      const response = await tasksResolver.deleteTask(taskOpen.id, contextMock);

      expect(tasksService.deleteTask).toHaveBeenCalled();
      expect(response).toBe(null);
    });
  });

  describe('updateTaskTitle', () => {
    it('should call underlying services, update the title of a task and return the updated task', async () => {
      const newTitle = 'title updated';
      const updateTaskTitleInput: UpdateTaskTitleInput = {
        id: taskOpen.id,
        title: newTitle,
      };

      const response = await tasksResolver.updateTaskTitle(
        updateTaskTitleInput,
        contextMock,
      );

      const taskUpdated: Task = {
        ...taskInProgress,
        title: newTitle,
      };

      expect(tasksService.updateTaskTitle).toHaveBeenCalledWith({
        id: taskOpen.id,
        updateTaskTitleDto: { title: newTitle },
        user: userMock,
      });
      expect(response).toEqual<Task>(taskUpdated);
    });
  });

  describe('updateTaskDescription', () => {
    it('should call underlying services, update the description of a task and return the updated task', async () => {
      const newDescription = 'description updated';
      const updateTaskTitleInput: UpdateTaskDescriptionInput = {
        id: taskOpen.id,
        description: newDescription,
      };

      const response = await tasksResolver.updateTaskDescription(
        updateTaskTitleInput,
        contextMock,
      );

      const taskUpdated: Task = {
        ...taskInProgress,
        description: newDescription,
      };

      expect(tasksService.updateTaskDescription).toHaveBeenCalledWith({
        id: taskOpen.id,
        updateTaskDescriptionDto: { description: newDescription },
        user: userMock,
      });
      expect(response).toEqual<Task>(taskUpdated);
    });
  });

  describe('updateTaskStatus', () => {
    it('should call underlying services, update the status of a task and return the updated task', async () => {
      const newStatus = TaskStatus.DONE;
      const updateTaskStatusInput: UpdateTaskStatusInput = {
        id: taskOpen.id,
        status: newStatus,
      };

      const response = await tasksResolver.updateTaskStatus(
        updateTaskStatusInput,
        contextMock,
      );

      const taskUpdated: Task = {
        ...taskInProgress,
        status: newStatus,
      };

      expect(tasksService.updateTaskStatus).toHaveBeenCalledWith({
        id: taskOpen.id,
        updateTaskStatusDto: { status: newStatus },
        user: userMock,
      });
      expect(response).toEqual<Task>(taskUpdated);
    });
  });
});
