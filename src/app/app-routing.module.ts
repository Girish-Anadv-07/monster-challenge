import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FlightFormComponent } from './pages/flight-form/flight-form.component';
import { AuthGuard } from './auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { AdminPanelComponent } from './pages/admin-panel/admin-panel.component';

const routes: Routes = [
  { path: 'travels', component: AdminPanelComponent, canActivate: [AuthGuard] },
  { path: '', component: HomeComponent, pathMatch: 'full' },
  {
    path: 'flight-form',
    component: FlightFormComponent,
    canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
