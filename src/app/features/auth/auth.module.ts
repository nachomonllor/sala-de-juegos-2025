import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from '../../login/login';
import { RegisterComponent } from '../../register/register';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AuthRoutingModule,
    // standalone components:
    LoginComponent,
    RegisterComponent
  ]
})
export class AuthModule {}


// import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';

// @NgModule({
//   declarations: [],
//   imports: [
//     CommonModule
//   ]
// })
// export class AuthModule { }