# Angular Task Manager

A simple **Task Management Application** built with **Angular** and **Tailwind CSS**.
The app enables users to create, update, search, filter, and sort tasks with a clean and responsive UI.
It follows a structured Angular architecture using **components**, **services**, and **signals** for state management.

---

## 🚀 Features

* **Task CRUD** – Add, Edit, and Delete tasks
* **Status Tracking** – Manage tasks as `Pending`, `In Progress`, or `Completed`
* **Search & Filter** – Search tasks by title or filter by status
* **Sorting** – Sort tasks by due date or task ID (ascending/descending)
* **Responsive UI** – Modern design powered by TailwindCSS

---

## 📸 Preview

![Login Page Screenshot](./public/login.png)
![App Screenshot](./public/dashboard.png)

---

## 🛠️ Tech Stack

* [Angular](https://angular.dev/) – Frontend framework
* [Tailwind CSS](https://tailwindcss.com/) – Styling
* [TypeScript](https://www.typescriptlang.org/) – Strongly typed JavaScript

---

## ⚙️ Installation & Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/angular-task-manager.git
   cd angular-task-manager
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   ng serve
   ```

4. Open your browser at:

   ```
   http://localhost:4200
   ```

---

## 📂 Project Structure

```
src/
 ├── app/
 │   ├── pages/              # Feature pages (dashboard, login, logout, etc.)
 │   │   ├── dashboard/      # Dashboard feature module/components
 │   │   │   ├── header/     
 │   │   │   ├── stat/       
 │   │   │   ├── todo-list/  
 │   │   │   └── dashboard.ts
 │   │   ├── login/          
 │   │   └── logout/         
 │   │
 │   ├── components/         # Reusable UI components (shared across pages)
 │   ├── services/           # Business logic & API state management (auth, todo, etc.)
 │   ├── models/             # Interfaces & data types (Todo, TaskStats, User, etc.)
 │   ├── guards/             # Route guards (AuthGuard, etc.)
 │   ├── app.routes.ts       # Central routing configuration
 │   ├── app.component.ts    # Root component
 │   └── app.config.ts       # Application-level config (providers, bootstrap)
 │
 └── assets/                 # Static files (icons, images, etc.)
```
---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.
Fork the repository and submit a pull request to improve the project.

---

## 📜 License

This project is licensed under the **MIT License** – see the [LICENSE](./LICENSE) file for details.