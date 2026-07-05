# Job Application Assistant for Christopher Gillis

## Role
This repo is a job application workspace. Claude acts as a career advisor and application assistant for Christopher Gillis, helping with:
1. **Job fit evaluation** - Assess job postings against your profile (skills, experience, behavioral traits)
2. **CV tailoring** - Adapt existing CV templates (LaTeX/moderncv) to target specific roles
3. **Cover letter writing** - Draft targeted cover letters using existing templates (LaTeX)
4. **Interview preparation** - Prepare answers, questions, and talking points for interviews
5. **Career strategy** - Advise on positioning and personal branding

## Candidate Profile

### Identity
- **Name:** Christopher Gillis
- **Location:** Tampa, FL, USA (Tampa Bay area). Remote-first: strongly prefers fully remote (US), open to hybrid/onsite locally, not relocating.
- **Languages:** English (native)
- **Status:** Employed - Software Engineer at Agent.ai (open to new opportunities)
- **LinkedIn headline:** "Senior Full Stack Engineer"
- **Contact:** christopher.l.gillis@gmail.com | 813-440-7962 | linkedin.com/in/christopher-gillis-no-but-really | github.com/Chris-Gillis

### Education
- **B.S. in Computer Science** (2011) - University of South Florida, Tampa, FL
- **B.A. in Psychology** (2007) - University of South Florida, Tampa, FL

### Professional Experience
- **Software Engineer** (Mar 2025 - Present) - **Agent.ai** (Marketplace for AI Agents; remote)
  - Re-architected a flaky serverless AWS Lambda workflow, cutting related support tickets by 55%
  - Built AI-assisted Agent Builder / Knowledge Builder features used by 3,000+ builders
  - Designed a secure MCP client using OAuth Dynamic Client Registration; implemented HubSpot CRM integrations; raised frontend test coverage from 0% to 50%
- **Software Engineer** (Jul 2023 - Mar 2025) - **Zift Solutions (Unifyr)** (Partner channel automation)
  - Delivered 100+ features on a multi-tenant platform serving 2,000+ customers
  - Extended Salesforce, HubSpot, and Workato integrations; improved a public-facing API via production support rotation
- **Technology Advisor** (Apr 2023 - Mar 2025) - **Helmur** (Funnel analytics)
  - Designed and provisioned production AWS infra with Terraform (VPC, RDS, ECS/Fargate, S3, DynamoDB, CloudFront, SES, Cognito); shaped roadmap and process
- **Senior Software Engineer** (Sep 2022 - Jul 2023) - **Spaceback** (Social-media ad platform)
  - Led a Rails-monolith to Rails+Go services migration; built a caching layer cutting load times 20-25%
- **Senior Software Engineer** (Jan 2022 - Sep 2022) - **OneScreen.ai** (Out-of-home ad marketplace)
  - Led Express-to-NestJS backend migration; set API contract guidelines; code reviews across 8 engineers
- **Staff Software Engineer** (Aug 2019 - Jan 2022) - **HomeCare Connect, LLC** (Workers-comp claims)
  - Led/mentored junior developers; built a Flyway migration system
- **Senior Associate - Engineer** (Jun 2018 - Aug 2019) - **PricewaterhouseCoopers**
  - Built a data-lake ingestion web app; mentored junior developers
- **Senior Developer** (Oct 2014 - Jun 2018) - **Applied Technical Systems** (USPTO application development)
  - Led a reusable React component library; lead front-end dev on a pricing-rules builder
- **Early career:** VBrick Systems, Masonite, HealthESystems, TechHealth

### Independent Projects
- **Chesscraft (chesscraft.ai)** - Full-stack SaaS built end-to-end; real-time WebSocket features; PostgreSQL fuzzy search (pg_trgm). React, Inertia.js, PHP/Laravel, Supabase, WASM.
- **AoR (aorhq.org)** - AI-assisted intake flow (NL to structured/validated requests); pgvector-backed matching/discovery; multi-role access control. React, Inertia.js, PHP/Laravel.

### Technical Skills
- **Primary:** Go, TypeScript/JavaScript, Java, React/Next.js, Node/NestJS, Spring Boot, PostgreSQL/MySQL, AWS, Terraform, authentication/OAuth, distributed & multi-tenant systems
- **Secondary:** Python/Flask, PHP/Laravel, Ruby on Rails, Angular, Docker, Celery, caching, vector search (pgvector), CI/CD
- **Domain:** AI-agent platforms & MCP integrations, B2B SaaS, marketplaces, martech/adtech, enterprise integrations (Salesforce, HubSpot, Workato)
- **Software:** AWS (Lambda, ECS/Fargate, RDS, S3, DynamoDB, CloudFront, SES, Cognito), Terraform, Docker, Heroku, Claude Code

### Certifications
- None on record.

### Publications
- None on record.

### Awards
- None on record.

### Behavioral Profile
<!-- Inferred from resume at setup; see 02-behavioral-profile.md. Confirm/refine before heavy reliance. -->
- **High ownership** - Takes unreliable/ambiguous systems and makes them dependable, end-to-end
- **Reliability & quality focus** - Track record of cutting tickets/defects and raising test coverage
- **Strengths:** Full-stack breadth, migrations/modernization, mentoring small teams, cross-functional delivery
- **Growth areas:** (to confirm)
- **Thrives in:** High-autonomy environments with real ownership and low process overhead

### What Excites You
- AI / agentic product work (LLMs, agents, MCP, AI-assisted workflows)
- Hard technical / systems problems owned end-to-end with high autonomy

### Target Sectors
- AI / ML startups & agent platforms: e.g. Anthropic, OpenAI, LangChain, Hugging Face, Perplexity
- B2B SaaS / platform companies: multi-tenant SaaS, developer/platform tooling
- Big tech / established product companies
- Early-stage startups (founding / early engineer)

### Deal-breakers
- No remote option (fully-onsite outside Tampa Bay) - remote-first is a hard requirement
- Relocation required
- Roles gated on credentials Christopher does not have (e.g. ML-research/PhD-required positions)

## Repo Structure
- `cv/` - LaTeX CV variants (moderncv template, banking style)
- `cover_letters/` - LaTeX cover letters (custom cover.cls template)
- `.claude/skills/` - AI skill definitions for the application workflow
- `.agents/skills/` - Job search CLI tools

## Workflow for New Job Applications
1. User provides a job posting (URL or text)
2. **Always evaluate fit first**: skills match, experience match, behavioral/culture match. Present this assessment to the user before proceeding.
3. If good fit: create targeted CV (`cv/main_<company>.tex`) and cover letter (`cover_letters/cover_<company>_<role>.tex`)
4. **Verify both documents** (see Verification Checklist below)
5. Prepare interview talking points based on the role requirements and your strengths

**Important:** When mentioning agentic coding or AI tooling in CVs/cover letters, explicitly reference **Claude Code** by name.

## Verification Checklist
After creating or updating a CV or cover letter, re-read the generated file and verify **all** of the following before presenting to the user. Report the results as a pass/fail checklist.

### Factual accuracy
- [ ] All claims match actual profile (CLAUDE.md / candidate profile) - no fabricated skills, experience, or achievements
- [ ] Job titles, dates, company names, and locations are correct
- [ ] Contact details are correct
- [ ] All company-specific claims (partnerships, products, technology, expansions) have been independently verified via WebFetch/WebSearch - do not trust reviewer agent research without verification

### Targeting
- [ ] Profile statement / opening paragraph is tailored to the specific role (not generic)
- [ ] Skills and experience bullets are reframed to match the job requirements
- [ ] Key job requirements are addressed (with gaps acknowledged where relevant)
- [ ] Nice-to-have requirements are highlighted where there is a match

### Consistency
- [ ] CV follows the standard 2-page moderncv/banking format
- [ ] Cover letter uses cover.cls template and established structure
- [ ] Tone is consistent across CV and cover letter
- [ ] No contradictions between CV and cover letter content

### Quality
- [ ] No LaTeX syntax errors (balanced braces, correct commands)
- [ ] No spelling or grammar errors
- [ ] Agentic coding / AI tooling references mention **Claude Code** by name
- [ ] Cover letter is addressed to the correct person (or "Dear Hiring Manager" if unknown)
- [ ] Cover letter fits approximately one page

### Compiled PDF verification (MANDATORY - never skip)
Both documents MUST be compiled and visually inspected via the Read tool on the PDF output. "Looks fine in the .tex" is not acceptable - LaTeX page-break decisions are unpredictable. Iterate until these all pass:
- [ ] CV compiled with **lualatex** (pdflatex often fails on modern MiKTeX with fontawesome5 font-expansion errors). Cover letter compiled with **xelatex** (cover.cls requires fontspec).
- [ ] **CV is exactly 2 pages** - not 1, not 3
- [ ] **No orphaned `\cventry` titles** - a job/education title must never sit at the bottom of a page with its bullets spilling to the next page. Use `\needspace{5\baselineskip}` before each `\cventry` to prevent this, and `\enlargethispage{2-3\baselineskip}` to rescue a trailing section that just barely spills
- [ ] **Cover letter is exactly 1 page** - signature block must fit with the body, never overflow
- [ ] **Cover letter bullet font matches body font** - `\lettercontent{}` must not wrap `\begin{itemize}...\end{itemize}` (the command's trailing `\\` errors on `\end{itemize}`, and moving itemize outside loses the Raleway font). Standard pattern: close `\lettercontent{}`, then wrap the list in `{\raggedright\fontspec[Path = OpenFonts/fonts/raleway/]{Raleway-Medium}\fontsize{11pt}{13pt}\selectfont \begin{itemize}...\end{itemize}\par}`
