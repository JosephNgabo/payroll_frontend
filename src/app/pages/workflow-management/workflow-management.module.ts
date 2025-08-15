import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ListWorkflowsComponent } from './list-workflows/list-workflows.component';
import { WorkflowDetailsPageComponent } from './workflow-details-page/workflow-details-page.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: ListWorkflowsComponent
      },
      {
        path: 'details/:id',
        component: WorkflowDetailsPageComponent
      }
    ])
  ]
})
export class WorkflowManagementModule { }
