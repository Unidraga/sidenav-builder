import { Injectable } from '@angular/core';
import { Headers, Response } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

// Import envirnoment variable
import { environment } from '../../../environments/environment';
import { Workflow } from '../data/workflow';

// Classes
// import { Email } from '../data/system/email';
// import { User } from '../data/identity/user';


@Injectable()
export class WorkflowService {

  private baseRoute = '/workflow';

  private URL_GET_DIAGRAMS = environment.API_URL + this.baseRoute + '/diagrams';
  private URL_SAVE_DIAGRAM = environment.API_URL + this.baseRoute + '/save';
  private URL_LOAD_DIAGRAM = environment.API_URL + this.baseRoute + '/load';

  constructor(
    private http: HttpClient) {
  }

  getDiagrams() {
    // const body = JSON.stringify({ email });
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get(this.URL_GET_DIAGRAMS, { headers: headers });
  }

  loadDiagram(email) {
    const body = JSON.stringify({ email });
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post(this.URL_LOAD_DIAGRAM, body, { headers: headers });
  }

  saveDiagram(workflow: Workflow) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.URL_SAVE_DIAGRAM, workflow, { headers: headers });
  }
}
