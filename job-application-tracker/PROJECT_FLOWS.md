# Project Flows

This document maps the main end-to-end flows in the Job Application Tracker.

## 1) Authentication Flow

```mermaid
flowchart TD
    A[User opens app] --> B{Has valid session?}
    B -- No --> C[Go to Sign In / Sign Up]
    C --> D[Auth via better-auth]
    D --> E[Session created]
    E --> F[Redirect to Dashboard]
    B -- Yes --> F[Open Dashboard]
```

## 2) New User Board Initialization Flow

```mermaid
flowchart TD
    A[Dashboard request] --> B[getSession]
    B --> C[connectDB]
    C --> D[initializeUserBoard userId]
    D --> E{Board exists?}
    E -- Yes --> H[Load existing board]
    E -- No --> F[Create Job Hunt board]
    F --> G[Create default columns]
    G --> H[Load board with columns]
    H --> I[Render Kanban]
```

## 3) Dashboard Data Load Flow

```mermaid
flowchart TD
    A[Open /dashboard] --> B[getBoard userId]
    B --> C[Board.findOne userId + name]
    C --> D[Populate columns]
    D --> E[Populate column.jobApplicationId]
    E --> F[Send board to client]
    F --> G[Kanban sorts columns by order]
    G --> H[Each column sorts jobs by order]
```

## 4) Create Job Flow

```mermaid
flowchart TD
    A[User clicks Add Job] --> B[Submit create-job form]
    B --> C[createJobApplication action]
    C --> D[Validate session + board ownership]
    D --> E[Find target column]
    E --> F[Compute next order]
    F --> G[Create JobApplication document]
    G --> H[Push job id to column.jobApplicationId]
    H --> I[revalidatePath /dashboard]
    I --> J[router.refresh]
    J --> K[Updated job appears in column]
```

## 5) Edit Job Flow

```mermaid
flowchart TD
    A[User opens card menu] --> B[Click Edit]
    B --> C[Edit dialog prefilled from job]
    C --> D[Submit update form]
    D --> E[updateJobApplication action]
    E --> F[Validate session + ownership]
    F --> G[Apply field updates]
    G --> H[findByIdAndUpdate]
    H --> I[revalidatePath /dashboard]
    I --> J[router.refresh]
    J --> K[Card displays updated values]
```

## 6) Move Job Between Columns Flow

```mermaid
flowchart TD
    A[User opens card menu] --> B[Click Move to <column>]
    B --> C[updateJobApplication with new columnId]
    C --> D[Validate session + ownership]
    D --> E[Remove job id from non-target columns]
    E --> F[Compute new order in target column]
    F --> G[Update job columnId and order]
    G --> H[Add job id to target column.jobApplicationId]
    H --> I[revalidatePath /dashboard]
    I --> J[router.refresh]
    J --> K[Job appears only in target column]
```

## 7) Delete Job Flow

```mermaid
flowchart TD
    A[User clicks Delete on card] --> B[deleteJobApplication action]
    B --> C[Validate session + ownership]
    C --> D[Pull job id from column.jobApplicationId]
    D --> E[Delete JobApplication document]
    E --> F[revalidatePath /dashboard]
    F --> G[router.refresh]
```

## 8) Add Column Flow

```mermaid
flowchart TD
    A[User clicks Add Column] --> B[Prompt for column name]
    B --> C[createColumn action]
    C --> D[Validate session + board ownership]
    D --> E[Compute next column order]
    E --> F[Create Column]
    F --> G[Push column id to board.columns]
    G --> H[revalidatePath /dashboard]
    H --> I[router.refresh]
    I --> J[New column appears]
```

## 9) Delete Column Flow

```mermaid
flowchart TD
    A[User opens column menu] --> B[Click Delete Column]
    B --> C[Confirm prompt]
    C --> D[deleteColumn action]
    D --> E[Validate session + board ownership]
    E --> F[Delete all jobs in column]
    F --> G[Pull column id from board.columns]
    G --> H[Delete column document]
    H --> I[revalidatePath /dashboard]
    I --> J[router.refresh]
    J --> K[Column removed from board]
```

## 10) Seed Data Flow

```mermaid
flowchart TD
    A[npm run seed:jobs] --> B[Load env + connectDB]
    B --> C[Resolve seed user id]
    C --> D[Find or initialize Job Hunt board]
    D --> E[Load columns]
    E --> F[Clear existing jobs for user]
    F --> G[Create sample jobs with order]
    G --> H[Push job ids into each column]
    H --> I[Seed complete]
```

## Notes

- Job-to-column relationship is maintained in both places:
  - JobApplication.columnId
  - Column.jobApplicationId[]
- UI rendering uses populated Column.jobApplicationId entries.
- Order is numeric and used for deterministic sorting in columns.
