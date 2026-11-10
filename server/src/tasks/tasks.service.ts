import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

const taskSelect = {
  id: true,
  title: true,
  notes: true,
  completed: true,
  dueDate: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TaskSelect;

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.task.findMany({
      where: { userId },
      select: taskSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  create(userId: string, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        userId,
        title: dto.title,
        notes: dto.notes ?? null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
      select: taskSelect,
    });
  }

  async update(userId: string, id: string, dto: UpdateTaskDto) {
    await this.ensureOwner(userId, id);
    return this.prisma.task.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        ...(dto.completed !== undefined ? { completed: dto.completed } : {}),
        ...(dto.dueDate !== undefined
          ? { dueDate: dto.dueDate ? new Date(dto.dueDate) : null }
          : {}),
      },
      select: taskSelect,
    });
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.ensureOwner(userId, id);
    await this.prisma.task.delete({ where: { id } });
  }

  private async ensureOwner(userId: string, id: string): Promise<void> {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!task) {
      throw new NotFoundException('Task not found.');
    }
  }
}
