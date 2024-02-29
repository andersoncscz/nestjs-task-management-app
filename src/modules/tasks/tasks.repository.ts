import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TASK_REPOSITORY } from './task.constants';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './types/task.status.enum';
import { UpdateTaskDescriptionDto } from './dto/update-task-description.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { UpdateTaskTitleDto } from './dto/update-task-title.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { User } from '../users/user.entity';
import { MyLogger } from '../logger/my-logger.service';

@Injectable()
export class TasksRepository {
  constructor(
    @Inject(TASK_REPOSITORY)
    private repository: Repository<Task>,
    private myLogger: MyLogger,
  ) {
    this.myLogger.setContext(TasksRepository.name);
  }

  async findAll(
    getTasksFilterDto: GetTasksFilterDto,
    user: User,
  ): Promise<Task[]> {
    const { status, search } = getTasksFilterDto;
    const query = this.repository.createQueryBuilder('task');
    query.where({ user });

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query
        .andWhere('LOWER(task.title) LIKE LOWER(:search)', { search })
        .orWhere('LOWER(task.description) LIKE LOWER(:search)', {
          search: `%${search}%`,
        });
    }

    try {
      const tasks = await query.getMany();
      return tasks;
    } catch (error) {
      this.myLogger.error(
        `Failed to get tasks for user "${user.id}". Filters: ${JSON.stringify(getTasksFilterDto)}.`,
        error.stack,
      );

      throw new InternalServerErrorException();
    }
  }

  async findById(id: string, user: User): Promise<Task> {
    const task = await this.repository.findOne({
      where: {
        id,
        user,
      },
    });

    if (!task) {
      const message = `Task with ID "${id}" not found`;
      this.myLogger.verbose(message);
      throw new NotFoundException(message);
    }

    return task;
  }

  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;

    const newTask: Task = this.repository.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });

    await this.repository.save(newTask);

    return newTask;
  }

  async delete(id: string, user: User): Promise<void> {
    const { affected } = await this.repository.delete({ id, user });

    if (affected === 0) {
      const message = `Task with ID "${id}" not found`;
      this.myLogger.verbose(message);
      throw new NotFoundException(message);
    }
  }

  async updateTitle(args: {
    id: string;
    updateTaskTitleDto: UpdateTaskTitleDto;
    user: User;
  }): Promise<Task> {
    const { id, updateTaskTitleDto, user } = args;
    const { title } = updateTaskTitleDto;

    const taskToUpdate = await this.findById(id, user);

    taskToUpdate.title = title;

    await this.repository.save(taskToUpdate);

    return taskToUpdate;
  }

  async updateDescription(args: {
    id: string;
    updateTaskDescriptionDto: UpdateTaskDescriptionDto;
    user: User;
  }): Promise<Task> {
    const { id, updateTaskDescriptionDto, user } = args;
    const { description } = updateTaskDescriptionDto;

    const taskToUpdate = await this.findById(id, user);

    taskToUpdate.description = description;

    await this.repository.save(taskToUpdate);

    return taskToUpdate;
  }

  async updateStatus(args: {
    id: string;
    updateTaskStatusDto: UpdateTaskStatusDto;
    user: User;
  }): Promise<Task> {
    const { id, updateTaskStatusDto, user } = args;
    const { status } = updateTaskStatusDto;

    const taskToUpdate = await this.findById(id, user);

    taskToUpdate.status = status;

    await this.repository.save(taskToUpdate);

    return taskToUpdate;
  }
}
