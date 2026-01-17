# QuickTask Application

A modern, feature-rich task management application built with Next.js, Supabase, and Shadcn UI.

## 🚀 Features

- ✅ **Task Management** - Create, edit, delete, and organize tasks
- 📅 **Calendar View** - Visualize tasks by date with interactive calendar
- 🎯 **Priority & Status** - Organize tasks by priority (High/Medium/Low) and status
- 📊 **Dashboard** - Overview of all your tasks with statistics
- 🌅 **My Day** - Focus on today's tasks
- 📆 **Upcoming** - View tasks with upcoming deadlines
- ⚡ **Important** - Filter high and medium priority tasks
- 📁 **Projects** - Organize tasks by project
- 👥 **Team** - Collaborate on team tasks
- 🔔 **Real-time Updates** - Changes sync instantly across all tabs
- 🌓 **Dark Mode** - Beautiful dark theme support
- 📱 **Responsive Design** - Works perfectly on mobile, tablet, and desktop

## 🛠️ Tech Stack

- **Framework:** Next.js 16.1.3 (with Turbopack)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **UI Components:** Shadcn UI + Radix UI
- **Styling:** Tailwind CSS
- **Icons:** Tabler Icons
- **Date Handling:** date-fns
- **Tables:** TanStack Table
- **Notifications:** Sonner (Toast)
- **Theme:** next-themes

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Gokulakrishnxn/QuickTask-Application.git
   cd QuickTask-Application
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database:**
   
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL from `supabase-schema.sql`
   - Optionally run `supabase-seed-data.sql` for sample data

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
taskapp/
├── app/                      # Next.js app directory
│   ├── dashboard/           # Dashboard page
│   ├── lists/               # Tasks list page
│   ├── my-day/              # My Day page
│   ├── upcoming/            # Upcoming tasks page
│   ├── important/           # Important tasks page
│   ├── projects/            # Projects page
│   ├── team/                # Team page
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── ui/                  # Shadcn UI components
│   ├── app-sidebar.tsx      # Application sidebar
│   ├── site-header.tsx      # Header with theme toggle
│   ├── tasks-table.tsx      # Tasks data table
│   ├── create-task-sheet.tsx # Task creation form
│   └── task-overview-sheet.tsx # Task details view
├── hooks/                   # Custom React hooks
│   └── use-tasks.ts         # Supabase tasks hook
├── lib/                     # Utilities
│   ├── supabase.ts          # Supabase client
│   └── utils.ts             # Helper functions
└── public/                  # Static assets
```

## 🎨 Key Features

### Dashboard
- Overview of all tasks with statistics
- Task status and priority distribution
- Recent tasks list
- Completion rate tracking

### Calendar View (Upcoming)
- Interactive calendar with task indicators
- Click dates to view tasks
- Red dots for high-priority tasks
- Blue dots for regular tasks
- Grouped task list by date

### Task Management
- **Add tasks** with title, description, dates, and reminders
- **Edit tasks** inline with dropdown menus
- **Delete tasks** with confirmation
- **Mark complete** with checkbox
- **Change status** (Todo, In Progress, Done, Backlog, Canceled)
- **Change priority** (Low, Medium, High)

### Real-time Features
- Instant UI updates (optimistic updates)
- Real-time sync across browser tabs
- Toast notifications for all actions
- Loading states for better UX

## 🔧 Configuration

### Supabase Setup

See `SUPABASE_SETUP.md` for detailed instructions.

Quick setup:
1. Create a Supabase project
2. Run `supabase-schema.sql` in SQL Editor
3. Add environment variables to `.env.local`
4. Restart dev server

### Adding Missing Columns

If you have an existing database, run `add-missing-columns.sql` to add new fields.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🎯 Usage

### Creating a Task
1. Click "Add Task" button (sidebar or page header)
2. Fill in task details (only title is required)
3. Click "Add Task" to save
4. See success notification

### Viewing Task Details
1. Click on any task in the list
2. Right-side sheet opens with full details
3. Mark complete or delete from the sheet

### Filtering Tasks
- **My Day** - Tasks for today
- **Upcoming** - Tasks with future dates
- **Important** - High/medium priority tasks
- **Projects** - Project-related tasks
- **Team** - Team collaboration tasks

## 🌟 Highlights

- **Beautiful UI** - Modern design with Shadcn components
- **Fast Performance** - Optimistic updates for instant feedback
- **Type-safe** - Full TypeScript support
- **Accessible** - WCAG compliant components
- **Responsive** - Mobile-first design
- **Dark Mode** - Automatic theme switching

## 🐛 Troubleshooting

### Tasks not loading?
- Check Supabase connection in browser console
- Verify environment variables are set
- Ensure database table exists

### Can't add/edit/delete tasks?
- Check Row Level Security (RLS) policies
- Run `test-delete.sql` to verify permissions
- Check browser console for errors

### Missing columns error?
- Run `add-missing-columns.sql` in Supabase
- Or recreate table with `supabase-schema.sql`

## 📄 License

MIT License - feel free to use this project for learning or production!

## 👨‍💻 Author

Built with ❤️ by Gokulakrishnan

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
