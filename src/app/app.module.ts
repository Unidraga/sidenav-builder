import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { AppComponent } from './app.component';
import {HttpClientModule, HttpClient, HttpHandler} from '@angular/common/http';
import { WorkflowService } from './shared/services/workflow.service';



@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule, 
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [WorkflowService],
  bootstrap: [AppComponent]
})
export class AppModule { }
