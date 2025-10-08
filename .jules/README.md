# .jules/ Directory

This directory is reserved for Jules.Google-specific configuration and history.

## Purpose

Jules.Google (https://jules.google.com) may use this directory to store:
- Task execution logs
- Synthesis history
- Plan approvals
- Execution metadata
- Temporary working files

## Important Notes

1. **Do not manually modify files in this directory** unless you know what you're doing
2. **This directory is gitignored** to prevent committing Jules-specific data
3. **Jules may create subdirectories** for different purposes
4. **Logs and history** help track what Jules has done

## What You'll Find Here

After Jules runs tasks, you may see:

- `task_history.json` - List of tasks Jules has executed
- `execution_logs/` - Detailed logs from each execution
- `plans/` - Execution plans Jules generated
- `metadata/` - Metadata about synthesis runs

## If This Directory Is Empty

That's normal! Jules will populate it as it executes tasks.

If you want to see what Jules has done:
1. Visit https://jules.google.com
2. Check the task history in Jules interface
3. Review GitHub commits Jules made

---

**Note:** This is placeholder documentation. The actual structure depends on how Jules.Google implements its file management.

Last Updated: October 8, 2025
