import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { saveAs } from 'file-saver';
import { FileService } from './file.service';
import { Component, Type } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  filenames: string[] = [];
  fileStatus = { status: '', requestType: '', percent: 0 };
  
  constructor(private FileService: FileService) { }
  
  //upload file
  onUploadFiles(files: File[]): void {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file, file.name);
    }
    
    this.FileService.upload(formData).subscribe(
      event => {
        console.log(event);
        this.reportProgress(event)
      },
          (error: HttpErrorResponse) => {
        console.log(error)
      } 
    );
  }

  //download
  onDownloadFile(filename: string): void {
        
    this.FileService.download(filename).subscribe(
      event => {
        console.log(event);
        this.reportProgress(event);
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    );
  }

  private reportProgress(httpEvent: HttpEvent<string[] | Blob>): void {
    switch (httpEvent.type) {
      case HttpEventType.UploadProgress:
        this.updateStatus(httpEvent.loaded, httpEvent.total!, 'Uploading ');
        break;
      case HttpEventType.DownloadProgress:
        this.updateStatus(httpEvent.loaded, httpEvent.total!, 'Downloading ');
        break;
      case HttpEventType.ResponseHeader:
        console.log('Header returned', httpEvent);
        break;
      case HttpEventType.Response:
        if (httpEvent.body instanceof Array) {
          this.fileStatus.status = 'done';
          for (const filename of httpEvent.body) {
            this.filenames.unshift(filename);
          }
        } else {
          //download
          saveAs(new File([httpEvent.body!], httpEvent.headers.get('File-Name')!,
            { type: `${httpEvent.headers.get('Content-Type')}; charset=utf-8` }));
          
        }
        this.fileStatus.status = 'done';
        break;
          default:
            console.log(httpEvent);
              break;
    }
  }
  
  private updateStatus(loaded: number, total: number, requestType: string) {
      this.fileStatus.status = 'progress';
      this.fileStatus.requestType = requestType;
      this.fileStatus.percent = Math.round(100 * loaded / total);
  }
  
}
