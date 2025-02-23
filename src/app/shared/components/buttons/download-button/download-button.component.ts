import { Component, Input, OnInit } from '@angular/core';
import { formatNumberForReport, numberLabelFormatForReport } from 'src/app/utilities/NumberFomatter';

import * as json2csv from 'json2csv';
// import { Parser } from 'json2csv'
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-download-button',
  templateUrl: './download-button.component.html',
  styleUrls: ['./download-button.component.scss']
})
export class DownloadButtonComponent implements OnInit {


  @Input() data: any;
  @Input() fileName: any;
  @Input() reportType: any;

  @Input() multiple: boolean = false;
  @Input() data1: any;
  @Input() data2: any;
  @Input() fileName1: any;
  @Input() fileName2: any;
  @Input() reportType1: any;
  @Input() reportType2: any;
  @Input() reportData: any;
  // below vars === added for school report download button
  @Input() title: any;
  @Input() pagereportName: any;
  // 

  // @Input() reportData: { reportName: string, data: any }[];
  // @Input() reportInputs :any;
  constructor() { }

  ngOnInit(): void {

  }
  // Download reports....
  // download(reportData: any, fileName: any,) {
  //   console.log('the dat iz', reportData);
  //   if (this.multiple) {
  //     for (let i = 0; i < 2; i++) {
  //       reportData = i === 0 ? this.data1 : this.data2;
  //       fileName = i === 0 ? this.fileName1 : this.fileName2;
  //       this.reportType = i === 0 ? this.reportType1 : this.reportType2
  //       let keys: [] | any
  //       if (reportData === undefined || reportData?.length <= 0) {
  //         alert("No data found to download");
  //       }
  //       else {

  //         keys = Object.keys(reportData['0']).filter(key => key !== 'tooltip');

  //       };
  //       let dupData;

  //       if (this.reportType === 'map') {
  //         dupData = JSON.parse(JSON.stringify(reportData));
  //       }
  //       else if (this.reportType === 'table') {
  //         dupData = JSON.parse(JSON.stringify(reportData));
  //         dupData?.forEach((rec: any) => {
  //           Object.keys(rec).forEach((obj: any) => {
  //             rec[obj] = rec[obj]?.value
  //           });
  //         });
  //       }
  //       else if (this.reportType === 'dashletBar') {
  //         dupData = JSON.parse(JSON.stringify(reportData));
  //       }
  //       else if (this.reportType === 'dashletScatter') {
  //         keys = keys.filter((ele: any) => {
  //           return ele !== 'data'
  //         })
  //         dupData = JSON.parse(JSON.stringify(reportData));
  //         dupData.forEach((obj: any) => {
  //           delete obj.data
  //         })
  //       }
  //       dupData.forEach((obj: any) => {
  //         Object.keys(obj).forEach((key: any) => {
  //           obj[key] = !isNaN(obj[key]) ? formatNumberForReport(Number(obj[key])) : obj[key]
  //         });
  //       });
  //       const opts = { fields: keys, output: fileName };
  //       const csv = json2csv.parse(dupData, opts);

  //       let file = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  //       saveAs(file, `${fileName}.csv`);
  //     }
  //   }
  //   else {
  //     let keys: [] | any
  //     if (reportData === undefined || reportData?.length <= 0) {
  //       alert("No data found to download");
  //     }
  //     else {

  //       keys = Object.keys(reportData['0']).filter(key => key !== 'tooltip');

  //     };
  //     let dupData;

  //     if (this.reportType === 'map') {
  //       dupData = JSON.parse(JSON.stringify(reportData));
  //     }
  //     else if (this.reportType === 'table') {
  //       dupData = JSON.parse(JSON.stringify(reportData));
  //       dupData?.forEach((rec: any) => {
  //         Object.keys(rec).forEach((obj: any) => {
  //           rec[obj] = rec[obj]?.value
  //         });
  //       });
  //     }
  //     else if (this.reportType === 'dashletBar') {
  //       dupData = JSON.parse(JSON.stringify(reportData));
  //     }
  //     else if (this.reportType === 'dashletScatter') {
  //       keys = keys.filter((ele: any) => {
  //         return ele !== 'data'
  //       })
  //       dupData = JSON.parse(JSON.stringify(reportData));
  //       dupData.forEach((obj: any) => {
  //         delete obj.data
  //       })
  //     }
  //     dupData.forEach((obj: any) => {
  //       Object.keys(obj).forEach((key: any) => {
  //         obj[key] = !isNaN(obj[key]) ? formatNumberForReport(Number(obj[key])) : obj[key]
  //       });
  //     });

  //     const opts = { fields: keys, output: fileName };
  //     const csv = json2csv.parse(dupData, opts);

  //     let file = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  //     saveAs(file, `${fileName}.csv`);
  //   }
  // }
  onDownload() {
    if(this.data.length > 0) this.download(this.data)
  }

  download(reportInputs: { reportData: any, reportType: string, reportName: string }[]) {
    console.log(reportInputs);
    
    if (reportInputs === undefined || reportInputs?.length <= 0) {
      alert("No data found to download");
    } else {
      for (let i = 0; i < reportInputs.length; i++) {
        const reportData = reportInputs[i].reportData;
        const reportType = reportInputs[i].reportType;
        const fileName = reportInputs[i].reportName;
        let keys: [] | any;
        keys = Object.keys(reportData[0]).filter(key => !['tooltip', 'min_date', 'max_date'].includes(key));
        let dupData;
        if (reportType === 'map') {
          dupData = JSON.parse(JSON.stringify(reportData));
        } else if (reportType === 'table') {
          dupData = JSON.parse(JSON.stringify(reportData));
          dupData?.forEach((rec: any) => {
            Object.keys(rec).forEach((obj: any) => {
              rec[obj] = rec[obj]?.value;
            });
          });
        } else if (reportType === 'dashletBar') {
          dupData = JSON.parse(JSON.stringify(reportData));
        } else if (reportType === 'dashletScatter') {
          keys = keys.filter((ele: any) => {
            return ele !== 'data';
          });
          dupData = JSON.parse(JSON.stringify(reportData));
          dupData.forEach((obj: any) => {
            delete obj.data;
          });
        }
        dupData.forEach((obj: any) => {
          Object.keys(obj).forEach((key: any) => {
            obj[key] = !isNaN(obj[key]) ? formatNumberForReport(Number(obj[key])) : obj[key];
          });
        });
        // added  below condition temporary for school download reports
        if (this.pagereportName == "teachers_present" || this.pagereportName == "school_infra" || this.pagereportName == "school_progression") {
          dupData = JSON.parse(JSON.stringify(reportData));
        }
        //
        const opts = { fields: keys, output: fileName };
        const csv = json2csv.parse(dupData, opts);
        let file = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        saveAs(file, `${fileName}.csv`);
      }
    }
  }
}




