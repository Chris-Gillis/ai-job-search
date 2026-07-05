# Interview Preparation Guide

<!-- SETUP: STAR examples are personalized by running /setup based on your actual experience -->

## STAR Format

Structure answers as: **Situation** (context), **Task** (your responsibility), **Action** (what you did), **Result** (outcome).

Keep answers to 1-2 minutes. Be specific. End with what you learned or would do differently.

## STAR Candidates (Complete Manually)

<!-- /setup generated these stubs from resume achievements. Fill in the S/T/A/R
     details in your own words before using them in an interview. Aim for 4-6. -->

### Serverless Lambda re-architecture (reliability, ownership)
**Source:** Agent.ai
**Use for:** "improved reliability / owned a hard production problem," "a system you re-architected," "took initiative without being told," "how you found a root cause."
**S:** Every serverless action on the platform was routed through its own dedicated API Gateway. AWS caps API Gateways per region, and the team's workaround had been to spin up a new region each time the current one filled. There was also no cleanup of old or unused functions, and every code update created a brand-new gateway and function instead of reusing the existing one, so regions filled even faster. Users hit this directly: they couldn't create new serverless function actions or deploy updates to existing ones.
**T:** I took ownership of making serverless actions reliable again and fixing it at the root, not patching symptoms.
**A:** I debugged a batch of failing functions and saw they shared one root cause, the per-function API Gateway architecture, not the function code. Instead of adding more regions or a cleanup script, I re-architected the deployment to drop API Gateway and use the HTTPS endpoints Lambda provides for free (function URLs). That removed the per-region API Gateway limit as a bottleneck, let us consolidate onto a single region, and meant updates reused the existing function instead of spawning new assets. I picked it up and shipped it on my own initiative; it had gone unfixed only for lack of bandwidth, not because it was hard.
**R:** Support tickets tied to serverless functions dropped 55%, users could reliably create and update function actions again, and we stopped the region-hopping treadmill. My takeaway: the simplest fix is often sitting in plain sight, and a bias toward action pays off. I saw the root cause and fixed it rather than waiting to be told to.

### Rails-to-Go migration + caching layer (architecture, safe delivery)
**Source:** Spaceback
**Use for:** "describe a large migration," "a performance problem you solved," "shipping a big change safely in production," "a technical decision you owned."
**S:** The product ran on a Rails monolith that was struggling with latency and cost. One of the worst offenders was social-post importing: the code re-fetched every post from the external source on each load, which was both slow and expensive.
**T:** I planned and led a migration from the Rails monolith to a hybrid Rails + Go services architecture, and I chose social-post importing as the first slice to move because it was the highest-impact pain point.
**A:** Instead of fetching from the external source on every request, I built a background job that pulled the social-post data on a schedule and cached it in our caching store, so the app read from cache rather than hitting the external API live. I stood up the new Go service alongside the existing Rails code and cut the import path over to it in production, keeping existing functionality working throughout rather than doing a big-bang rewrite.
**R:** Average load times dropped 20-25% and we cut the cost of the repeated external fetches, while proving out the hybrid Rails+Go architecture that later work could build on. The hardest and most instructive part was doing it live: the real skill wasn't the Go code, it was migrating a running production system one slice at a time without breaking what users relied on.

### Establishing frontend testing from zero (quality, initiative)
**Source:** Agent.ai
**Use for:** "improved quality or process," "showed initiative without being asked," "raised the bar on a team," "set up testing/CI."
**S:** The frontend had no automated tests at all, while the Python backend already had solid pytest coverage. Regressions landed fairly often, and, more damaging, we had low confidence in our CI/CD pipeline, since a green build said nothing about whether the frontend actually worked.
**T:** I took it on myself to bring the frontend up to the backend's standard and give us real confidence in releases.
**A:** I set up two layers of testing, both on React Testing Library, and built the harness from scratch into GitHub Actions: Jest for unit tests and Cypress for end-to-end. I matched the tool to the surface, using Cypress e2e for the stable, high-value flows (admin, settings/profile) and Jest unit tests for new functionality as it was built, like the Agent Builder. Because Cypress is slower, I ran it on a regular cadence off the critical path so it never blocked PRs; Jest runs at PR time and surfaces failures directly on the pull request, so issues are visible to author and reviewer without hard-gating merges.
**R:** Coverage went from 0% to about 50%, and regressions in the Agent Builder went from a firehose to a trickle, and the team could finally trust the pipeline. My takeaway: starting from zero, the coverage percentage isn't the real goal, confidence is, so I put fast feedback where it mattered (unit tests at PR time) and kept the slow, broad checks running without getting in everyone's way.

### Secure MCP client with OAuth DCR (AI agent integration, building to a standard)
**Source:** Agent.ai
**Use for:** "a complex or security-sensitive integration," "recent AI/agent work," "designing an auth flow," "building to an open standard/spec," "a feature that unlocked new capability."
**S:** On Agent.ai, agents could only use the tools we built into the platform. MCP (the Model Context Protocol) was becoming the standard way for tools to expose themselves to AI agents, but on-platform agents couldn't consume external MCP servers, so builders were boxed into our built-in capabilities.
**T:** I designed and built a secure MCP client, and the UI workflow around it, so agents could connect to any external tool that exposed an MCP server.
**A:** I implemented the client to the MCP spec and used OAuth Dynamic Client Registration for auth. DCR is the standard the spec points to, and it lets the client register itself with the external server automatically, so builders don't have to hand-manage API keys or credentials to connect a tool. I owned both the client integration and the connect/authorize UI flow that builders use to hook a server up.
**R:** It opened the platform up: on-platform agents could now use essentially any tool a builder wanted, as long as it provided an MCP server, which they couldn't do before, and without manually juggling API keys. My takeaway: building to the open standard instead of hand-rolling a per-tool integration meant the feature worked with the whole MCP ecosystem at once, and picking the auth flow that removed user friction (DCR over manual keys) mattered as much as the integration itself.

### Mentoring / people & influence (TO RECALL - do not fake)
**Status:** No specific story yet. The resume facts (mentored junior devs at HomeCare Connect; code reviews across 8 engineers and API-contract guidelines at OneScreen.ai) are too old to recall in detail, so this stays a prompt rather than invented specifics. A fabricated people story falls apart on the first follow-up question.
**Why keep the slot:** The four filled examples above are all technical-ownership stories. Interviewers usually ask a dedicated people / influence / conflict question, so it's worth having one real answer here.
**Partial coverage today:** The frontend-testing example already doubles as "influenced how a team works" (introduced testing the whole team then adopted). Fall back to it if a pure mentoring story doesn't surface.
**Memory-jog prompts (fill in when one comes back to you):**
- A time you helped a teammate get unstuck or level up (even recently, at Agent.ai): what did they struggle with, what did you do, what changed?
- A technical decision you got peers to adopt without being their manager (e.g. the testing approach, an API convention, the MCP direction).
- A disagreement with a teammate you navigated to a good outcome.

## Common Tough Questions

### "Why are you looking to leave your current role (Agent.ai)?"
> I've had a great run at Agent.ai and I'm proud of what I shipped there, from re-architecting our serverless deployment to building the MCP client that opened the platform to external tools. I'm looking now because I want a step up in scope: more Staff-level ownership of architecture and harder systems problems, on a team where AI and agent platforms are the core focus rather than one slice of a small team's surface area. This isn't about leaving something bad, it's about wanting the next level of challenge.
>
> *[Swap in your real reason before the interview. Keep it forward-looking and never negative about Agent.ai.]*

### "You don't have [specific skill/experience]."
> You're right that I haven't worked with [X] directly, so let me be straight about where I stand and why I'm not worried about it. My career has been a run of picking up new stacks fast and shipping with them: from Java and Rails into Go, into PHP and Laravel for my own products, and most recently into the MCP and agent ecosystem, each time getting productive quickly by leaning on the fundamentals that carry over. I'd come at [X] the same way and expect to be contributing on it within [timeframe], not months out. In the meantime I bring [closest adjacent experience], which covers a lot of the same ground.
>
> *[Fill [X], [timeframe], and the adjacent experience per role.]*

### "Where do you see yourself in 5 years?"
> In five years I want to be operating at a Staff or Principal level, owning the architecture of a meaningful part of a platform and being the person the team trusts with its hardest reliability and design problems. I specifically want that to be in AI and agent infrastructure, which is where I've been pushing lately and where I think the most interesting problems are. I'm not aiming for pure people-management; I want to grow as a high-leverage engineer who still builds. A role like this is a strong step on that path because [role-specific reason].

### "What's your biggest weakness?"
> My biggest weakness is the flip side of how I get things done: when I see a problem I own, my instinct is to just fix it, sometimes before I've brought enough people along. Earlier in my career that meant I'd occasionally ship a good change that caught a teammate off guard, or take on work solo that I should have shared. What I've changed is deliberately front-loading communication: I flag what I'm about to do and why before I dive in, so the bias toward action stays an asset instead of a surprise. I still move fast, I've just gotten much better at making sure the team moves with me.

### "Why this company specifically?"
> Customize per company. Must reference: specific projects, company values, market position, or team structure. Never give a generic answer.

## Questions You Should Ask Interviewers

### About the Role
- "What does a typical week look like in this role?"
- "What would success look like in the first 6 months?"
- "What's the biggest challenge the team is facing right now?"

### About the Team
- "How big is the team, and how do you divide work?"
- "What does the development/project lifecycle look like, from idea to production?"
- "How do you onboard new team members?"

### About Tech & Growth
- "What's your current tech stack for [relevant area]?"
- "Is there room to grow into more architectural or strategic decisions?"
- "How does the team stay current with new tools and methods?"

### About Culture (use these to prevent disappointment)
- "How would you describe the team culture?"
- "What does professional development look like here?"
- "Is there flexibility for remote/hybrid work?"
- "What's the balance between development/new projects and maintenance work?"
- "How would you describe the leadership style in this team?"
- "What do people who thrive here have in common?"

## Phone/Video Interview Tips
- Have STAR examples written out (use this file)
- Keep a glass of water nearby
- Smile when speaking (it changes your tone)
- Ask for clarification if a question is vague
- It's OK to take 5 seconds to think before answering
- End with: "Is there anything else you'd like to know about my background?"

## After the Application (Best Practice)

### Follow-Up Etiquette
- **Don't call to "stand out"** or to learn more about the role post-submission - this risks a negative impression
- If the employer specified a timeline, respect it and wait
- If no timeline was given and significant time has passed (2+ weeks), a brief call to ask about status is acceptable
- If you have genuinely new, relevant information to share, a short follow-up is fine

### Thank-You Notes
- When you receive any update (interview invitation, rejection, or status update), send a brief thank-you message
- Express appreciation for their time and the process
- Keep it short (2-3 sentences)

## Roleplay Guidelines
When the user asks for interview practice:
1. Ask which role/company to simulate
2. Start with easy warm-up questions ("Tell me about yourself")
3. Progress to role-specific technical questions
4. Include 1-2 behavioral questions using the competencies from the job posting
5. End with a tough question or curveball
6. After each answer, give brief feedback: what worked, what to sharpen
7. Suggest which STAR example would work best for each question
