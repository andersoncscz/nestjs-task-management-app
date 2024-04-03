import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDescriptionDto } from './dto/update-task-description.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { UpdateTaskTitleDto } from './dto/update-task-title.dto';
import { Task } from './task.entity';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/user.entity';
import { MyLogger } from '../logger/my-logger.service';

@Controller('/api/tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private logger: MyLogger,
  ) {
    this.logger.setContext(TasksController.name);
  }

  @Get()
  async getTasks(
    @Query() getTasksFilterDto: GetTasksFilterDto,
    @GetUser() user: User,
  ): Promise<Task[]> {
    this.logger.verbose(
      `User "${user.id}" is requesting all tasks. Filters: ${JSON.stringify(getTasksFilterDto)}`,
    );

    return this.tasksService.getTasks(getTasksFilterDto, user);
  }

  @Get('/:id/')
  async getTaskById(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<Task> {
    this.logger.verbose(`User "${user.id}" is requesting the task "${id}"`);

    return this.tasksService.getTaskById(id, user);
  }

  @Post()
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser() user: User,
  ): Promise<Task> {
    console.log(createTaskDto);
    this.logger.verbose(
      `User "${user.id}" is creating a new task with params ${JSON.stringify(createTaskDto)}`,
    );

    return this.tasksService.createTask(createTaskDto, user);
  }

  @Delete('/:id/')
  async deleteTask(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<void> {
    this.logger.verbose(`User "${user.id}" is deleting the task "${id}"`);

    return this.tasksService.deleteTask(id, user);
  }

  @Patch('/:id/title')
  async updateTaskTitle(
    @Param('id') id: string,
    @Body() updateTaskTitleDto: UpdateTaskTitleDto,
    @GetUser() user: User,
  ): Promise<Task> {
    this.logger.verbose(
      `User "${user.id}" is updating the title of the task "${id}" to "${updateTaskTitleDto.title}"`,
    );

    return this.tasksService.updateTaskTitle({ id, updateTaskTitleDto, user });
  }

  @Patch('/:id/description')
  async updateTaskDescription(
    @Param('id') id: string,
    @Body() updateTaskDescriptionDto: UpdateTaskDescriptionDto,
    @GetUser() user: User,
  ): Promise<Task> {
    this.logger.verbose(
      `User "${user.id}" is updating the description of the task "${id}" to "${updateTaskDescriptionDto.description}"`,
    );

    return this.tasksService.updateTaskDescription({
      id,
      updateTaskDescriptionDto,
      user,
    });
  }

  @Patch('/:id/status')
  async updateTaskStatus(
    @Param('id') id: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
    @GetUser() user: User,
  ): Promise<Task> {
    this.logger.verbose(
      `User "${user.id}" is updating the status of the task "${id}" to "${updateTaskStatusDto.status}"`,
    );

    return await this.tasksService.updateTaskStatus({
      id,
      updateTaskStatusDto,
      user,
    });
  }
}
