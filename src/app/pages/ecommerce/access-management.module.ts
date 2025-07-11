import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// module
import { AccessManagementRoutingModule } from './access-management-routing.module';

// bootstrap module
import { NgxSliderModule } from 'ngx-slider-v2';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

// Swiper Slider
import { SlickCarouselModule } from 'ngx-slick-carousel';
// component
import { UsersComponent } from './users/users.component';
// dropzone
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { PagetitleComponent } from 'src/app/shared/ui/pagetitle/pagetitle.component';

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
  // Change this to your upload POST address:
  url: 'https://httpbin.org/post',
  maxFilesize: 50,
  acceptedFiles: 'image/*'
};

@NgModule({
  declarations: [ UsersComponent],
  imports: [
    CommonModule,
    AccessManagementRoutingModule,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    FormsModule,
    SlickCarouselModule,
    BsDropdownModule.forRoot(),
    ReactiveFormsModule,
    NgxSliderModule,
    NgSelectModule,
    PaginationModule.forRoot(),
    BsDatepickerModule.forRoot(),
    DropzoneModule,
    PagetitleComponent
  ],
  providers: [
    DatePipe,
    {
      provide: DROPZONE_CONFIG,
      useValue: DEFAULT_DROPZONE_CONFIG
    }
  ],

})
export class AccessManagementModule { }
