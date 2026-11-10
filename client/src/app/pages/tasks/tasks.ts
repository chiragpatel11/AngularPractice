import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { httpErrorMessage } from '../../core/http-error';
import { Task, TaskInput } from '../../core/models';
import { TaskService } from '../../core/task.service';

@Component({
  selector: 'app-tasks',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTableModule,
    MatProgressBarModule,
    MatSnackBarModule,
  ],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
})
export class Tasks implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly taskService = inject(TaskService);
  private readonly snackBar = inject(MatSnackBar);

  readonly displayedColumns = ['completed', 'title', 'dueDate', 'actions'];
  readonly tasks = signal<Task[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly editingId = signal<string | null>(null);
  readonly pendingDeleteId = signal<string | null>(null);
  readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    notes: ['', [Validators.maxLength(5000)]],
    dueDate: [''],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.taskService.list().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.error.set(httpErrorMessage(error, 'Could not load tasks.'));
      },
    });
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    const input = this.toInput();
    if (!input.title) {
      this.form.controls.title.setErrors({ required: true });
      return;
    }
    this.saving.set(true);
    const editingId = this.editingId();
    const request = editingId
      ? this.taskService.update(editingId, input)
      : this.taskService.create(input);
    request.subscribe({
      next: (task) => {
        if (editingId) {
          this.replace(task);
        } else {
          this.tasks.update((tasks) => [task, ...tasks]);
        }
        this.cancelEdit();
        this.saving.set(false);
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.snackBar.open(httpErrorMessage(error, 'Could not save the task.'), 'Dismiss', {
          duration: 4000,
        });
      },
    });
  }

  startEdit(task: Task): void {
    this.editingId.set(task.id);
    this.form.setValue({
      title: task.title,
      notes: task.notes ?? '',
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.form.reset({ title: '', notes: '', dueDate: '' });
  }

  toggle(task: Task): void {
    this.taskService.update(task.id, { completed: !task.completed }).subscribe({
      next: (updated) => this.replace(updated),
      error: (error: unknown) => {
        this.tasks.update((tasks) => [...tasks]);
        this.snackBar.open(httpErrorMessage(error, 'Could not update the task.'), 'Dismiss', {
          duration: 4000,
        });
      },
    });
  }

  remove(task: Task): void {
    if (this.pendingDeleteId() !== task.id) {
      this.pendingDeleteId.set(task.id);
      return;
    }
    this.taskService.remove(task.id).subscribe({
      next: () => {
        this.tasks.update((tasks) => tasks.filter((item) => item.id !== task.id));
        this.pendingDeleteId.set(null);
        if (this.editingId() === task.id) {
          this.cancelEdit();
        }
      },
      error: (error: unknown) => {
        this.snackBar.open(httpErrorMessage(error, 'Could not delete the task.'), 'Dismiss', {
          duration: 4000,
        });
      },
    });
  }

  dueLabel(task: Task): string {
    return task.dueDate ? task.dueDate.slice(0, 10) : 'None';
  }

  private toInput(): TaskInput {
    const value = this.form.getRawValue();
    const notes = value.notes.trim();
    return {
      title: value.title.trim(),
      notes: notes.length > 0 ? notes : null,
      dueDate: value.dueDate ? value.dueDate : null,
    };
  }

  private replace(updated: Task): void {
    this.tasks.update((tasks) =>
      tasks.map((task) => (task.id === updated.id ? updated : task)),
    );
  }
}
