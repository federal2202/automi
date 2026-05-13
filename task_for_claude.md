PROJECT GOAL

Create a lightweight scheduling system on top of Google Calendar.

The system should:
- help users organize recurring parts of their life
- support changing schedules (students, shift workers, etc.)
- generate calendar events automatically
- avoid duplicate Google Calendar events
- allow safe update/delete of generated events
- prepare the project for future AI scheduling

Google Calendar remains the main event storage.

Our backend only stores:
- recurring rules
- periods
- metadata mappings


==================================================
MAIN PRODUCT IDEA
==================================================

The application should feel like:

"Build your life structure once, then let the system organize your calendar."

NOT:
- complicated calendar management
- manual recurring setup every time

The user should:
1. describe their lifestyle
2. create active periods
3. define recurring activities
4. let the system generate calendar events automatically


==================================================
MAIN USER FLOW
==================================================

1. User enters onboarding

2. User describes their lifestyle:
- study
- work
- sleep
- training
- routines

3. User creates periods:
- Fall Semester
- Summer
- Vacation
- Exam Period

4. User adds recurring schedule rules inside periods

5. Backend generates Google Calendar events for next 7 days

6. System prevents duplicates and safely syncs updates/deletions


==================================================
IMPORTANT TERMINOLOGY
==================================================

Use understandable terminology in UI.

DO NOT use:
- rule engine
- recurrence system
- scheduler config

USE:

Periods
= phases of life

Examples:
- Fall Semester
- Summer Break
- Internship Period


Recurring Activities
= repeated schedule items

Examples:
- University classes
- Gym
- Work shifts
- Sleep routine


Lifestyle Setup
= onboarding questionnaire


==================================================
FRONTEND DEVELOPMENT PLAN
==================================================


==================================================
STEP 1 — ONBOARDING FLOW
==================================================

GOAL:
Collect basic user lifestyle information.

Create onboarding flow called:

"Lifestyle Setup"


--------------------------------------------------
Frontend Tasks
--------------------------------------------------

Create onboarding screens for:

1. Basic lifestyle

Questions:
- Are you studying?
- Are you working?
- Do you have recurring routines?


2. Sleep preferences

Questions:
- Typical sleep time
- Typical wake-up time


3. Productivity preferences

Questions:
- Morning or evening productivity
- Preferred focus hours


4. Schedule type

Questions:
- Stable schedule
- Different every week
- Semester-based schedule


--------------------------------------------------
Frontend Result
--------------------------------------------------

After onboarding:
- user reaches dashboard
- onboarding data saved in backend


--------------------------------------------------
Backend Tasks
--------------------------------------------------

Create endpoint for onboarding data.

Store:
- preferences
- lifestyle information
- productivity preferences


==================================================
STEP 2 — PERIODS SYSTEM
==================================================

GOAL:
Allow users to organize life into periods.


--------------------------------------------------
Frontend Tasks
--------------------------------------------------

Create "Periods" page.

User should be able to:
- create period
- edit period
- delete period
- view active period


--------------------------------------------------
Example UI
--------------------------------------------------

[ Fall Semester ]
Sep 1 → Jan 20

[ Summer Break ]
Jun 1 → Aug 31


--------------------------------------------------
Backend Tasks
--------------------------------------------------

Create:
- Period model
- CRUD endpoints

Fields:
- id
- title
- startDate
- endDate
- userId


==================================================
STEP 3 — RECURRING ACTIVITIES
==================================================

GOAL:
Allow users to define repeated schedule activities inside periods.


--------------------------------------------------
Frontend Tasks
--------------------------------------------------

Inside Period page:
create "Recurring Activities" section.

User can:
- add activity
- edit activity
- delete activity


--------------------------------------------------
Example Activities
--------------------------------------------------

Physics
Monday
09:00 → 11:00

Gym
Wednesday
18:00 → 20:00


--------------------------------------------------
Backend Tasks
--------------------------------------------------

Create:
- PeriodEvent model
- CRUD endpoints

Fields:
- id
- periodId
- title
- dayOfWeek
- startTime
- endTime


==================================================
STEP 4 — GOOGLE EVENT GENERATION
==================================================

GOAL:
Automatically generate Google Calendar events from recurring activities.


--------------------------------------------------
IMPORTANT
--------------------------------------------------

DO NOT use Google recurring events.

Generate individual events manually.


--------------------------------------------------
Backend Tasks
--------------------------------------------------

Create generation service.

Flow:

1. Find active period

2. Get recurring activities

3. Generate events only for next 7 days

4. Create Google Calendar events


==================================================
STEP 5 — SYNCED EVENTS MAPPING
==================================================

GOAL:
Prevent duplicates and support safe deletion/update.


--------------------------------------------------
Backend Tasks
--------------------------------------------------

Create SyncedEvents table.

Fields:
- id
- userId
- googleEventId
- sourceType
- sourceId
- date


--------------------------------------------------
Purpose
--------------------------------------------------

Connect:
Recurring Activity
↔
Google Calendar Event


==================================================
STEP 6 — DUPLICATE PREVENTION
==================================================

GOAL:
Avoid generating duplicate Google events.


--------------------------------------------------
Backend Flow
--------------------------------------------------

Before creating Google event:

Check SyncedEvents:

Search by:
- sourceType
- sourceId
- date


IF EXISTS:
→ skip generation

IF NOT EXISTS:
→ create Google event
→ save mapping


==================================================
STEP 7 — SAFE DELETION
==================================================

GOAL:
Correctly delete generated Google events.


--------------------------------------------------
Example
--------------------------------------------------

User deletes:
Physics Monday 09:00


--------------------------------------------------
Backend Flow
--------------------------------------------------

1. Find related SyncedEvents

2. Get googleEventId

3. Delete Google event

4. Delete mapping rows


==================================================
STEP 8 — SAFE UPDATE
==================================================

GOAL:
Correctly update generated Google events.


--------------------------------------------------
Example
--------------------------------------------------

Gym Monday 18:00
→ changed to 20:00


--------------------------------------------------
Backend Flow
--------------------------------------------------

1. Find related SyncedEvents

2. Get googleEventId

3. Update Google event

4. Keep mapping


IMPORTANT:
Do NOT recreate all events.


==================================================
CURRENT MVP SCOPE
==================================================

INCLUDED:
- onboarding
- periods
- recurring activities
- Google Calendar generation
- duplicate prevention
- safe deletion/update


NOT INCLUDED YET:
- AI scheduling
- task prioritization
- free slot engine
- smart rescheduling
- internal calendar storage
- advanced recurrence logic


==================================================
FINAL MVP IDEA
==================================================

User describes life structure once.

System automatically maintains Google Calendar safely and predictably.

This architecture prepares the project for future AI scheduling without requiring a complete rewrite later.