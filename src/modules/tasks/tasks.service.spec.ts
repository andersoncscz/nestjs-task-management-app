import { Test, TestingModule } from '@nestjs/testing';
import { TasksRepository } from './tasks.repository';
import { tasks, taskDone, taskOpen, taskInProgress } from './tasks.test-data';
import { TaskStatus } from './types/task.status.enum';
import { user } from '../users/users.test-data';
import { UpdateTaskDescriptionDto } from './dto/update-task-description.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { UpdateTaskTitleDto } from './dto/update-task-title.dto';
import { Task } from './task.entity';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let taskService: TasksService;
  let tasksRepository: TasksRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: TasksRepository,
          useValue: {
            findAll: jest.fn().mockResolvedValue(tasks),
            findById: jest.fn().mockResolvedValue(taskDone),
            create: jest.fn().mockResolvedValue(taskOpen),
            delete: jest.fn().mockResolvedValue(null),
            updateTitle: jest.fn().mockResolvedValue({
              ...taskInProgress,
              title: 'title updated',
            }),
            updateDescription: jest.fn().mockResolvedValue({
              ...taskInProgress,
              description: 'description updated',
            }),
            updateStatus: jest.fn().mockResolvedValue({
              ...taskInProgress,
              status: TaskStatus.DONE,
            }),
          },
        },
      ],
    }).compile();

    taskService = module.get<TasksService>(TasksService);
    tasksRepository = module.get<TasksRepository>(TasksRepository);
  });

  it('should be defined', () => {
    expect(taskService).toBeDefined();
  });

  describe('getTasks', () => {
    it("should call 'findAll' from TasksRepository class and returns an array of tasks", async () => {
      const response = await taskService.getTasks({}, user);

      expect(tasksRepository.findAll).toHaveBeenCalledWith({}, user);
      expect(response).toBe(tasks);
    });
  });

  describe('getTaskById', () => {
    it("should call 'findById' from TasksRepository class and returns a task by its id", async () => {
      const response = await taskService.getTaskById(taskDone.id, user);

      expect(tasksRepository.findById).toHaveBeenCalledWith(taskDone.id, user);
      expect(response).toBe(taskDone);
    });
  });

  describe('createTask', () => {
    it("should call 'create' from TasksRepository class to create and return a new task", async () => {
      const response = await taskService.createTask(taskOpen, user);

      expect(tasksRepository.create).toHaveBeenCalledWith(taskOpen, user);
      expect(response).toBe(taskOpen);
    });
  });

  describe('deleteTask', () => {
    it("should call 'delete' from TasksRepository class to delete a task", async () => {
      const response = await taskService.deleteTask(taskOpen.id, user);

      expect(tasksRepository.delete).toHaveBeenCalledWith(taskOpen.id, user);
      expect(response).toBe(null);
    });
  });

  describe('updateTaskTitle', () => {
    it("should call 'updateTitle' from TasksRepository class to update the task's title and the updated task", async () => {
      const title = 'title updated';
      const updateTaskTitleDto: UpdateTaskTitleDto = {
        title,
      };

      const updateTaskTitleArgs = {
        id: taskOpen.id,
        updateTaskTitleDto,
        user,
      };

      const response = await taskService.updateTaskTitle(updateTaskTitleArgs);

      const taskUpdated: Task = {
        ...taskInProgress,
        title,
      };

      expect(tasksRepository.updateTitle).toHaveBeenCalledWith(
        updateTaskTitleArgs,
      );
      expect(response).toEqual<Task>(taskUpdated);
    });
  });

  describe('updateTaskDescription', () => {
    it("should call 'updateTaskDescription' from TasksRepository class to update the task's description and the updated task", async () => {
      const description = 'description updated';
      const updateTaskDescriptionDto: UpdateTaskDescriptionDto = {
        description,
      };

      const updateTaskDescriptionArgs = {
        id: taskOpen.id,
        updateTaskDescriptionDto,
        user,
      };

      const response = await taskService.updateTaskDescription(
        updateTaskDescriptionArgs,
      );

      const taskUpdated: Task = {
        ...taskInProgress,
        description,
      };

      expect(tasksRepository.updateDescription).toHaveBeenCalledWith(
        updateTaskDescriptionArgs,
      );
      expect(response).toEqual<Task>(taskUpdated);
    });
  });

  describe('updateTaskStatus', () => {
    it("should call 'updateTaskStatus' from TasksRepository class to update the task's status and the updated task", async () => {
      const status = TaskStatus.DONE;
      const updateTaskStatusDto: UpdateTaskStatusDto = {
        status,
      };

      const updateTaskStatusArgs = {
        id: taskOpen.id,
        updateTaskStatusDto,
        user,
      };

      const response = await taskService.updateTaskStatus(updateTaskStatusArgs);

      const taskUpdated: Task = {
        ...taskInProgress,
        status,
      };

      expect(tasksRepository.updateStatus).toHaveBeenCalledWith(
        updateTaskStatusArgs,
      );
      expect(response).toEqual<Task>(taskUpdated);
    });
  });
});
