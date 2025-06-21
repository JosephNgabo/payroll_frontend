import { RouterModule, Routes } from '@angular/router';
import { Page404Component } from './extrapages/page404/page404.component';
import { LaravelAuthGuard } from './core/guards/laravel-auth.guard';
import { LayoutComponent } from './layouts/layout.component';

export const routes: Routes = [
    {
        path: "auth",
        loadChildren: () =>
            import("./account/account.module").then((m) => m.AccountModule),
    },
    {
        path: "",
        component: LayoutComponent,
        loadChildren: () =>
            import("./pages/pages.module").then((m) => m.PagesModule),
        canActivate: [LaravelAuthGuard],
    },
    {
        path: "pages",
        loadChildren: () =>
            import("./extrapages/extrapages.module").then((m) => m.ExtrapagesModule),
        canActivate: [LaravelAuthGuard],
    },
    { path: "**", component: Page404Component },
];
