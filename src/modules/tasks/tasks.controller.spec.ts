import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { user } from '../users/users.test-data';
import { taskDone, taskInProgress, taskOpen, tasks } from './tasks.test-data';
import { UpdateTaskTitleDto } from './dto/update-task-title.dto';
import { TaskStatus } from './types/task.status.enum';
import { Task } from './task.entity';
import { UpdateTaskDescriptionDto } from './dto/update-task-description.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { TasksController } from './tasks.controller';
import { MyLogger } from '../logger/my-logger.service';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';

describe('TasksController', () => {
  let tasksController: TasksController;
  let tasksService: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: {
            getTasks: jest.fn().mockResolvedValue(tasks),
            getTaskById: jest.fn().mockResolvedValue(taskDone),
            createTask: jest.fn().mockResolvedValue(taskOpen),
            deleteTask: jest.fn().mockResolvedValue(null),
            updateTaskTitle: jest.fn().mockResolvedValue({
              ...taskInProgress,
              title: 'title updated',
            }),
            updateTaskDescription: jest.fn().mockResolvedValue({
              ...taskInProgress,
              description: 'description updated',
            }),
            updateTaskStatus: jest.fn().mockResolvedValue({
              ...taskInProgress,
              status: TaskStatus.DONE,
            }),
          },
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
    it("should call 'getTasks' from TasksService class and returns an array of tasks", async () => {
      const filterDto: GetTasksFilterDto = {};
      const response = await tasksController.getTasks(filterDto, user);

      expect(tasksService.getTasks).toHaveBeenCalledWith(filterDto, user);
      expect(response).toBe(tasks);
    });
  });

  describe('getTaskById', () => {
    it("should call 'getTaskById' from TasksService class and returns a task by its id", async () => {
      const response = await tasksController.getTaskById(taskDone.id, user);

      expect(tasksService.getTaskById).toHaveBeenCalled();
      expect(response).toBe(taskDone);
    });
  });

  describe('createTask', () => {
    it("should call 'createTask' from TasksService class to create and return a new task", async () => {
      const response = await tasksController.createTask(taskOpen, user);

      expect(tasksService.createTask).toHaveBeenCalled();
      expect(response).toBe(taskOpen);
    });
  });

  describe('deleteTask', () => {
    it("should call 'deleteTask' from TasksService class to delete a task", async () => {
      const response = await tasksController.deleteTask(taskOpen.id, user);

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
        user,
      );

      const taskUpdated: Task = {
        ...taskInProgress,
        title,
      };

      expect(tasksService.updateTaskTitle).toHaveBeenCalledWith({
        id: taskOpen.id,
        updateTaskTitleDto,
        user,
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
        user,
      );

      const taskUpdated: Task = {
        ...taskInProgress,
        description: newDescription,
      };

      expect(tasksService.updateTaskDescription).toHaveBeenCalledWith({
        id: taskOpen.id,
        updateTaskDescriptionDto,
        user,
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
        user,
      );

      const taskUpdated: Task = {
        ...taskInProgress,
        status: newStatus,
      };

      expect(tasksService.updateTaskStatus).toHaveBeenCalledWith({
        id: taskOpen.id,
        updateTaskStatusDto,
        user,
      });
      expect(response).toEqual<Task>(taskUpdated);
    });
  });
});
