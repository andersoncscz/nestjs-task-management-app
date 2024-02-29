import { Test, TestingModule } from '@nestjs/testing';
import { MyLogger } from '../logger/my-logger.service';
import { TasksRepository } from './tasks.repository';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Task } from './task.entity';
import { TASK_REPOSITORY } from './task.constants';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { user } from '../users/users.test-data';
import { tasks } from './tasks.test-data';
import { TaskStatus } from './types/task.status.enum';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../users/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskTitleDto } from './dto/update-task-title.dto';
import { UpdateTaskDescriptionDto } from './dto/update-task-description.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';

describe('TasksRepository', () => {
  let tasksRepository: TasksRepository;
  let repository: Repository<Task>;
  let myLogger: MyLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksRepository,
        {
          provide: TASK_REPOSITORY,
          useClass: Repository,
        },
        {
          provide: MyLogger,
          useValue: {
            setContext: jest.fn(),
            error: jest.fn(),
            verbose: jest.fn(),
          },
        },
      ],
    }).compile();

    tasksRepository = module.get<TasksRepository>(TasksRepository);
    repository = module.get<Repository<Task>>(TASK_REPOSITORY);
    myLogger = module.get<MyLogger>(MyLogger);
  });

  it('should be defined', () => {
    expect(tasksRepository).toBeDefined();
  });

  it('should have dependencies defined', () => {
    expect(repository).toBeDefined();
    expect(myLogger).toBeDefined();
  });

  describe('findAll', () => {
    it("should return all user's tasks", async () => {
      const getTasksFilterDto: GetTasksFilterDto = {
        search: 'my tasks',
        status: TaskStatus.OPEN,
      };

      const myUser: User = {
        ...user,
        tasks: tasks.filter((task) => task.status === getTasksFilterDto.status),
      };

      const mockedQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(myUser.tasks),
      } as unknown as SelectQueryBuilder<Task>;

      jest
        .spyOn(repository, 'createQueryBuilder')
        .mockReturnValue(mockedQueryBuilder);

      const allTasks = await tasksRepository.findAll(getTasksFilterDto, myUser);

      expect(allTasks).toBe<Task[]>(myUser.tasks);
    });

    it('should log the error and throw an InternalServerErrorException when an error happens', async () => {
      const error = new Error('Ooops! Something went wrong');
      const getTasksFilterDto: GetTasksFilterDto = {
        search: 'my tasks',
        status: TaskStatus.OPEN,
      };
      const myUser: User = {
        ...user,
        tasks: tasks.filter((task) => task.status === getTasksFilterDto.status),
      };

      const mockedQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockRejectedValue(error),
      } as unknown as SelectQueryBuilder<Task>;

      jest
        .spyOn(repository, 'createQueryBuilder')
        .mockReturnValue(mockedQueryBuilder);

      await expect(
        tasksRepository.findAll(getTasksFilterDto, myUser),
      ).rejects.toThrow(InternalServerErrorException);

      expect(myLogger.error).toHaveBeenCalledWith(
        `Failed to get tasks for user "${myUser.id}". Filters: ${JSON.stringify(getTasksFilterDto)}.`,
        error.stack,
      );
    });
  });

  describe('findById', () => {
    it("should return a user's task by the task id", async () => {
      const myUser: User = {
        ...user,
        tasks: [...tasks],
      };

      const expectedTask = myUser.tasks[0];
      jest.spyOn(repository, 'findOne').mockResolvedValue(expectedTask);

      const taskFound = await tasksRepository.findById(expectedTask.id, myUser);

      expect(taskFound).toBe<Task>(expectedTask);
    });

    it('should throw a NotFoundException if a task is not found with the given id', async () => {
      const myUser: User = {
        ...user,
        tasks: [...tasks],
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const taskId = 'mock-id';
      const message = `Task with ID "${taskId}" not found`;
      const error = new NotFoundException(message);

      await expect(tasksRepository.findById(taskId, myUser)).rejects.toThrow(
        error,
      );
      expect(myLogger.verbose).toHaveBeenCalledWith(message);
    });
  });

  describe('create', () => {
    it('should create and return a new task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'task 1',
        description: 'easy task',
      };

      const task = tasks[0];
      jest.spyOn(repository, 'create').mockReturnValue(task);
      jest.spyOn(repository, 'save').mockResolvedValue(task);

      const taskCreated = await tasksRepository.create(createTaskDto, user);

      expect(taskCreated).toBe(task);
    });
  });

  describe('delete', () => {
    it('should delete an existing task', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue({
        affected: 1,
        raw: {},
      });

      const taskId = 'mock-id';
      await expect(tasksRepository.delete(taskId, user)).resolves.not.toThrow();
    });

    it('should throw a NotFoundException if a task is not found with the given id', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue({
        affected: 0,
        raw: {},
      });

      const taskId = 'mock-id';
      const message = `Task with ID "${taskId}" not found`;
      const error = new NotFoundException(message);

      await expect(tasksRepository.delete(taskId, user)).rejects.toThrow(error);
      expect(myLogger.verbose).toHaveBeenCalledWith(message);
    });
  });

  describe('updateTitle', () => {
    it("should update the task's title and return the update task", async () => {
      const updateTaskTitleDto: UpdateTaskTitleDto = { title: 'new title' };
      const taskToUpdate = tasks[0];
      const expectedTask: Task = {
        ...taskToUpdate,
        title: updateTaskTitleDto.title,
      };

      jest.spyOn(tasksRepository, 'findById').mockResolvedValue(taskToUpdate);
      jest.spyOn(repository, 'save').mockResolvedValue(expectedTask);

      const taskUpdated = await tasksRepository.updateTitle({
        id: taskToUpdate.id,
        updateTaskTitleDto,
        user,
      });

      expect(taskUpdated).toEqual<Task>(expectedTask);
    });

    it('should throw a NotFoundException if a task is not found with the given id', async () => {
      const updateTaskTitleDto: UpdateTaskTitleDto = { title: 'new title' };
      const taskToUpdate = tasks[0];
      const message = `Task with ID "${taskToUpdate.id}" not found`;
      const error = new NotFoundException(message);

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(
        tasksRepository.updateTitle({
          id: taskToUpdate.id,
          updateTaskTitleDto,
          user,
        }),
      ).rejects.toThrow(error);
      expect(myLogger.verbose).toHaveBeenCalledWith(message);
    });
  });

  describe('updateDescription', () => {
    it("should update the task's description and return the update task", async () => {
      const updateTaskDescriptionDto: UpdateTaskDescriptionDto = {
        description: 'new description',
      };
      const taskToUpdate = tasks[0];
      const expectedTask: Task = {
        ...taskToUpdate,
        description: updateTaskDescriptionDto.description,
      };

      jest.spyOn(tasksRepository, 'findById').mockResolvedValue(taskToUpdate);
      jest.spyOn(repository, 'save').mockResolvedValue(expectedTask);

      const taskUpdated = await tasksRepository.updateDescription({
        id: taskToUpdate.id,
        updateTaskDescriptionDto,
        user,
      });

      expect(taskUpdated).toEqual<Task>(expectedTask);
    });

    it('should throw a NotFoundException if a task is not found with the given id', async () => {
      const updateTaskDescriptionDto: UpdateTaskDescriptionDto = {
        description: 'new description',
      };
      const taskToUpdate = tasks[0];
      const message = `Task with ID "${taskToUpdate.id}" not found`;
      const error = new NotFoundException(message);

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(
        tasksRepository.updateDescription({
          id: taskToUpdate.id,
          updateTaskDescriptionDto,
          user,
        }),
      ).rejects.toThrow(error);
      expect(myLogger.verbose).toHaveBeenCalledWith(message);
    });
  });

  describe('updateStatus', () => {
    it("should update the task's status and return the update task", async () => {
      const updateTaskStatusDto: UpdateTaskStatusDto = {
        status: TaskStatus.DONE,
      };
      const taskToUpdate = tasks[0];
      const expectedTask: Task = {
        ...taskToUpdate,
        status: updateTaskStatusDto.status,
      };

      jest.spyOn(tasksRepository, 'findById').mockResolvedValue(taskToUpdate);
      jest.spyOn(repository, 'save').mockResolvedValue(expectedTask);

      const taskUpdated = await tasksRepository.updateStatus({
        id: taskToUpdate.id,
        updateTaskStatusDto,
        user,
      });

      expect(taskUpdated).toEqual<Task>(expectedTask);
    });

    it('should throw a NotFoundException if a task is not found with the given id', async () => {
      const updateTaskStatusDto: UpdateTaskStatusDto = {
        status: TaskStatus.DONE,
      };
      const taskToUpdate = tasks[0];
      const message = `Task with ID "${taskToUpdate.id}" not found`;
      const error = new NotFoundException(message);

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(
        tasksRepository.updateStatus({
          id: taskToUpdate.id,
          updateTaskStatusDto,
          user,
        }),
      ).rejects.toThrow(error);
      expect(myLogger.verbose).toHaveBeenCalledWith(message);
    });
  });
});
