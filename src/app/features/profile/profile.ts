import { Component, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import {
  AuthService,
  OfficialInformation,
  UserDetailsResponse,
} from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent {
  private readonly authService = inject(AuthService);
  private readonly session = this.authService.getUserSession();

  protected readonly userDetails = signal<UserDetailsResponse | null>(
    this.session?.userDetails?.[0] || null,
  );
  protected readonly officialInfo = signal<OfficialInformation | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly displayName = computed(
    () => this.officialInfo()?.EmployeeName || this.userDetails()?.Name || 'User Profile',
  );

  protected readonly roleTitle = computed(
    () =>
      this.officialInfo()?.designationname ||
      this.userDetails()?.DesignationName ||
      this.userDetails()?.RoleName ||
      'HRMS User',
  );

  protected readonly avatarUrl = computed(() => {
    const details = this.userDetails();
    const name = this.displayName();

    if (
      details &&
      typeof details.Data === 'string' &&
      details.Data.trim() &&
      typeof details.Contenttype === 'string' &&
      details.Contenttype.trim()
    ) {
      return `data:${details.Contenttype};base64,${details.Data}`;
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name,
    )}&background=dbeafe&color=1d4ed8&bold=true&size=160`;
  });

  protected readonly profileRows = computed(() => {
    const official = this.officialInfo();
    const details = this.userDetails();

    return [
      { label: 'Employee Code', value: official?.empcode || details?.empcode || details?.code },
      { label: 'Employee No', value: official?.empno || details?.EmpNo },
      { label: 'Department', value: official?.Department || details?.Department },
      { label: 'Post', value: official?.postname || details?.postname },
      { label: 'Designation', value: official?.designationname || details?.DesignationName },
      { label: 'Email', value: official?.empemail || details?.EmpEmail },
      { label: 'Contact No', value: official?.empofficialcontactno },
      { label: 'Gender', value: official?.empgender },
      { label: 'Category', value: official?.empcategory },
      { label: 'Joining Date', value: official?.joining },
      { label: 'Date of Birth', value: official?.empdob },
      { label: 'Reports To', value: official?.EmpReporttoperson },
    ].filter((row) => row.value !== undefined && row.value !== null && row.value !== '');
  });

  constructor() {
    this.loadOfficialInformation();
  }

  private loadOfficialInformation(): void {
    const details = this.userDetails();
    const tenantId = details?.TenantID;
    const empNo = details?.EmpNo;

    if (!tenantId || !empNo) {
      this.errorMessage.set('Profile information is not available. Please login again.');
      return;
    }

    this.isLoading.set(true);

    this.authService.getOfficialInformation(tenantId, empNo).subscribe({
      next: (response) => {
        this.officialInfo.set(response[0] || null);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load official information.');
        this.isLoading.set(false);
      },
    });
  }
}
