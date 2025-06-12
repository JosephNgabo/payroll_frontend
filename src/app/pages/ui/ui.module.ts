import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
import { UiRoutingModule } from "./ui-routing.module";
import { CardsComponent } from "./cards/cards.component";
import { PagetitleComponent } from "src/app/shared/ui/pagetitle/pagetitle.component";
import { NgxMasonryModule } from "ngx-masonry";

@NgModule({
  declarations: [
    CardsComponent
  ],
  imports: [
    CommonModule,
    UiRoutingModule,
    PagetitleComponent,
    NgxMasonryModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UiModule {}
