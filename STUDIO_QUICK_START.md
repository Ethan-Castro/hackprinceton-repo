# v0 Studio - Quick Start Guide

Get started with domain-specific AI content generation in minutes.

## 🚀 Access the Studios

Click to open in your browser:

| Studio | URL | Best For |
|--------|-----|----------|
| 🎓 **Education** | [localhost:3001/education/studio](http://localhost:3001/education/studio) | Quizzes, lessons, learning apps |
| ❤️ **Health** | [localhost:3001/health/studio](http://localhost:3001/health/studio) | Health trackers, medical dashboards |
| 💼 **Business** | [localhost:3001/business/studio](http://localhost:3001/business/studio) | Analytics, CRM, business tools |
| 🌱 **Sustainability** | [localhost:3001/sustainability/studio](http://localhost:3001/sustainability/studio) | Carbon tracking, ESG reports |

## 📝 How to Use

### 1. Choose Your Prompt

**Education Studio** - Try:
```
Create an interactive quiz on photosynthesis
```

**Health Studio** - Try:
```
Build a medication tracker with reminders
```

**Business Studio** - Try:
```
Create a sales dashboard with KPI metrics
```

**Sustainability Studio** - Try:
```
Build a carbon footprint calculator
```

### 2. Watch the Magic

- Type your prompt or click an example
- AI generates your content in seconds
- Live preview appears on the right
- Continue chatting to refine

### 3. Iterate & Improve

Keep the conversation going:
- "Add dark mode support"
- "Make it mobile responsive"
- "Add more detailed charts"
- "Change the color scheme to blue"

## 🔑 Key Features

### Split-Screen Interface
- **Left:** Chat with AI
- **Right:** Live preview

### AI Elements Components
Uses official v0 Platform API components:
- Professional message rendering
- Smart input with file uploads
- Beautiful suggestion cards
- Interactive preview panel

### Authentication Options

| User Type | Daily Limit | Persistence |
|-----------|-------------|-------------|
| Anonymous | 3 chats | No |
| Guest | 5 chats | Session |
| Registered | 50 chats | Forever |

### Recent Chats (Authenticated Users)
- See your last 5 chats at the top
- Click to reload any conversation
- Continue where you left off

## 💡 Pro Tips

1. **Be Specific:** Better prompts = better results
   - ❌ "Make a dashboard"
   - ✅ "Create a sales dashboard with monthly revenue chart, top products table, and conversion rate KPI"

2. **Iterate Gradually:** Make one change at a time
   - First: Get the basic structure
   - Then: Refine the design
   - Finally: Add advanced features

3. **Use Domain Context:** Each studio understands its domain
   - Education knows about grades, subjects, pedagogy
   - Health knows about medications, symptoms, HIPAA
   - Business knows about metrics, reports, dashboards
   - Sustainability knows about carbon, ESG, emissions

4. **Reference Components:** Ask for specific UI patterns
   - "Use a kanban board layout"
   - "Add a line chart with Recharts"
   - "Create a modal dialog"
   - "Use tabs for navigation"

## 🎨 Example Prompts by Domain

### Education Studio

```
Create a multiplication table practice game for 3rd graders with:
- Random multiplication problems
- Score tracking
- Timer
- Colorful, kid-friendly design
- Celebration animations for correct answers
```

### Health Studio

```
Build a daily symptom tracker with:
- Multiple symptom types (pain, fatigue, mood)
- Severity scale 1-10
- Notes section
- Weekly chart showing trends
- Export to PDF button
```

### Business Studio

```
Design a customer pipeline dashboard showing:
- Lead stages (prospect, qualified, proposal, negotiation, closed)
- Conversion rates between stages
- Revenue forecast
- Top deals table
- Win rate KPI
```

### Sustainability Studio

```
Create a corporate carbon footprint calculator that:
- Calculates emissions from energy, travel, waste
- Shows breakdown by category (pie chart)
- Compares to industry benchmarks
- Suggests reduction strategies
- Tracks progress over time
```

## 🔧 Troubleshooting

### Preview Not Showing
1. Check if v0 API key is configured
2. Refresh the page
3. Try a simpler prompt first
4. Check browser console for errors

### Chat Not Saving (Authenticated Users)
1. Verify you're logged in (see email in footer)
2. Check database connection
3. Look for error messages in red alert box

### Rate Limit Reached
- **Anonymous:** Sign up for more chats
- **Guest:** Create a full account
- **Registered:** Limit resets every 24 hours

## 📚 Learn More

- **Full Documentation:** See [V0_STUDIO_README.md](V0_STUDIO_README.md)
- **v0 Platform API:** [v0.dev/docs/api/platform](https://v0.dev/docs/api/platform)
- **AI Elements:** [v0.dev/docs/ai-elements](https://v0.dev/docs/ai-elements)

## 🆘 Need Help?

**Common Questions:**

**Q: Can I export the generated code?**
A: Not yet, but this feature is planned. For now, you can view the preview and use browser dev tools to inspect.

**Q: Does it work with my own v0 API key?**
A: Yes! Set `V0_API_KEY` in your `.env.local` file.

**Q: Can I customize the system prompts?**
A: Yes! Edit the components in `components/v0-studio/` to modify prompts and examples.

**Q: Can I add my own domain studio?**
A: Absolutely! See "Extending the System" in the full README.

---

**Ready to build?** Pick a studio and start creating! 🚀
