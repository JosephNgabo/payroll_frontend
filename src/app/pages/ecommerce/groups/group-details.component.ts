import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService } from 'src/app/core/services/group.service';
import { GroupDetail } from 'src/app/core/models/group.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.component.html',
  styleUrls: ['./group-details.component.scss']
})
export class GroupDetailsComponent implements OnInit {
  groupId: string = '';
  group: GroupDetail | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private groupService: GroupService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('id') || '';
    if (this.groupId) {
      this.fetchGroupDetails();
    } else {
      this.error = 'Invalid group ID.';
      this.isLoading = false;
    }
  }

  fetchGroupDetails() {
    this.isLoading = true;
    this.groupService.getGroup(this.groupId).subscribe({
      next: (response) => {
        this.group = response.data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to fetch group details.';
        this.isLoading = false;
        this.toastr.error('Failed to fetch group details.', 'Error');
      }
    });
  }

  goBack() {
    this.router.navigate(['/access-management/groups']);
  }
} 