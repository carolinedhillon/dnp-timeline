import { Component } from '@angular/core';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  timelineData = [
    { icon: '\uf19d', category:'education' ,text: 'Lyon School', start:'01-01-1986', end:'01-01-1998'},
    { icon: '\uf19d', category:'education', text: 'Hospitality school', start:'01-01-1998', end:'01-01-2002'},
    { icon: '\uf19d', category:'education',  text: 'Masters in HR', start:'01-01-2016', end:'01-01-2018'},
    { icon: '\uf19c', category:'work',  text: 'HR Hotels 1', start:'01-01-2002', end:'01-01-2008'},
    { icon: '\uf19c', category:'work',  text: 'HR & Data IT 2', start:'01-01-2008', end:'01-01-2020'},
    { icon: '\uf19c', category:'work',  text: 'Data Insurance 3', start:'01-01-2020', end:'01-07-2020'}
  ]; 
}
