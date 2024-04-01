import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { userMock } from '../users/users.test-data';
import { taskDone, taskInProgress, taskOpen, tasks } from './tasks.test-data';
import { UpdateTaskTitleDto } from './dto/update-task-title.dto';
import { TaskStatus } from './types/task.status.enum';
import { Task } from './task.entity';
import { UpdateTaskDescriptionDto } from './dto/update-task-description.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { TasksController } from './tasks.controller';
import { MyLogger } from '../logger/my-logger.service';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { createTasksServiceMock } from './tasks.test-utils';

describe('TasksController', () => {
  let tasksController: TasksController;
  let tasksService: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
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

    tasksController = module.get<TasksController>(TasksController);
    tasksService = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(tasksController).toBeDefined();
  });

  describe('getTasks', () => {
    it('should call underlying services and return an array of tasks', async () => {
      const filterDto: GetTasksFilterDto = {};
      const response = await tasksController.getTasks(filterDto, userMock);

      expect(tasksService.getTasks).toHaveBeenCalledWith(filterDto, userMock);
      expect(response).toBe(tasks);
    });
  });

  describe('getTaskById', () => {
    it('should call underlying services and return a task by its id', async () => {
      const response = await tasksController.getTaskById(taskDone.id, userMock);

      expect(tasksService.getTaskById).toHaveBeenCalled();
      expect(response).toBe(taskDone);
    });
  });

  describe('createTask', () => {
    it('should call underlying services, create and return a new task', async () => {
      const response = await tasksController.createTask(taskOpen, userMock);

      expect(tasksService.createTask).toHaveBeenCalled();
      expect(response).toBe(taskOpen);
    });
  });

  describe('deleteTask', () => {
    it("should call 'deleteTask' from TasksService class to delete a task", async () => {
      const response = await tasksController.deleteTask(taskOpen.id, userMock);

      expect(tasksService.deleteTask).toHaveBeenCalled();
      expect(response).toBe(null);
    });
  });

  describe('updateTaskTitle', () => {
    it("should call 'updateTaskTitle' from TasksService class to update the title of a task", async () => {
      const title = 'title updated';
      const updateTaskTitleDto: UpdateTaskTitleDto = {
        title,
      };

      const response = await tasksController.updateTaskTitle(
        taskOpen.id,
        updateTaskTitleDto,
        userMock,
      );

      const taskUpdated: Task = {
        ...taskInProgress,
        title,
      };

      expect(tasksService.updateTaskTitle).toHaveBeenCalledWith({
        id: taskOpen.id,
        updateTaskTitleDto,
        user: userMock,
      });
      expect(response).toEqual<Task>(taskUpdated);
    });
  });

  describe('updateTaskDescription', () => {
    it("should call 'updateTaskDescription' from TasksService class to update the description of a task", async () => {
      const newDescription = 'description updated';
      const updateTaskDescriptionDto: UpdateTaskDescriptionDto = {
        description: newDescription,
      };

      const response = await tasksController.updateTaskDescription(
        taskOpen.id,
        updateTaskDescriptionDto,
        userMock,
      );

      const taskUpdated: Task = {
        ...taskInProgress,
        description: newDescription,
      };

      expect(tasksService.updateTaskDescription).toHaveBeenCalledWith({
        id: taskOpen.id,
        updateTaskDescriptionDto,
        user: userMock,
      });
      expect(response).toEqual<Task>(taskUpdated);
    });
  });

  describe('updateTaskStatus', () => {
    it("should call 'updateTaskStatus' from TasksService class to update the status of a task", async () => {
      const newStatus = TaskStatus.DONE;
      const updateTaskStatusDto: UpdateTaskStatusDto = {
        status: newStatus,
      };

      const response = await tasksController.updateTaskStatus(
        taskOpen.id,
        updateTaskStatusDto,
        userMock,
      );

      const taskUpdated: Task = {
        ...taskInProgress,
        status: newStatus,
      };

      expect(tasksService.updateTaskStatus).toHaveBeenCalledWith({
        id: taskOpen.id,
        updateTaskStatusDto,
        user: userMock,
      });
      expect(response).toEqual<Task>(taskUpdated);
    });
  });
});
