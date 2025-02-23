import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonService } from 'src/app/core/services/common/common.service';
import { DataService } from 'src/app/core/services/data.service';
import { RbacService } from 'src/app/core/services/rbac-service.service';
import { WrapperService } from 'src/app/core/services/wrapper.service';
import { buildQuery, parseFilterToQuery, parseRbacFilter, parseTimeSeriesQuery } from 'src/app/utilities/QueryBuilder';
import { config } from 'src/app/views/teacher-attendance/config/teacher_attendance_config';

@Component({
  selector: 'app-teacher-attendance-map',
  templateUrl: './teacher-attendance-map.component.html',
  styleUrls: ['./teacher-attendance-map.component.scss']
})
export class TeacherAttendanceMapComponent implements OnInit {
  reportName: string = 'tas_average_attendance_map';
  filters: any = [];
  levels: any;
  reportData: any = {
    reportName: "Teacher Attendance Map"
  };
  title: string = 'Teacher Attendance Map'
  selectedYear: any;
  selectedMonth: any;
  startDate: any;
  endDate: any;
  config: any;
  compareDateRange: any = 7;
  filterIndex: any;
  rbacDetails: any;
  drillDownLevel: any;
  drillDown: any;

  @Output() exportReportData = new EventEmitter<any>();

  constructor(private readonly _dataService: DataService, private readonly _wrapperService: WrapperService, private _rbacService: RbacService) {
    this._rbacService.getRbacDetails().subscribe((rbacDetails: any) => {
      this.rbacDetails = rbacDetails;
    })
  }

  ngOnInit(): void {
  }

  async drilldownData(event: any) {
    this.drillDown = true
    let { level, id } = event ?? {}
    let drillDownDetails;

    switch (Number(level)) {
      case 1:
        drillDownDetails = {
          ...this.rbacDetails,
          role: Number(this.rbacDetails.role) + 1,
          district: id
        }
        break;
      case 2:
        drillDownDetails = {
          ...this.rbacDetails,
          role: Number(this.rbacDetails.role) + 1,
          block: id
        }
        break;
      case 3:
        drillDownDetails = {
          ...this.rbacDetails,
          role: Number(this.rbacDetails.role) + 1,
          cluster: id
        }
        break;
    }

    let reportConfig = config
    let { timeSeriesQueries, queries, levels, defaultLevel, filters, options } = reportConfig[this.reportName];
    filters.every((filter: any) => {
      if ((Number(level) + 1) === Number(filter.hierarchyLevel)) {
        queries = { ...filter?.timeSeriesQueries }
        queries['map'] = parseRbacFilter(queries['map'], drillDownDetails)
        return false
      }
      return true
    })
    let drillDownQuery;
    console.log(queries)
    if (this.startDate === undefined && this.endDate === undefined) {
      let endDate = new Date();
      let days = endDate.getDate() - this.compareDateRange;
      let startDate = new Date();
      startDate.setDate(days)
      drillDownQuery = parseTimeSeriesQuery(queries['map'], startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0])
    }
    else {
      drillDownQuery = parseTimeSeriesQuery(queries['map'], this.startDate, this.endDate)
    }
    this.reportData = await this._dataService.getMapReportData(drillDownQuery, options, undefined)
    if (this.reportData?.data?.length > 0) {
      let reportsData = { reportData: this.reportData.data, reportType: 'map', reportName: this.title }
      this.exportReportData.emit(reportsData)
    }
    this.drillDownLevel = level + 1
  }

  getReportData(values: any): void {
    let { filterValues, timeSeriesValues } = values ?? { filterValues: [], timeSeriesValues: [] };
    if (filterValues === undefined) {
      filterValues = []
    }
    this.startDate = timeSeriesValues?.startDate;
    this.endDate = timeSeriesValues?.endDate;
    let reportConfig = config

    let { timeSeriesQueries, queries, levels, defaultLevel, filters, options } = reportConfig[this.reportName];
    let onLoadQuery;
    let currentLevel;

    if (this.rbacDetails?.role) {
      filters.every((filter: any) => {
        if (Number(this.rbacDetails?.role) === Number(filter.hierarchyLevel)) {
          queries = { ...filter?.timeSeriesQueries }
          console.log(queries)
          Object.keys(queries).forEach((key) => {
            queries[key] = parseRbacFilter(queries[key], this.rbacDetails)
          });
          return false
        }
        return true
      })
    }

    Object.keys(queries).forEach(async (key: any) => {
      if (this.startDate === undefined && this.endDate === undefined) {
        let endDate = new Date();
        let days = endDate.getDate() - this.compareDateRange;
        let startDate = new Date();
        startDate.setDate(days)
        onLoadQuery = parseTimeSeriesQuery(queries[key], startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0])
      }
      else if (this.startDate !== undefined && this.endDate !== undefined) {
        onLoadQuery = parseTimeSeriesQuery(queries[key], this.startDate, this.endDate)
      }

      let query = buildQuery(onLoadQuery, defaultLevel, this.levels, this.filters, this.startDate, this.endDate, key, this.compareDateRange);

      let metricFilter = [...filterValues].filter((filter: any) => {
        return filter.filterType === 'metric'
      })

      filterValues = [...filterValues].filter((filter: any) => {
        return filter.filterType !== 'metric'
      })

      filterValues.forEach((filterParams: any) => {
        query = parseFilterToQuery(query, filterParams)
      });

      if (query && key === 'table') {
        this.reportData = await this._dataService.getTableReportData(query, options);
        if (this.reportData?.data?.length > 0) {
          let reportsData = { reportData: this.reportData.data, reportType: 'table', reportName: this.title }
          this.exportReportData.emit(reportsData)
        }
      }
      else if (query && key === 'bigNumber') {
        this.reportData = await this._dataService.getBigNumberReportData(query, options, 'averagePercentage', this.reportData);
      }
      else if (query && key === 'bigNumberComparison') {
        this.reportData = await this._dataService.getBigNumberReportData(query, options, 'differencePercentage', this.reportData);
      }
      else if (query && key === 'barChart') {
        let { reportData, config } = await this._dataService.getBarChartReportData(query, options, filters, defaultLevel);
        this.reportData = reportData
        this.config = config;
        if (this.reportData?.values?.length > 0) {
          let reportsData = { reportData: this.reportData.values, reportType: 'dashletBar', reportName: this.title }
          this.exportReportData.emit(reportsData)
        }
      }
      else if (query && key === 'map') {
        this.reportData = await this._dataService.getMapReportData(query, options, metricFilter)
        if (this.reportData?.data?.length > 0) {
          let reportsData = { reportData: this.reportData.data, reportType: 'map', reportName: this.title }
          this.exportReportData.emit(reportsData)
        }
      }
    })
  }
}
