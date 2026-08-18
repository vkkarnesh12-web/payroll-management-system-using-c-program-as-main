/*
 * Payroll Management System - C Backend/Core
 * ------------------------------------------
 * This program contains the payroll calculation and employee management
 * logic in C. It is a standalone backend/core module.
 *
 * IMPORTANT:
 * A static Netlify website cannot execute this C program directly.
 * The HTML/JS version stores data in browser localStorage.
 * To connect this C program to the web UI, run it through a C HTTP/CGI
 * server or another backend API.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_EMPLOYEES 100
#define NAME_LEN 100
#define DEPT_LEN 60
#define POS_LEN 60

typedef struct {
    int id;
    char name[NAME_LEN];
    char department[DEPT_LEN];
    char position[POS_LEN];
    double baseSalary;
    double da, hra, ma, convey;
} Employee;

typedef struct {
    double gross;
    double pf;
    double tax;
    double deductions;
    double net;
} Payroll;

Employee employees[MAX_EMPLOYEES];
int employeeCount = 0;
double taxRate = 10.0;
double pfRate = 12.0;

Payroll calculatePayroll(Employee e) {
    Payroll p;
    p.gross = e.baseSalary + e.da + e.hra + e.ma + e.convey;
    p.pf = p.gross * pfRate / 100.0;
    p.tax = p.gross * taxRate / 100.0;
    p.deductions = p.pf + p.tax;
    p.net = p.gross - p.deductions;
    return p;
}

int findEmployee(int id) {
    for (int i = 0; i < employeeCount; i++)
        if (employees[i].id == id) return i;
    return -1;
}

void addEmployee(void) {
    if (employeeCount >= MAX_EMPLOYEES) {
        printf("Employee limit reached.\n");
        return;
    }

    Employee *e = &employees[employeeCount];

    printf("\nEmployee ID: ");
    scanf("%d", &e->id);
    if (findEmployee(e->id) != -1) {
        printf("Employee ID already exists.\n");
        return;
    }

    printf("Full Name: ");
    scanf(" %99[^\n]", e->name);
    printf("Department: ");
    scanf(" %59[^\n]", e->department);
    printf("Position: ");
    scanf(" %59[^\n]", e->position);
    printf("Base Salary: ");
    scanf("%lf", &e->baseSalary);
    printf("DA: ");
    scanf("%lf", &e->da);
    printf("HRA: ");
    scanf("%lf", &e->hra);
    printf("Medical Allowance: ");
    scanf("%lf", &e->ma);
    printf("Conveyance: ");
    scanf("%lf", &e->convey);

    employeeCount++;
    printf("Employee added successfully.\n");
}

void displayEmployees(void) {
    if (employeeCount == 0) {
        printf("\nNo employees available.\n");
        return;
    }

    printf("\n%-5s %-20s %-15s %-15s %-12s %-12s\n",
           "ID", "Name", "Department", "Position", "Gross", "Net");

    for (int i = 0; i < employeeCount; i++) {
        Payroll p = calculatePayroll(employees[i]);
        printf("%-5d %-20s %-15s %-15s %-12.2f %-12.2f\n",
               employees[i].id, employees[i].name,
               employees[i].department, employees[i].position,
               p.gross, p.net);
    }
}

void generatePayroll(void) {
    double grossTotal = 0, deductionTotal = 0, netTotal = 0;

    printf("\n================ PAYROLL ================\n");
    for (int i = 0; i < employeeCount; i++) {
        Payroll p = calculatePayroll(employees[i]);
        grossTotal += p.gross;
        deductionTotal += p.deductions;
        netTotal += p.net;

        printf("\nID: %d\nName: %s\nGross: %.2f\nPF: %.2f\nTax: %.2f\n"
               "Deductions: %.2f\nNet Salary: %.2f\n",
               employees[i].id, employees[i].name, p.gross,
               p.pf, p.tax, p.deductions, p.net);
    }

    printf("\nTOTAL GROSS: %.2f\n", grossTotal);
    printf("TOTAL DEDUCTIONS: %.2f\n", deductionTotal);
    printf("TOTAL NET: %.2f\n", netTotal);
}

void searchEmployee(void) {
    int id;
    printf("\nEnter Employee ID: ");
    scanf("%d", &id);

    int index = findEmployee(id);
    if (index == -1) {
        printf("Employee not found.\n");
        return;
    }

    Payroll p = calculatePayroll(employees[index]);
    printf("\nEmployee Details\n");
    printf("ID: %d\nName: %s\nDepartment: %s\nPosition: %s\n",
           employees[index].id, employees[index].name,
           employees[index].department, employees[index].position);
    printf("Base Salary: %.2f\nGross Salary: %.2f\nNet Salary: %.2f\n",
           employees[index].baseSalary, p.gross, p.net);
}

void settings(void) {
    printf("\nCurrent Income Tax Rate: %.2f%%\n", taxRate);
    printf("Current PF Rate: %.2f%%\n", pfRate);

    printf("New Income Tax Rate: ");
    scanf("%lf", &taxRate);
    printf("New PF Rate: ");
    scanf("%lf", &pfRate);

    printf("Settings updated.\n");
}

void saveCSV(void) {
    FILE *fp = fopen("payroll_export.csv", "w");
    if (!fp) {
        printf("Unable to create CSV file.\n");
        return;
    }

    fprintf(fp, "ID,Name,Department,Position,Base Salary,Gross,PF,Tax,Net\n");
    for (int i = 0; i < employeeCount; i++) {
        Payroll p = calculatePayroll(employees[i]);
        fprintf(fp, "%d,\"%s\",\"%s\",\"%s\",%.2f,%.2f,%.2f,%.2f,%.2f\n",
                employees[i].id, employees[i].name, employees[i].department,
                employees[i].position, employees[i].baseSalary,
                p.gross, p.pf, p.tax, p.net);
    }

    fclose(fp);
    printf("payroll_export.csv created successfully.\n");
}

int main(void) {
    int choice;

    while (1) {
        printf("\n========================================\n");
        printf("     PAYROLL MANAGEMENT SYSTEM - C\n");
        printf("========================================\n");
        printf("1. Add Employee\n");
        printf("2. Display All Employees\n");
        printf("3. Search Employee\n");
        printf("4. Generate Payroll\n");
        printf("5. Payroll Settings\n");
        printf("6. Export CSV\n");
        printf("7. Exit\n");
        printf("Enter choice: ");

        if (scanf("%d", &choice) != 1) {
            printf("Invalid input.\n");
            while (getchar() != '\n');
            continue;
        }

        switch (choice) {
            case 1: addEmployee(); break;
            case 2: displayEmployees(); break;
            case 3: searchEmployee(); break;
            case 4: generatePayroll(); break;
            case 5: settings(); break;
            case 6: saveCSV(); break;
            case 7:
                printf("Thank you for using Payroll Management System.\n");
                return 0;
            default:
                printf("Invalid choice.\n");
        }
    }
}
