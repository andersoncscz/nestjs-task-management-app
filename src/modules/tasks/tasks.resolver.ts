/* eslint-disable @typescript-eslint/no-unused-vars */
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Task } from './task.model';
import { TasksService } from './tasks.service';
import { MyLogger } from '../logger/my-logger.service';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CustomContext } from 'src/types/custom-graphql-context.type';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskTitleInput } from './types/update-task-title.input';
import { UpdateTaskTitleDto } from './dto/update-task-title.dto';
import { UpdateTaskDescriptionDto } from './dto/update-task-description.dto';
import { UpdateTaskDescriptionInput } from './types/update-task-description.input';
import { UpdateTaskStatusInput } from './types/update-task-status.input';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';

@Resolver((of) => Task)
@UseGuards(JwtAuthGuard)
export class TasksResolver {
  constructor(
    private readonly tasksService: TasksService,
    private logger: MyLogger,
  ) {
    this.logger.setContext(TasksResolver.name);
  }

  @Query((returns) => [Task])
  async getTasks(
    @Args('getTasksFilterInput') getTasksFilterInput: GetTasksFilterDto,
    @Context() { req }: CustomContext,
  ): Promise<Task[]> {
    const { user } = req;
    return this.tasksService.getTasks(getTasksFilterInput, user);
  }

  @Query((returns) => Task)
  async getTaskById(
    @Args('id') id: string,
    @Context() { req }: CustomContext,
  ): Promise<Task> {
    const { user } = req;
    return this.tasksService.getTaskById(id, user);
  }

  @Mutation((returns) => Task)
  async createTask(
    @Args('createTaskInput') createTaskInput: CreateTaskDto,
    @Context() { req }: CustomContext,
  ): Promise<Task> {
    const { user } = req;
    return this.tasksService.createTask(createTaskInput, user);
  }

  @Mutation((returns) => Boolean, { nullable: true })
  async deleteTask(
    @Args('id') id: string,
    @Context() { req }: CustomContext,
  ): Promise<void> {
    const { user } = req;
    return this.tasksService.deleteTask(id, user);
  }

  @Mutation((returns) => Task)
  async updateTaskTitle(
    @Args('updateTaskTitleInput') updateTaskTitleInput: UpdateTaskTitleInput,
    @Context() { req }: CustomContext,
  ): Promise<Task> {
    const { user } = req;
    const { id, title } = updateTaskTitleInput;
    const updateTaskTitleDto: UpdateTaskTitleDto = { title };

    return this.tasksService.updateTaskTitle({
      id,
      updateTaskTitleDto,
      user,
    });
  }

  @Mutation((returns) => Task)
  async updateTaskDescription(
    @Args('updateTaskDescriptionInput')
    updateTaskDescriptionInput: UpdateTaskDescriptionInput,
    @Context() { req }: CustomContext,
  ): Promise<Task> {
    const { user } = req;
    const { id, description } = updateTaskDescriptionInput;
    const updateTaskDescriptionDto: UpdateTaskDescriptionDto = { description };

    return this.tasksService.updateTaskDescription({
      id,
      updateTaskDescriptionDto,
      user,
    });
  }

  @Mutation((returns) => Task)
  async updateTaskStatus(
    @Args('updateTaskStatusInput')
    updateTaskStatusInput: UpdateTaskStatusInput,
    @Context() { req }: CustomContext,
  ): Promise<Task> {
    const { user } = req;
    const { id, status } = updateTaskStatusInput;
    const updateTaskStatusDto: UpdateTaskStatusDto = { status };

    return this.tasksService.updateTaskStatus({
      id,
      updateTaskStatusDto,
      user,
    });
  }
}
