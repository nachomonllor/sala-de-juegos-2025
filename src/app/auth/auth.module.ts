// import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';

// @NgModule({
//   declarations: [],
//   imports: [
//     CommonModule
//   ]
// })
// export class AuthModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegisterComponent } from '../register/register';
import { LoginComponent } from '../login/login';
import { AuthRoutingModule } from '../auth-routing/auth-routing.module';


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
