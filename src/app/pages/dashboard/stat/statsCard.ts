import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statsCard.html',
  styleUrls: ['./statsCard.css']
})

export class StatsCardComponent {
  @Input() stats!: { total: number; completed: number; inProgress: number; pending: number };
}