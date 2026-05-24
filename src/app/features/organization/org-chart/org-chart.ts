import { NgTemplateOutlet } from '@angular/common';
import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, finalize, of } from 'rxjs';

import { OrganizationService } from '../../../core/services/organization.service';
import { Employee, OrganizationNodeData, OrganizationTreeNode } from '../models/employee.model';

// OrgChartComponent is a standalone lazy-loaded feature page.
// It uses a custom horizontal recursive renderer so the chart matches classic HRMS org-chart layouts.
@Component({
  selector: 'app-org-chart',
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
    NgTemplateOutlet,
  ],
  templateUrl: './org-chart.html',
  styleUrl: './org-chart.scss',
})
export class OrgChartComponent {
  private readonly organizationService = inject(OrganizationService);

  // Signal query gives us the chart DOM area that should be captured for PDF export.
  protected readonly exportArea = viewChild<ElementRef<HTMLElement>>('exportArea');

  // Signal used for local UI loading state.
  protected readonly loading = signal(true);

  // Signal used while PDF generation is running.
  protected readonly exporting = signal(false);

  // Signal used for zoom state. The chart uses CSS transform so the data does not change.
  protected readonly zoomLevel = signal(1);

  // Signal used by the search input to highlight matching employees.
  protected readonly searchTerm = signal('');

  // Signal stores node IDs that are currently collapsed.
  // A Set is useful because checking whether a node is collapsed is very fast.
  protected readonly collapsedNodeIds = signal<Set<string>>(new Set());

  // RxJS Observable used for future API response stream handling.
  // When this becomes a real API call, the component can keep the same shape.
  protected readonly organization$ = this.organizationService.getOrganizationHierarchy().pipe(
    catchError(() => of([] as Employee[])),
    finalize(() => this.loading.set(false)),
  );

  // toSignal converts the API-style Observable into a Signal for template-friendly state.
  protected readonly employees = toSignal(this.organization$, { initialValue: [] as Employee[] });

  // Computed signal rebuilds the hierarchy when employees or expand/collapse state changes.
  protected readonly organizationNodes = computed(() => this.buildHierarchyFromRoots(this.employees()));

  // Computed signal gives quick page-level statistics without storing duplicate state.
  protected readonly employeeCount = computed(() => this.employees().length);

  protected readonly managerCount = computed(
    () => new Set(this.employees().filter((employee) => employee.ManagerNo).map((employee) => String(employee.ManagerNo))).size,
  );

  protected readonly matchedCount = computed(() => {
    const term = this.normalizedSearch();

    if (!term) {
      return this.employeeCount();
    }

    return this.employees().filter((employee) =>
      `${employee.EmployeeName} ${employee.DesignationName} ${employee.EmpNo}`.toLowerCase().includes(term),
    ).length;
  });

  protected readonly chartScale = computed(() => `scale(${this.zoomLevel()})`);

  protected readonly treeDepth = computed(() => this.getTreeDepth(this.organizationNodes()));

  protected updateSearch(value: string): void {
    this.searchTerm.set(value);
  }

  protected zoomIn(): void {
    this.zoomLevel.update((value) => Math.min(1.25, Number((value + 0.1).toFixed(2))));
  }

  protected zoomOut(): void {
    this.zoomLevel.update((value) => Math.max(0.5, Number((value - 0.1).toFixed(2))));
  }

  protected resetZoom(): void {
    this.zoomLevel.set(1);
  }

  protected expandAll(): void {
    this.collapsedNodeIds.set(new Set());
  }

  protected collapseAll(): void {
    this.collapsedNodeIds.set(new Set(this.employees().map((employee) => String(employee.EmpNo))));
  }

  protected async exportPdf(): Promise<void> {
    const element = this.exportArea()?.nativeElement;

    if (!element || this.exporting()) {
      return;
    }

    this.exporting.set(true);

    try {
      // Dynamic imports keep PDF libraries out of the first application bundle.
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const exportWidth = element.scrollWidth;
      const exportHeight = element.scrollHeight;

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        height: exportHeight,
        onclone: (_document, clonedElement) => {
          // The screen can be zoomed/scrolled, but the PDF should capture a clean full-size chart.
          const clonedCanvas = clonedElement.querySelector<HTMLElement>('.chart-canvas');

          clonedElement.style.height = `${exportHeight}px`;
          clonedElement.style.overflow = 'visible';
          clonedElement.style.width = `${exportWidth}px`;

          if (clonedCanvas) {
            clonedCanvas.style.transform = 'none';
            clonedCanvas.style.transition = 'none';
          }
        },
        scale: 2,
        useCORS: true,
        width: exportWidth,
        windowHeight: exportHeight,
        windowWidth: exportWidth,
      });

      const imageData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;
      const imageRatio = canvas.width / canvas.height;
      let imageWidth = availableWidth;
      let imageHeight = imageWidth / imageRatio;

      if (imageHeight > availableHeight) {
        imageHeight = availableHeight;
        imageWidth = imageHeight * imageRatio;
      }

      const left = (pageWidth - imageWidth) / 2;
      const top = (pageHeight - imageHeight) / 2;

      pdf.addImage(imageData, 'PNG', left, top, imageWidth, imageHeight);
      pdf.save(`organization-hierarchy-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      this.exporting.set(false);
    }
  }

  protected toggleNode(node: OrganizationTreeNode): void {
    this.collapsedNodeIds.update((current) => {
      const next = new Set(current);

      if (next.has(node.key)) {
        next.delete(node.key);
      } else {
        next.add(node.key);
      }

      return next;
    });
  }

  protected isSearchMatch(node: OrganizationTreeNode): boolean {
    const term = this.normalizedSearch();

    if (!term || !node.data) {
      return false;
    }

    return `${node.data.name} ${node.data.designation} ${node.data.empNo}`.toLowerCase().includes(term);
  }

  protected handleAvatarError(event: Event, employeeName: string): void {
    // Some API image URLs may fail because the file is missing, private, blocked by CORS,
    // or served from a domain that does not allow direct browser loading.
    // When that happens, replace the broken image with a generated initials avatar.
    const imageElement = event.target as HTMLImageElement;
    const fallbackImage = this.getAvatarUrl(employeeName);

    if (imageElement.src !== fallbackImage) {
      imageElement.src = fallbackImage;
    }
  }

  protected levelColor(level: number): string {
    // Colors follow the screenshot style: CEO navy, executives blue, directors orange, employees purple.
    const colors = ['#0f4c7a', '#8dc8ff', '#ffa64d', '#895fb4'];
    return colors[Math.min(level, colors.length - 1)];
  }

  protected buildHierarchy(employees: Employee[], managerNo: string | null = null): OrganizationTreeNode[] {
    // Recursive hierarchy builder:
    // 1. Find employees whose ManagerNo matches the current parent manager.
    // 2. Convert each employee into our horizontal OrganizationTreeNode.
    // 3. Repeat the same function for children using the current employee's EmpNo.
    return employees
      .filter((employee) => this.normalizeEmployeeNo(employee.ManagerNo) === managerNo)
      .map((employee) => this.createTreeNode(employee, employees));
  }

  private buildHierarchyFromRoots(employees: Employee[]): OrganizationTreeNode[] {
    const rootEmployeeNo = this.organizationService.rootEmployeeNo;
    const rootEmployee = employees.find(
      (employee) => this.normalizeEmployeeNo(employee.EmpNo) === rootEmployeeNo,
    );

    // The enterprise hierarchy starts from the fixed company root.
    // API data is then attached below that root through ManagerNo relationships.
    if (rootEmployee) {
      return [this.createTreeNode(rootEmployee, employees)];
    }

    const employeeNumbers = new Set(
      employees
        .map((employee) => this.normalizeEmployeeNo(employee.EmpNo))
        .filter((employeeNo): employeeNo is string => Boolean(employeeNo)),
    );

    // API subtree support:
    // If the top returned employee still has a ManagerNo outside this response, treat that employee as root.
    const rootEmployees = employees.filter((employee) => {
      const managerNo = this.normalizeEmployeeNo(employee.ManagerNo);
      return managerNo === null || !employeeNumbers.has(managerNo);
    });

    return rootEmployees.map((employee) => this.createTreeNode(employee, employees));
  }

  private createTreeNode(employee: Employee, employees: Employee[]): OrganizationTreeNode {
    const empNo = this.normalizeEmployeeNo(employee.EmpNo) ?? '';
    // Build children first so tooltip can show the direct report count.
    const children = this.buildHierarchy(employees, empNo);

    return {
      key: empNo,
      expanded: !this.collapsedNodeIds().has(empNo),
      data: {
        empNo,
        name: employee.EmployeeName,
        designation: employee.DesignationName,
        managerNo: this.normalizeEmployeeNo(employee.ManagerNo),
        managerName: employee.ManagerName,
        managerImage: employee.managerfilelocation?.trim() || null,
        initials: this.getInitials(employee.EmployeeName),
        // API uses FileLocation. Older mock/demo data may still use ImageUrl.
        image: this.getEmployeeImage(employee),
        tooltip: {
          text: this.getEmployeeTooltip(employee, children.length),
        },
      },
      // children[] creates the recursive tree structure needed for hierarchy rendering.
      children,
    };
  }

  private getTreeDepth(nodes: OrganizationTreeNode[], level = 1): number {
    if (!nodes.length) {
      return level - 1;
    }

    return Math.max(...nodes.map((node) => this.getTreeDepth(node.children, level + 1)));
  }

  private normalizedSearch(): string {
    return this.searchTerm().trim().toLowerCase();
  }

  private getInitials(name: string): string {
    // Initials keep the avatar readable even when there is no employee photo from the API.
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  private getAvatarUrl(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ffffff&color=2563eb&bold=true`;
  }

  private getEmployeeImage(employee: Employee): string {
    return employee.FileLocation?.trim() || employee.ImageUrl?.trim() || this.getAvatarUrl(employee.EmployeeName);
  }

  private normalizeEmployeeNo(value: string | number | null): string | null {
    return value === null || value === undefined ? null : String(value);
  }

  private getEmployeeTooltip(employee: Employee, directReports: number): string {
    return [
      `Name: ${employee.EmployeeName}`,
      //`Employee No: ${String(employee.EmpNo)}`,
      `Designation: ${employee.DesignationName}`,
      `Manager: ${employee.ManagerName ?? 'Top Level'}`,
     // `Manager No: ${this.normalizeEmployeeNo(employee.ManagerNo) ?? '-'}`,
      //`Direct Reports: ${directReports}`,
    ].join('\n');
  }
}
