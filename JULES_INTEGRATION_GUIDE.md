# Jules.Google Integration Guide

## What is Jules?

**Jules** (https://jules.google.com) is Google's experimental coding agent. It's NOT an AI API you call from Python - it's a **browser-based coding assistant** that:

- Runs in a virtual machine (VM)
- Monitors GitHub repositories
- Executes tasks you give it
- Writes and modifies code
- Runs asynchronously (hours/days if needed)
- Sends browser notifications when complete

**Important:** Jules is a coding agent that EXECUTES your framework, not an AI service that your framework CALLS.

---

## Setting Up Jules with Asymmetrica Google Hub

### Step 1: Access Jules

1. Visit: https://jules.google.com
2. Sign in with your Google account
3. (May require waitlist approval - Jules is experimental as of October 2025)

### Step 2: Connect GitHub

1. Click "Connect Repository" in Jules interface
2. Authorize GitHub access
3. Select: `asymmetrica-google-hub` repository

### Step 3: Jules Reads Context

Jules automatically reads `AGENTS.md` in your repository to understand:
- What this project does
- What your role is (Jules as the synthesis implementer)
- What components are available (DefenseKit, Google API, Memory)
- What tasks need to be performed (implement `synthesize_batch()`)

### Step 4: Give Jules Tasks

Click "New Task" in Jules interface and provide a prompt:

#### Example Task 1: Implement Synthesis

```
Please implement the synthesize_batch() function in main.py.

Requirements:
1. Read markdown documents from the batch parameter
2. Apply the "Neutral Historian" protocol to translate esoteric
   language to rigorous scientific language
3. Preserve all factual information and timeline
4. Return publication-quality synthesized text

Use the existing batch structure where each doc has:
- 'path': file path
- 'content': markdown content
- 'metadata': file info

The function should return a string with the synthesized content.
```

#### Example Task 2: Execute Synthesis

```
Please run the synthesis workflow:

1. Execute: python main.py
2. Verify it scans source_materials/ directory
3. Check that Williams Optimizer calculates batch size
4. Ensure Harmonic Timer rate-limits API calls
5. Confirm output is written to Google Doc

Report any errors or issues.
```

#### Example Task 3: Add Features

```
Please add a new feature to track synthesis history:

1. Create a new table in the Memory System database
2. Store: timestamp, documents processed, synthesis length
3. Add a method to retrieve synthesis history
4. Update main.py to log each synthesis run

Use the existing AsymmetricaMemory class as reference.
```

### Step 5: Review Plans

Jules will:
1. Generate an execution plan
2. Show you what it plans to do
3. Wait for your approval

**Review the plan carefully before approving!**

### Step 6: Monitor Execution

Jules runs in a VM:
- You'll see progress updates in the Jules interface
- You'll get browser notifications
- You can check GitHub for commits Jules makes

### Step 7: Review Results

When Jules completes:
1. Check the GitHub commits Jules made
2. Review code changes
3. Test the implementation locally
4. Give feedback or assign new tasks

---

## Common Workflows

### Weekly Synthesis Workflow

**Monday-Friday:** You accumulate documentation throughout the week

**Friday:**
```
You → Visit jules.google.com
Task: "Synthesize all new documents from this week"
Jules → Executes python main.py in VM
Result → Google Doc updated with synthesized content
```

### Discovery Session Workflow

**During Discovery:** (You + Claude in terminal)
- Make breakthrough discoveries
- Document in markdown files
- Commit to local repos

**After Discovery:**
```
You → Copy docs to source_materials/
You → Visit jules.google.com
Task: "Synthesize today's discoveries using Neutral Historian protocol"
Jules → Processes documents
Result → Living Constitution Google Doc updated
```

### Continuous Integration Workflow

**Setup:**
```
You → Visit jules.google.com
Task: "Monitor asymmetrica-google-hub for new commits.
When you detect new *.md files in source_materials/,
automatically run python main.py"
```

**Result:** Automatic synthesis on every commit!

---

## Troubleshooting

### Jules Doesn't See My Repository

- Check GitHub authorization in Jules settings
- Verify repository access permissions
- Try disconnecting and reconnecting GitHub

### Jules Task Fails

- Check execution logs in Jules interface
- Verify `credentials.json` exists in project root
- Check `GOOGLE_DOC_ID` in config.py
- Review `AGENTS.md` for clarity

### Synthesis Quality Issues

- Refine your task prompt with specific examples
- Give Jules examples of good synthesis
- Iterate with feedback: "The synthesis was too verbose, please make it more concise"

### API Rate Limits

- Harmonic Timer should handle this automatically
- If issues persist, check Google API quotas in Cloud Console
- Verify service account permissions

---

## Best Practices

### Writing Good Prompts for Jules

**Good:**
```
Please implement synthesize_batch() to translate
esoteric language to rigorous scientific terminology
while preserving factual accuracy.

Example:
- "The grimoire revealed" → "Analysis identified"
- "Blessed journey" → "Research investigation"
```

**Bad:**
```
Make synthesis work
```

**Why:** Jules needs context, requirements, and examples to generate good code.

### Iterative Improvement

1. Give Jules an initial task
2. Review the results
3. Provide specific feedback
4. Jules refines implementation
5. Repeat until satisfied

Example iteration:
```
Initial: "Please implement synthesize_batch()"
Review: Output is too verbose
Feedback: "Please refine synthesize_batch() to be more concise - aim for 500-1000 words per batch instead of 2000+"
Jules: Adjusts implementation
```

### Monitoring

- Check Jules browser notifications
- Review GitHub commits regularly
- Verify Google Doc updates
- Check Memory System logs: `asymmetrica_memory.db`

---

## FAQ

### Q: Do I need API keys for Claude/GPT-4?

**A:** No! Jules is the AI. It writes the code that processes documents. You don't need to call any external AI APIs unless you want Jules to implement synthesis using an AI API (which is optional).

### Q: How much does Jules cost?

**A:** Jules is currently free (experimental Google product as of October 2025). Check https://jules.google.com for latest pricing.

### Q: Can Jules run on a schedule?

**A:** Yes, you can give Jules ongoing monitoring tasks like "Check for new commits every day and run synthesis."

### Q: What if Jules makes mistakes?

**A:** Review all code changes before merging. You have full control via GitHub. Jules commits to your repository, so you can review, revert, or modify any changes.

### Q: Can I use Jules with other projects?

**A:** Yes! Jules works with any GitHub repository. Just connect it and give Jules tasks.

### Q: How long does Jules take to complete tasks?

**A:** Depends on complexity. Simple tasks (minutes), complex implementations (hours). Jules runs asynchronously, so you can close your browser and get notified when done.

### Q: Can I run the framework without Jules?

**A:** Yes! You can implement the synthesis logic manually or use any LLM API (Claude, GPT-4, local Ollama, etc.). Jules is just the recommended approach for implementation.

---

## Comparison: Jules vs Manual Implementation

### Using Jules.Google:

**Pros:**
- Jules writes the code for you
- Asynchronous execution (set it and forget it)
- Browser notifications when complete
- No need to write synthesis logic manually
- Free (as of October 2025)

**Cons:**
- Requires GitHub integration
- Experimental service (may change)
- Need to review Jules' code

### Manual Implementation:

**Pros:**
- Full control over synthesis logic
- Can use any LLM API
- No dependency on Jules availability

**Cons:**
- You write all the code
- Need to handle LLM API integration
- Costs for API usage (Claude, GPT-4, etc.)

---

## Example: Complete Workflow with Jules

### Day 1: Setup

```
1. You: Visit jules.google.com
2. You: Connect asymmetrica-google-hub repository
3. Jules: Reads AGENTS.md automatically
4. You: Give task: "Implement synthesize_batch() function in main.py"
5. Jules: Generates plan, shows you
6. You: Approve plan
7. Jules: Implements code in VM
8. Jules: Commits to GitHub
9. Jules: Notifies you in browser
10. You: Review commit, test locally
```

### Day 2: First Synthesis

```
1. You: Add markdown files to source_materials/
2. You: Commit to GitHub
3. You: Give Jules task: "Run python main.py to synthesize documents"
4. Jules: Executes in VM
5. Jules: Framework runs:
   - Scans source_materials/
   - Williams optimizer calculates batches
   - Synthesis happens
   - Writes to Google Doc
6. Jules: Notifies you
7. You: Check Google Doc for results
```

### Day 3: Iteration

```
1. You: Review synthesis in Google Doc
2. You: Give Jules feedback: "Make synthesis more concise"
3. Jules: Refines synthesize_batch() function
4. Jules: Commits changes
5. You: Give Jules task: "Run synthesis again"
6. Jules: Executes
7. You: Review improved output
```

---

## Advanced: Jules Monitoring Tasks

### Automatic Synthesis on Commit

```
Task: "Monitor this repository. When source_materials/ gets new *.md files,
automatically run python main.py and report results."
```

### Quality Checks

```
Task: "After each synthesis run, check that:
1. Google Doc was updated
2. Memory database has new entries
3. No errors in logs
Report any issues."
```

### Periodic Reporting

```
Task: "Every Friday at 5pm, generate a weekly synthesis report:
1. Count documents processed this week
2. Calculate total synthesis length
3. Check Williams efficiency metrics
4. Create summary report in Google Doc"
```

---

## Resources

### Jules Documentation
- Official site: https://jules.google.com
- Help: https://jules.google/docs (if available)

### This Project
- `AGENTS.md` - Context for Jules
- `README.md` - Quick start guide
- `ARCHITECTURE.md` - System design
- `PROJECT_SUMMARY.md` - Component catalog

### Support
- GitHub Issues: For repository-specific questions
- Jules Community: Check jules.google.com for community forums

---

## Security Notes

### What Jules Has Access To:

- Your GitHub repository (read/write)
- Files in the repository
- Ability to execute code in VM
- Ability to commit changes

### What Jules Does NOT Have Access To:

- Your local files (outside the repo)
- Your Google credentials (unless in repo - DON'T commit credentials!)
- Other repositories (unless you connect them)

### Best Practices:

1. **NEVER** commit `credentials.json` to GitHub
2. Keep sensitive data in `.gitignore`
3. Review all Jules commits before merging to main
4. Use service accounts for Google API (not personal accounts)
5. Limit Jules to non-production repositories initially

---

## Conclusion

Jules.Google is a powerful tool for implementing the Asymmetrica Google Hub synthesis logic. It's designed to:

1. **Read** your framework context from `AGENTS.md`
2. **Understand** what needs to be implemented
3. **Write** the code for synthesis logic
4. **Execute** the framework in a VM
5. **Notify** you when complete

This is fundamentally different from calling an AI API from Python. Jules is the agent that USES your framework, not a service your framework CALLS.

**Next Steps:**

1. Visit https://jules.google.com
2. Connect this repository
3. Give Jules your first task
4. Review and iterate

**Happy synthesizing!**

---

*"Better Math for Everyone!"* - Asymmetrica R&D Laboratory

Last Updated: October 8, 2025
