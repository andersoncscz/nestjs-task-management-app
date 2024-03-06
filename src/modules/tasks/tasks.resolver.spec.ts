import { Test, TestingModule } from '@nestjs/testing';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { taskDone, taskInProgress, taskOpen, tasks } from './tasks.test-data';
import { TaskStatus } from './types/task.status.enum';
import { MyLogger } from '../logger/my-logger.service';
import { TasksResolver } from './tasks.resolver';
import { TasksService } from './tasks.service';
import { user } from '../users/users.test-data';
import { CustomContext } from '../../types/custom-graphql-context.type';

describe('TasksResolver', () => {
  let tasksResolver: TasksResolver;
  let tasksService: TasksService;

  const contextMock = {
    req: {
      user,
    },
  } as unknown as CustomContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksResolver,
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

    tasksResolver = module.get<TasksResolver>(TasksResolver);
    tasksService = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(tasksResolver).toBeDefined();
  });

  describe('getTasks', () => {
    it("should call 'getTasks' from TasksService class and returns an array of tasks", async () => {
      const filterDto: GetTasksFilterDto = {};
      const response = await tasksResolver.getTasks(filterDto, contextMock);

      expect(tasksService.getTasks).toHaveBeenCalledWith(filterDto, user);
      expect(response).toEqual(tasks);
    });
  });
});
