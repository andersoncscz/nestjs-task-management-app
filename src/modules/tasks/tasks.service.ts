import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskTitleDto } from './dto/update-task-title.dto';
import { UpdateTaskDescriptionDto } from './dto/update-task-description.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { Task } from './task.entity';
import { TasksRepository } from './tasks.repository';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { User } from '../users/user.entity';

@Injectable()
export class TasksService {
  constructor(private taskRepository: TasksRepository) {}

  async getTasks(
    getTasksFilterDto: GetTasksFilterDto,
    user: User,
  ): Promise<Task[]> {
    return await this.taskRepository.findAll(getTasksFilterDto, user);
  }

  async getTaskById(id: string, user: User): Promise<Task> {
    return await this.taskRepository.findById(id, user);
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    return await this.taskRepository.create(createTaskDto, user);
  }

  async deleteTask(id: string, user: User): Promise<void> {
    return await this.taskRepository.delete(id, user);
  }

  async updateTaskTitle(args: {
    id: string;
    updateTaskTitleDto: UpdateTaskTitleDto;
    user: User;
  }): Promise<Task> {
    return await this.taskRepository.updateTitle(args);
  }

  async updateTaskDescription(args: {
    id: string;
    updateTaskDescriptionDto: UpdateTaskDescriptionDto;
    user: User;
  }): Promise<Task> {
    return await this.taskRepository.updateDescription(args);
  }

  async updateTaskStatus(args: {
    id: string;
    updateTaskStatusDto: UpdateTaskStatusDto;
    user: User;
  }): Promise<Task> {
    return await this.taskRepository.updateStatus(args);
  }
}
