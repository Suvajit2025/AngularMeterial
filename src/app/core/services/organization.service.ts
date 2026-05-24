import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, delay, map, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Employee } from '../../features/organization/models/employee.model';
import { ORGANIZATION_MENU_MOCK } from '../../features/organization/models/menu.mock';
import{ApiService} from './api.service';
// OrganizationService is API-ready.
// Today it returns mock data; later this method can call ApiService or HttpClient.
@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  private readonly api= inject(ApiService);
  // The API is searched from this employee, so returned employees normally belong under this manager.
  readonly searchedEmployeeNo = '100471';

  // The chart should still show the company top level before the searched employee subtree.
  readonly rootEmployeeNo = '100003'; 
  private readonly tenantId = environment.tenantId;

  // Mock employee hierarchy data comes from menu.mock.ts.
  // ManagerNo is the important field because it connects each employee to their parent manager.
  private readonly employees = ORGANIZATION_MENU_MOCK;

  // Fixed top hierarchy records.
  // These records keep the chart start consistent even when the API only returns the searched employee subtree.
  private readonly fixedRootEmployees: Employee[] = [
    {
      EmpNo: '100003',
      EmployeeName: 'PROBHAS BONDHU CHAKRABORTY',
      DesignationName: 'MANAGING DIRECTOR(MD)',
      ManagerNo: null,
      ManagerName: null,
      ImageUrl: 'https://hrms.mendine.co.in/Register/UserImage/Img_100003.jpeg',
    },
    {
      EmpNo: '100471',
      EmployeeName: 'SUROJIT SEN',
      DesignationName: 'MANAGER- SYSTEM & IT(HOD)',
      ManagerNo: '100003',
      ManagerName: 'PROBHAS BONDHU CHAKRABORTY',
      ImageUrl: 'https://hrms.mendine.co.in/Register/UserImage/Img_100471.jpg',
    },
  ];

  getOrganizationHierarchy(): Observable<Employee[]> {
    // RxJS Observable is used for API-style async data streams.
    // The real API sends numeric EmpNo/ManagerNo values and FileLocation image URLs.
    const params = new HttpParams()
      .set('tenantId', this.tenantId)
      .set('empNo', this.searchedEmployeeNo)
      .set('action', 'TOPTOBOTTOM');

    return this.api.get<Employee[] | { data?: Employee[]; Data?: Employee[]; result?: Employee[] }>(
      '/api/essp-admin/organization-hierarchy',
      { params },
    ).pipe(
      // Some APIs return a plain array, others wrap the array in data/Data/result.
      // This keeps the component independent from that backend formatting detail.
      map((response) => {
        if (Array.isArray(response)) {
          return this.addFixedRootEmployees(response);
        }

        return this.addFixedRootEmployees(response.data ?? response.Data ?? response.result ?? []);
      }),
      // Mock fallback keeps the beginner/demo screen usable if API/CORS/network is unavailable.
      catchError(() => of(this.addFixedRootEmployees(this.employees)).pipe(delay(250))),
    );
  }

  private addFixedRootEmployees(apiEmployees: Employee[]): Employee[] {
    const fixedRootIds = new Set(this.fixedRootEmployees.map((employee) => String(employee.EmpNo)));

    // API data is appended after the fixed MD -> HOD records.
    // Duplicate fixed records from the API are removed so the tree has one clean path.
    const apiEmployeesWithoutFixedRoots = apiEmployees.filter(
      (employee) => !fixedRootIds.has(String(employee.EmpNo)),
    );

    return [...this.fixedRootEmployees, ...apiEmployeesWithoutFixedRoots];
  }
}
