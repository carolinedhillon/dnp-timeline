import { Component } from '@angular/core';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  timelineData = [
    { icon: '\uf19d', category:'school' ,text: 'Externat Ste Marie, France', start:'01-09-1998', end:'30-06-2001'},
    { icon: '\uf19d', category:'college', text: 'Institut Vatel, France', start:'01-09-2001', end:'30-06-2004'},
    { icon: '\uf19d', category:'college',  text: 'University of Salford, Manchester', start:'01-05-2015', end:'01-09-2016'},
    { icon: '\uf19d', category:'college',  text: 'The Manchester College', start:'01-10-2011', end:'01-01-2014'},
    
    { icon: '\uf19c', category:'work',  text: 'The Connaught', start:'01-09-2007', end:'01-12-2008'},
    { icon: '', category:'work',  text: '', start:'01-01-2010', end:'01-01-2011'},
    { icon: '\uf19c', category:'work',  text: 'The Langham', start:'01-12-2008', end:'01-01-2010'},

    { icon: '\uf19d', category:'certification',  text: 'Prince2', start:'01-01-2020', end:'01-03-2020'},
    { icon: '\uf13b', category:'certification',  text: 'HTML,CSS,Javascript', start:'01-02-2019', end:'01-01-2021'},

    { icon: '\uf1c0', category:'work-it',  text: 'NetNames', start:'01-02-2011', end:'01-11-2015'},
    { icon: '\uf0c2', category:'work-it',  text: 'vmware', start:'01-11-2015', end:'01-02-2020'},
    { icon: '\uf1de', category:'work-it',  text: 'QBE', start:'01-03-2020', end:'01-07-2020'},
    
  ]; 
}
