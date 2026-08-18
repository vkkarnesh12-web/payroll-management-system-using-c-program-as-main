# Payroll Management System

Complete student project containing:

- Login and Sign Up
- Forgot Password
- Dashboard
- Employee Management
- Add Employee
- Payroll Calculation
- Tax and PF settings
- Reports and department breakdown
- CSV export
- JSON backup
- C payroll core/backend module

## Run the website in VS Code

Open this folder in VS Code and use Live Server, or open `login.html` in a browser.

Demo login:

Email: `admin@payroll.com`
Password: `admin123`

## Run the C program

Using GCC:

```bash
gcc logic.c -o logic.exe
./logic.exe
```

On Windows CMD:

```cmd
gcc logic.c -o logic.exe
logic.exe
```

## Important architecture note

The Netlify/static website uses HTML/CSS/JavaScript and browser localStorage. Netlify static hosting does not execute a C executable as a web backend.

`logic.c` is therefore the C payroll/core module. To make the browser UI communicate with C in a real client-server architecture, the C program must be exposed through an HTTP/CGI/API server.
